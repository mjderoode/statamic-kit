<x-layout :title="$title">
    <main class="mx-auto w-full max-w-page px-4">
        <h1 class="font-display text-5xl">{{ $title }}</h1>
        <x-page-builder :blocks="$content" />
    </main>
</x-layout>
