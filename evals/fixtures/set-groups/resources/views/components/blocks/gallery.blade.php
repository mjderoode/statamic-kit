@props(['block'])

<div class="block-gallery">
    @foreach ($block['images'] ?? [] as $image)
        <img src="{{ $image->url() }}" alt="{{ $image->alt }}">
    @endforeach
</div>
