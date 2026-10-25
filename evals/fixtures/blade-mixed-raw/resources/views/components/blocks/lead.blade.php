@props(['block'])

{{-- Lead: korte tekst. --}}
@if ($block['text'])
    <p class="mx-auto w-full max-w-measure text-2xl text-ink">{!! nl2br(e($block['text'])) !!}</p>
@endif
