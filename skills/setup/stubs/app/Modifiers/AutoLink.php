<?php

namespace App\Modifiers;

use Statamic\Modifiers\Modifier;

/**
 * Turns links inside a block of plain text into anchors.
 *
 * Blocks like the directory store contact details as free-typed lines in a
 * textarea, which keeps the control panel simple but leaves emails and websites
 * unclickable. This escapes the text first, then links what it recognises:
 *
 *   [label](/somewhere)  explicit link, for when the target is not the visible text
 *   name@example.com     mailto:
 *   https://example.com  as written
 *   www.example.com      https:// prefixed
 *   example.com          bare domain, https:// prefixed
 *
 * Each pass runs only on text that is not already inside an anchor, so an
 * earlier match can never be re-linked by a later one.
 *
 * Used as `{{ lines | auto_link | nl2br }}` — app/Modifiers is auto-registered,
 * and the class name becomes the snake_case handle.
 */
class AutoLink extends Modifier
{
    private const MARKDOWN = '/\[([^\]]+)\]\(([^)\s]+)\)/';

    private const EMAIL = '/\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i';

    private const URL = '/\b((?:https?:\/\/|www\.)[^\s<>"]+[^\s<>".,;:!?)])/i';

    private const BARE_DOMAIN = '/(?<![\/@.\w])((?:[a-z0-9-]+\.)+(?:com|net|org|io|nl|be|dev|app)(?:\.[a-z]{2})?)(?![\w.@])/i';

    public function index($value, $params, $context)
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        $text = preg_replace_callback(
            self::MARKDOWN,
            fn ($m) => $this->anchor($m[2], $m[1]),
            e($value)
        );

        return $this->outsideAnchors($text, function (string $chunk) {
            $chunk = preg_replace_callback(self::EMAIL, fn ($m) => $this->anchor('mailto:'.$m[1], $m[1]), $chunk);

            $chunk = $this->outsideAnchors($chunk, fn (string $c) => preg_replace_callback(
                self::URL,
                fn ($m) => $this->anchor(str_starts_with(strtolower($m[1]), 'http') ? $m[1] : 'https://'.$m[1], $m[1]),
                $c
            ));

            return $this->outsideAnchors($chunk, fn (string $c) => preg_replace_callback(
                self::BARE_DOMAIN,
                fn ($m) => $this->anchor('https://'.$m[1], $m[1]),
                $c
            ));
        });
    }

    /**
     * Apply a callback to every stretch of the string that sits outside an <a> element.
     */
    private function outsideAnchors(string $text, callable $callback): string
    {
        $parts = preg_split('/(<a\b[^>]*>.*?<\/a>)/is', $text, -1, PREG_SPLIT_DELIM_CAPTURE);

        return implode('', array_map(
            fn (string $part) => str_starts_with($part, '<a ') ? $part : $callback($part),
            $parts
        ));
    }

    private function anchor(string $href, string $label): string
    {
        return sprintf('<a href="%s" class="text-brand underline underline-offset-2 hover:text-accent">%s</a>', $href, $label);
    }
}
