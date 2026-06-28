<?php

namespace App\Services;

use App\Models\Formation;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\Yaml\Yaml;
use ZipArchive;

class FormationImporter
{
    /** Base URL of the current course's bundled assets (set during import). */
    private string $assetBaseUrl = '';

    public function __construct(private readonly MarkdownService $markdown) {}

    /**
     * Imports a course from a Markdown .zip file.
     */
    public function importZip(string $zipPath, ?string $fallbackName = null): Formation
    {
        $tmpDir = storage_path('app/import-'.Str::random(12));
        $this->extract($zipPath, $tmpDir);

        try {
            $root = $this->findFormationRoot($tmpDir);

            return $this->importDirectory($root, $fallbackName);
        } finally {
            $this->rrmdir($tmpDir);
        }
    }

    /**
     * Imports a course from an already-extracted directory.
     */
    public function importDirectory(string $root, ?string $fallbackName = null): Formation
    {
        $meta = $this->readFormationMeta($root, $fallbackName);

        return DB::transaction(function () use ($root, $meta) {
            $formation = Formation::updateOrCreate(
                ['slug' => $meta['slug']],
                [
                    'title' => $meta['title'],
                    'description' => $meta['description'] ?? null,
                    'stack' => $meta['stack'] ?? null,
                    'track' => $meta['track'] ?? null,
                    'position' => $meta['position'] ?? 0,
                ],
            );

            // Clean re-import: start from scratch for this course.
            $formation->modules()->delete();

            // Copy bundled images (assets/) and prepare their public base URL.
            $this->importAssets($root, $formation->slug);

            $moduleDirs = $this->orderedChildren($root, true);
            $modulePos = 0;

            foreach ($moduleDirs as $dir) {
                if (basename($dir) === 'assets') {
                    continue; // not a module: it holds bundled images
                }
                $modulePos++;
                $moduleMeta = $this->readModuleMeta($dir, $modulePos);

                $module = $formation->modules()->create([
                    'slug' => $moduleMeta['slug'],
                    'title' => $moduleMeta['title'],
                    'position' => $moduleMeta['position'],
                ]);

                $lessonFiles = $this->orderedChildren($dir, false);
                $lessonPos = 0;

                foreach ($lessonFiles as $file) {
                    if (! str_ends_with(strtolower($file), '.md')) {
                        continue;
                    }
                    $lessonPos++;
                    $this->importLesson($module, $file, $lessonPos);
                }
            }

            return $formation->load('modules.lessons');
        });
    }

    private function importLesson(Module $module, string $file, int $defaultPos): void
    {
        $raw = file_get_contents($file);
        [$meta, $body] = FrontMatter::parse($raw);

        // Split statement / solution on the <!--correction--> marker
        $correctionMd = null;
        if (preg_match('/<!--\s*correction\s*-->/i', $body)) {
            [$body, $correctionMd] = preg_split('/<!--\s*correction\s*-->/i', $body, 2);
        }

        $base = $this->stripPrefix(pathinfo($file, PATHINFO_FILENAME));

        $lesson = $module->lessons()->create([
            'slug' => $meta['slug'] ?? Str::slug($base),
            'title' => $meta['title'] ?? Str::title(str_replace('-', ' ', $base)),
            'type' => $meta['type'] ?? 'lesson',
            'position' => (int) ($meta['order'] ?? $meta['position'] ?? $defaultPos),
            'body_md' => trim($body),
            'body_html' => $this->render($body),
            'correction_md' => $correctionMd ? trim($correctionMd) : null,
            'correction_html' => $this->render($correctionMd),
            'meta' => $meta ?: null,
            'exercise' => $this->normalizeExercise($meta['exercise'] ?? null),
            'cards' => $this->normalizeCards($meta['cards'] ?? null),
        ]);

        // Graded quiz: questions structured in front-matter (the "questions" key).
        if (! empty($meta['questions']) && is_array($meta['questions'])) {
            $this->importQuizQuestions($lesson, $meta['questions']);
        }
    }

