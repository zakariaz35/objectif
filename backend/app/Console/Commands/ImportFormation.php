<?php

namespace App\Console\Commands;

use App\Services\FormationImporter;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('formation:import {path : Chemin vers un .zip ou un dossier de formation}')]
#[Description('Importe une formation depuis un ZIP ou un dossier de Markdown')]
class ImportFormation extends Command
{
    public function handle(FormationImporter $importer): int
    {
        $path = $this->argument('path');

        if (! file_exists($path)) {
            $this->error("Introuvable : {$path}");

            return self::FAILURE;
        }

        try {
            $formation = is_dir($path)
                ? $importer->importDirectory($path)
                : $importer->importZip($path, pathinfo($path, PATHINFO_FILENAME));
        } catch (\Throwable $e) {
            $this->error("Échec : {$e->getMessage()}");

            return self::FAILURE;
        }

        $lessons = $formation->modules->sum(fn ($m) => $m->lessons->count());
        $this->info("✔ « {$formation->title} » ({$formation->slug}) importée : {$formation->modules->count()} modules, {$lessons} leçons.");

        return self::SUCCESS;
    }
}
