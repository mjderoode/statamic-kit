@props(['entry'])

{{-- Teaser card for an entry: image, title and intro or location. --}}
<article class="card">
    <a class="card__link" href="{{ $entry->url }}">
        @if ($entry->image)
            <x-picture :image="$entry->image" class="card__image" sizes="(min-width: 768px) 33vw, 100vw" />
        @endif
        <h3 class="card__title">{{ $entry->title }}</h3>
        @if ($entry->location)
            <p class="card__meta">{{ $entry->location }}</p>
        @endif
    </a>
</article>
