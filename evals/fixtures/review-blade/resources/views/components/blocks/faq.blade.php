@props(['block'])

{{-- FAQ: vragen en antwoorden. --}}
<section class="mx-auto w-full max-w-measure">
    <h2 class="ui-label text-ink-faint">{{ $block['label'] ?: 'Veelgestelde vragen' }}</h2>
    <div class="mt-4 flex flex-col">
        @foreach ($block['items'] as $item)
            <details class="rule-t py-4">
                <summary class="cursor-pointer font-display text-xl text-ink">{{ $item['question'] }}</summary>
                <div class="mt-3 text-ink-soft">{!! $item['answer'] !!}</div>
            </details>
        @endforeach
    </div>
</section>
