@props(['block'])

{{-- Uitgelicht: label, korte tekst en optionele link. --}}
<aside class="mx-auto w-full max-w-measure rounded bg-paper-deep p-6">
    @if ($block['label'])
        <p class="ui-label text-ink-faint">{{ $block['label'] }}</p>
    @endif
    @if ($block['text'])
        <div class="mt-2 text-ink">{!! $block['text'] !!}</div>
    @endif
    @if ($block['link'] && $block['link_label'])
        <a class="btn mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" href="{{ $block['link'] }}">{{ $block['link_label'] }}</a>
    @endif
</aside>
