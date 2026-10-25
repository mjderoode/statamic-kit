@props(['data'])

{{-- JSON-LD for search engines. Push extra blocks with @push('structured-data'). --}}
<script type="application/ld+json">{!! json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
