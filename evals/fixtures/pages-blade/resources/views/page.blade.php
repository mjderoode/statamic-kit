@extends('layouts.default')

{{-- A standard page: title, intro and content. --}}
@section('content')
    <article class="container page">
        <h1 class="page__title">{{ $title }}</h1>
        @if ($intro)
            <p class="page__intro">{{ $intro }}</p>
        @endif
        <div class="prose">{!! $content !!}</div>
    </article>
@endsection
