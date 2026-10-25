@props(['block'])

{{-- Afbeelding met optioneel bijschrift. --}}
@if ($block['image'])
    <figure class="mx-auto w-full max-w-page">
        <img src="{{ $block['image']->url() }}" alt="{{ $block['image']->alt }}">
        @if ($block['caption'])
            <figcaption class="ui-label mt-2 text-ink-faint">{{ $block['caption'] }}</figcaption>
        @endif
    </figure>
@endif
