@props(['block'])

<blockquote class="block-pull-quote">
    <p>{{ $block['quote'] }}</p>
    @if (! empty($block['author']))
        <cite>{{ $block['author'] }}</cite>
    @endif
</blockquote>
