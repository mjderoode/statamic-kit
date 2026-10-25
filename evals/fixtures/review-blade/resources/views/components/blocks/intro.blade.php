@props(['block'])

{{-- Introductie: openingsalinea. --}}
@if ($block['text'])
    <div class="mx-auto w-full max-w-measure text-xl text-ink-soft">{!! $block['text'] !!}</div>
@endif
