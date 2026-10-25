@props(['block'])

<p class="block-source">
    Source:
    @if ($block['url'])
        <a href="{{ $block['url'] }}">{{ $block['label'] }}</a>
    @else
        {{ $block['label'] }}
    @endif
</p>
