<?php

namespace App\Services;

use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\Autolink\AutolinkExtension;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\MarkdownConverter;

class MarkdownService
{
    private MarkdownConverter $converter;

    public function __construct()
    {
        $environment = new Environment([
            'html_input' => 'allow',          // allow inline HTML from the course content
            'allow_unsafe_links' => false,
        ]);
        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new TableExtension());
        $environment->addExtension(new AutolinkExtension());

        $this->converter = new MarkdownConverter($environment);
    }

    public function toHtml(?string $markdown): ?string
    {
        if ($markdown === null || trim($markdown) === '') {
            return null;
        }

        $html = (string) $this->converter->convert($markdown);

        return $this->unwrapMermaid($html);
    }

    /**
     * Turn ```mermaid fenced blocks into <div class="mermaid"> so the frontend
     * can render them as diagrams. HTML entities are kept: Mermaid reads the
     * element's (decoded) textContent.
     */
    private function unwrapMermaid(string $html): string
    {
        return preg_replace(
            '#<pre><code class="language-mermaid">(.*?)</code></pre>#s',
            '<div class="mermaid">$1</div>',
            $html,
        ) ?? $html;
    }
}
