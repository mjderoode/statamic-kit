@extends('layouts.default')

{{-- Home: welcome text and three open vacancies. --}}
@section('content')
    <section class="container home">
        <h1 class="page__title">{{ $title }}</h1>
        <div class="prose">{!! $content !!}</div>
        <h2 class="section-title">Open vacancies</h2>
        <div class="card-grid">
            <s:collection:vacancies limit="3" as="vacancies">
                @foreach ($vacancies as $vacancy)
                    <x-card :entry="$vacancy" />
                @endforeach
            </s:collection:vacancies>
        </div>
    </section>
@endsection