    /**
     * Optional interactive exercise (the "exercise" key in the front-matter).
     *
     * @return array{language:string, starter:string, tests:list<array{name:string, code:string}>}|null
     */
    private function normalizeExercise(mixed $exercise): ?array
    {
        if (! is_array($exercise) || empty($exercise['tests'])) {
            return null;
        }

        $tests = [];
        foreach ($exercise['tests'] as $i => $t) {
            if (! is_array($t) || empty($t['code'])) {
                continue;
            }
            $tests[] = [
                'name' => (string) ($t['name'] ?? 'Test '.($i + 1)),
                'code' => (string) $t['code'],
            ];
        }

        if (! $tests) {
            return null;
        }

        return [
            'language' => (string) ($exercise['language'] ?? 'js'),
            'starter' => (string) ($exercise['starter'] ?? ''),
            'tests' => $tests,
        ];
    }

    /**
     * Optional memo cards (the "cards" key in the front-matter).
     *
     * @return list<array{q_html:string, a_html:string}>|null
     */
    private function normalizeCards(mixed $cards): ?array
    {
        if (! is_array($cards) || empty($cards)) {
            return null;
        }

        $out = [];
        foreach ($cards as $c) {
            if (! is_array($c)) {
                continue;
            }
            $q = $c['q'] ?? $c['question'] ?? null;
            $a = $c['a'] ?? $c['answer'] ?? $c['reponse'] ?? null;
            if (! $q || ! $a) {
                continue;
            }
            $out[] = [
                'q_html' => (string) $this->render((string) $q),
                'a_html' => (string) $this->render((string) $a),
            ];
        }

        return $out ?: null;
    }

    /**
     * @param  array<int,array<string,mixed>>  $questions
     */
    private function importQuizQuestions(Lesson $lesson, array $questions): void
    {
        $pos = 0;
        foreach ($questions as $q) {
            $pos++;
            $options = array_map(
                fn ($opt) => ['html' => $this->inlineHtml((string) $opt)],
                $q['options'] ?? [],
            );

            $lesson->quizQuestions()->create([
                'position' => $pos,
                'prompt_html' => $this->inlineHtml((string) ($q['prompt'] ?? $q['question'] ?? '')),
                'options' => $options,
                'correct_index' => (int) ($q['answer'] ?? $q['correct'] ?? 0),
                'explanation_html' => isset($q['explanation'])
                    ? $this->render((string) $q['explanation'])
                    : null,
            ]);
        }
    }

    /** Inline Markdown (without the wrapping <p>) for short prompts and options. */
    private function inlineHtml(string $text): string
    {
        $html = (string) $this->render($text);

        return preg_replace('/^<p>(.*)<\/p>\s*$/s', '$1', trim($html)) ?? $html;
    }

    // ---- Bundled image assets ----

    /**
     * Render Markdown to HTML and point bundled image URLs to public storage.
     */
    private function render(?string $markdown): ?string
    {
        $html = $this->markdown->toHtml($markdown);

        return $html === null ? null : $this->rewriteAssetUrls($html);
    }

    /**
     * Rewrite relative "assets/..." image sources to their public storage URL.
     * Leaves absolute URLs (http, //, /) untouched.
     */
    private function rewriteAssetUrls(string $html): string
    {
        if ($this->assetBaseUrl === '') {
            return $html;
        }

        return preg_replace_callback(
            '/(src|href)="((?:\.\/|\.\.\/)*assets\/[^"]+)"/i',
            function ($m) {
                $path = ltrim(preg_replace('#^(?:\./|\.\./)+#', '', $m[2]), '/');

                return $m[1].'="'.$this->assetBaseUrl.'/'.$path.'"';
            },
            $html,
        ) ?? $html;
    }

    /** Copy the course's assets/ folder to public storage and set the base URL. */
    private function importAssets(string $root, string $slug): void
    {
        $dest = storage_path("app/public/formations/{$slug}");
        File::deleteDirectory($dest);

        $source = $root.DIRECTORY_SEPARATOR.'assets';
        if (is_dir($source)) {
            File::copyDirectory($source, $dest.'/assets');
        }

        $this->assetBaseUrl = rtrim((string) config('app.url'), '/')."/storage/formations/{$slug}";
    }

