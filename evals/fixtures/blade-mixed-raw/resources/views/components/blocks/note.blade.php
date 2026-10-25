@props(['block'])

{{-- Note: korte tekst. --}}
@if ($block['text'])
    <p class="mx-auto w-full max-w-measure text-sm text-ink-faint">{!! nl2br(e($block['text'])) !!}</p>
@endif
