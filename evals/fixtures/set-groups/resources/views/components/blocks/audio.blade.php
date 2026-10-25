@props(['block'])

<figure class="block-audio">
    @if ($block['file'])
        <audio controls src="{{ $block['file']->url() }}"></audio>
    @endif
    @if ($block['caption'])
        <figcaption>{{ $block['caption'] }}</figcaption>
    @endif
</figure>
