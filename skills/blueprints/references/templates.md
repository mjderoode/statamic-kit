# Partials and components for sets

Each new set needs a template on the project's dispatch path
(`project-detection.md` §5). Model it on the **closest sibling** partial: same
wrapper element and class pattern, same empty-field guards, same comment style.
No hard-coded sample content; no CSS classes or frameworks the siblings don't use.

## Antlers partial

Path: `resources/views/<dir>/<set>.antlers.html`, where `<dir>` comes from the
dispatching `{{ partial src="<dir>/{type}" }}` — confirm against where the
existing sibling partials actually live. The set's fields are in scope directly.

```antlers
{{# FAQ: heading plus question/answer items. #}}
<section class="block block-faq">
    {{ if heading }}
        <h2>{{ heading }}</h2>
    {{ /if }}
    {{ items }}
        <details>
            <summary>{{ question }}</summary>
            {{ answer }}
        </details>
    {{ /items }}
</section>
```

## Blade anonymous component

Path: `resources/views/components/<prefix>/<set>.blade.php` for
`<x-dynamic-component :component="'<prefix>.'.$block['type']" :block="$block" />`.
Read fields from the prop the dispatcher passes (here `$block`).

```blade
@props(['block'])

{{-- FAQ: heading plus question/answer items. --}}
<section class="block-faq">
    @if ($block['heading'])
        <h2>{{ $block['heading'] }}</h2>
    @endif
    @foreach ($block['items'] ?? [] as $item)
        <details>
            <summary>{{ $item['question'] }}</summary>
            {{ $item['answer'] }}
        </details>
    @endforeach
</section>
```

Escape with `{{ }}` (as above, where `answer` is a `textarea`). Use `{!! !!}` only
for fields that store HTML — Bard with `save_html: true`, or Markdown the project
renders to HTML — and only if sibling components do the same.

## Field handles

Every variable in the template must be a field handle on the new set (or on its
grid rows). Re-read the YAML you wrote before writing the template.
