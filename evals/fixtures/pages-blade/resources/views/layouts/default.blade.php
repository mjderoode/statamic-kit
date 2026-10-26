<!doctype html>
<html lang="{{ $site->short_locale }}">
<head>
    <meta charset="utf-8">
    <title>{{ $title }} | Studio</title>
</head>
<body>
    <header class="site-header">
        <div class="container">
            <a class="site-header__logo" href="/">Studio</a>
            <nav class="site-nav">
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
            </nav>
        </div>
    </header>
    <main class="site-main">
        @yield('content')
    </main>
    <footer class="site-footer">
        <div class="container">&copy; {{ date('Y') }} Studio</div>
    </footer>
</body>
</html>
