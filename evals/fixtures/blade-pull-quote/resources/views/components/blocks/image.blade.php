@props(['block'])

{{-- Afbeelding met optioneel bijschrift. --}}
<figure class="block-image">
    @if ($block['image'])
        <img src="{{ $block['image']->url() }}" alt="{{ $block['image']->alt }}">
    @endif
    @if ($block['caption'])
        <figcaption>{{ $block['caption'] }}</figcaption>
    @endif
</figure>
