@props(['blocks'])

@if ($blocks)
    <div {{ $attributes->merge(['class' => 'page-builder']) }}>
        @foreach ($blocks as $block)
            <x-dynamic-component :component="'blocks.'.$block['type']" :block="$block" />
        @endforeach
    </div>
@endif
