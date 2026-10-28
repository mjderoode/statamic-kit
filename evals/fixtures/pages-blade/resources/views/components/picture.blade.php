@props(['image', 'sizes' => '100vw', 'widths' => [480, 800, 1200]])

{{-- Responsive image from an asset: Glide srcset, alt from the asset. --}}
@if ($image)
    <img
        {{ $attributes }}
        src="{{ Statamic::tag('glide')->src($image)->width(800) }}"
        srcset="@foreach ($widths as $width){{ Statamic::tag('glide')->src($image)->width($width) }} {{ $width }}w{{ $loop->last ? '' : ', ' }}@endforeach"
        sizes="{{ $sizes }}"
        alt="{{ $image->alt ?? '' }}"
        width="{{ $image->width }}"
        height="{{ $image->height }}"
        loading="lazy"
    >
@endif
