@props(['block'])

<blockquote class="block-quote">
    <p>{{ $block['quote'] }}</p>
    @if ($block['author'])
        <cite>{{ $block['author'] }}</cite>
    @endif
</blockquote>
