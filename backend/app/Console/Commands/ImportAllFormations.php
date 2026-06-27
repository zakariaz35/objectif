<?php

namespace App\Console\Commands;

use App\Models\Formation;
use App\Services\FormationImporter;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Symfony\Component\Yaml\Yaml;

#[Signature('formation:import-all {path : Dossier contenant une ou plusieurs formations} {--force : Réimporte même si la formation existe déjà (écrase la progression)}')]
#[Description('Importe les formations absentes d\'un répertoire (idempotent, non destructif par défaut)')]
class ImportAllFormations extends Command
{
    public function handle(FormationImporter $importer): int
    {
        $path = $this->argument('path');

        if (! is_dir($path)) {
            $this->warn("Dossier introuvable : {$path} (rien à importer)");

            return self::SUCCESS;
        }

        $force = (bool) $this->option('force');
        $imported = 0;
        $skipped = 0;

        foreach (scandir($path) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $dir = $path.DIRECTORY_SEPARATOR.$entry;
            if (! is_dir($dir)) {
                continue;
            }

            $manifest = $this->manifest($dir);
            if ($manifest === null) {
                continue; // pas une formation (pas de formation.yaml)
            }

            $slug = $this->slugFor($manifest, $entry);

            // Non destructif : on ne réimporte pas une formation déjà présente
            // (préserve la progression liée aux leçons) sauf --force.
            if (! $force && Formation::where('slug', $slug)->exists()) {
                $this->line("↷ {$slug} déjà présente — ignorée");
                $skipped++;

                continue;
            }

            try {
                $f = $importer->importDirectory($dir);
                $lessons = $f->modules->sum(fn ($m) => $m->lessons->count());
                $this->info("✔ {$f->title} ({$f->slug}) — {$f->modules->count()} modules, {$lessons} leçons");
                $imported++;
            } catch (\Throwable $e) {
                $this->error("✗ {$entry} : {$e->getMessage()}");
            }
        }

        $this->info("Import terminé : {$imported} importée(s), {$skipped} ignorée(s).");

        return self::SUCCESS;
    }

    /** @return array<string,mixed>|null */
    private function manifest(string $dir): ?array
    {
        foreach (['formation.yaml', 'formation.yml'] as $name) {
            if (is_file("$dir/$name")) {
                return Yaml::parseFile("$dir/$name") ?: [];
            }
        }

        return null;
    }

    /** Même logique de slug que l'importer (slug explicite, sinon dérivé). */
    private function slugFor(array $manifest, string $dirName): string
    {
        $title = $manifest['title'] ?? $dirName;
        $base = preg_replace('/^\d+[-_.\s]+/', '', $title) ?: $title;

        return $manifest['slug'] ?? Str::slug($base);
    }
}
