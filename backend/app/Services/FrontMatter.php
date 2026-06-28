<?php

namespace App\Services;

use Symfony\Component\Yaml\Yaml;

class FrontMatter
{
    /**
     * Splits the YAML front-matter from the Markdown body.
     *
     * @return array{0: array<string,mixed>, 1: string} [meta, body]
     */
    public static function parse(string $raw): array
    {
        $raw = ltrim($raw, "\xEF\xBB\xBF"); // BOM
        $raw = preg_replace('/^\s+/', '', $raw) ?? $raw;

        if (str_starts_with($raw, '---')) {
            // ---\n ... \n---\n body
            if (preg_match('/^---\s*\n(.*?)\n---\s*\n?(.*)$/s', $raw, $m)) {
                $meta = Yaml::parse(trim($m[1])) ?? [];
                if (! is_array($meta)) {
                    $meta = [];
                }

                return [$meta, $m[2]];
            }
        }

        return [[], $raw];
    }
}
