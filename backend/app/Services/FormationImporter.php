<?php

namespace App\Services;

use App\Models\Formation;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\Yaml\Yaml;
use ZipArchive;

class FormationImporter
{
    public function __construct(private readonly MarkdownService $markdown) {}

    /**
     * Importe une formation depuis un fichier .zip de Markdown.
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
     * Importe une formation depuis un dossier déjà décompressé.
     */
    public function importDirectory(string $root, ?string $fallbackName = null): Formation
    {
        $meta = $this->readFormationMeta($root, $fallbackName);

        return DB::transaction(function () use ($root, $meta) {
            $formation = Formation::updateOrCreate(
                ['slug' => $meta['slug']],
                ['title' => $meta['title'], 'description' => $meta['description'] ?? null, 'position' => $meta['position'] ?? 0],
            );

            // Réimport propre : on repart de zéro pour cette formation.
            $formation->modules()->delete();

            $moduleDirs = $this->orderedChildren($root, true);
            $modulePos = 0;

            foreach ($moduleDirs as $dir) {
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

        // Sépare énoncé / correction sur le marqueur <!--correction-->
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
            'body_html' => $this->markdown->toHtml($body),
            'correction_md' => $correctionMd ? trim($correctionMd) : null,
            'correction_html' => $this->markdown->toHtml($correctionMd),
            'meta' => $meta ?: null,
        ]);

        // Quiz noté : questions structurées en front-matter (clé "questions").
        if (! empty($meta['questions']) && is_array($meta['questions'])) {
            $this->importQuizQuestions($lesson, $meta['questions']);
        }
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
                    ? $this->markdown->toHtml((string) $q['explanation'])
                    : null,
            ]);
        }
    }

    /** Markdown inline (sans le <p> englobant) pour énoncés et options courts. */
    private function inlineHtml(string $text): string
    {
        $html = (string) $this->markdown->toHtml($text);

        return preg_replace('/^<p>(.*)<\/p>\s*$/s', '$1', trim($html)) ?? $html;
    }

    // ---- Lecture des métadonnées ----

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

    // ---- Helpers fichiers ----

    /** Enlève un préfixe numérique d'ordre type "01-". */
    private function stripPrefix(string $name): string
    {
        return preg_replace('/^\d+[-_.\s]+/', '', $name) ?: $name;
    }

    /**
     * Enfants triés (dossiers ou fichiers) par préfixe numérique puis alpha.
     *
     * @return list<string> chemins absolus
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

    /** Localise le dossier racine de la formation (celui qui contient formation.yaml ou des modules). */
    private function findFormationRoot(string $tmpDir): string
    {
        // Cas 1 : formation.yaml à la racine d'extraction.
        if ($this->hasFormationYaml($tmpDir)) {
            return $tmpDir;
        }

        // Cas 2 : un unique dossier racine (zip "wrappé").
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