    // ---- Reading metadata ----

    private function readFormationMeta(string $root, ?string $fallbackName): array
    {
        $meta = [];
        foreach (['formation.yaml', 'formation.yml'] as $name) {
            $path = $root.DIRECTORY_SEPARATOR.$name;
            if (is_file($path)) {
                $meta = Yaml::parseFile($path) ?: [];
                break;
            }
        }

        $title = $meta['title'] ?? $fallbackName ?? basename($root);
        $slug = $meta['slug'] ?? Str::slug($this->stripPrefix($title));

        return [
            'title' => $title,
            'slug' => $slug,
            'description' => $meta['description'] ?? null,
            'stack' => $meta['stack'] ?? $meta['framework'] ?? null,
            'track' => $meta['track'] ?? null,
            'position' => (int) ($meta['order'] ?? $meta['position'] ?? 0),
        ];
    }

    private function readModuleMeta(string $dir, int $defaultPos): array
    {
        $meta = [];
        foreach (['module.yaml', 'module.yml'] as $name) {
            $path = $dir.DIRECTORY_SEPARATOR.$name;
            if (is_file($path)) {
                $meta = Yaml::parseFile($path) ?: [];
                break;
            }
        }

        $base = $this->stripPrefix(basename($dir));

        return [
            'title' => $meta['title'] ?? Str::title(str_replace('-', ' ', $base)),
            'slug' => $meta['slug'] ?? Str::slug($base),
            'position' => (int) ($meta['order'] ?? $meta['position'] ?? $defaultPos),
        ];
    }

    // ---- File helpers ----

    /** Removes a numeric ordering prefix such as "01-". */
    private function stripPrefix(string $name): string
    {
        return preg_replace('/^\d+[-_.\s]+/', '', $name) ?: $name;
    }

    /**
     * Children (directories or files) sorted by numeric prefix then alphabetically.
     *
     * @return list<string> absolute paths
     */
    private function orderedChildren(string $dir, bool $dirsOnly): array
    {
        $items = [];
        foreach (scandir($dir) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $path = $dir.DIRECTORY_SEPARATOR.$entry;
            if ($dirsOnly && ! is_dir($path)) {
                continue;
            }
            if (! $dirsOnly && ! is_file($path)) {
                continue;
            }
            $items[] = $path;
        }

        sort($items, SORT_NATURAL | SORT_FLAG_CASE);

        return $items;
    }

    /** Locates the course root directory (the one containing formation.yaml or modules). */
    private function findFormationRoot(string $tmpDir): string
    {
        // Case 1: formation.yaml at the extraction root.
        if ($this->hasFormationYaml($tmpDir)) {
            return $tmpDir;
        }

        // Case 2: a single root directory (a "wrapped" zip).
        $children = $this->orderedChildren($tmpDir, true);
        $files = $this->orderedChildren($tmpDir, false);

        if (count($children) === 1 && count($files) === 0) {
            $only = $children[0];
            if ($this->hasFormationYaml($only) || count($this->orderedChildren($only, true)) > 0) {
                return $only;
            }
        }

        return $tmpDir;
    }

    private function hasFormationYaml(string $dir): bool
    {
        return is_file($dir.'/formation.yaml') || is_file($dir.'/formation.yml');
    }

    private function extract(string $zipPath, string $dest): void
    {
        $zip = new ZipArchive();
        if ($zip->open($zipPath) !== true) {
            throw new RuntimeException("Impossible d'ouvrir le ZIP : {$zipPath}");
        }
        if (! is_dir($dest)) {
            mkdir($dest, 0775, true);
        }
        $zip->extractTo($dest);
        $zip->close();
    }

    private function rrmdir(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }
        foreach (scandir($dir) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $path = $dir.DIRECTORY_SEPARATOR.$entry;
            is_dir($path) ? $this->rrmdir($path) : @unlink($path);
        }
        @rmdir($dir);
    }
}
