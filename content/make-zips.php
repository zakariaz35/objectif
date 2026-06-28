<?php

// Builds one importable .zip per formation (any subfolder with a formation.yaml).
// Usage: php content/make-zips.php
// The .zip files are git-ignored (build artifacts) — regenerate them anytime.

$base = __DIR__;

foreach (scandir($base) as $entry) {
    if ($entry === '.' || $entry === '..') {
        continue;
    }
    $dir = "$base/$entry";
    if (! is_dir($dir) || ! is_file("$dir/formation.yaml")) {
        continue;
    }

    $zipPath = "$base/$entry.zip";
    @unlink($zipPath);

    $zip = new ZipArchive();
    $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);

    $count = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        $zip->addFile($file->getPathname(), substr($file->getPathname(), strlen($dir) + 1));
        $count++;
    }
    $zip->close();

    printf("✔ %-28s %d fichiers, %d Ko\n", "$entry.zip", $count, round(filesize($zipPath) / 1024));
}
