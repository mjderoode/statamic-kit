@extends('layouts.default')

@section('content')
    <article class="container vacancy">
        <h1 class="vacancy__title">{{ $title }}</h1>
        @if ($intro)
            <p class="vacancy__intro">{{ $intro }}</p>
        @endif

        <h2>Apply</h2>
        @include('partials.application-form', ['vacancy' => $title])
    </article>
@endsection
