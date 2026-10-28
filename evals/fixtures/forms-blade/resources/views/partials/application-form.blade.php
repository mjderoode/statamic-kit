@if (session('form.application.success'))
    <p class="form-success">Thanks for applying, we'll be in touch.</p>
@endif

<form method="POST" action="{{ route('statamic.forms.submit', 'application') }}" class="application-form">
    @csrf

    <div class="form-field">
        <label for="name">Name</label>
        <input id="name" type="text" name="name" value="{{ old('name') }}" required>
        @error('name', 'form.application')<p class="form-error">{{ $message }}</p>@enderror
    </div>

    <div class="form-field">
        <label for="email">Email</label>
        <input id="email" type="email" name="email" value="{{ old('email') }}" required>
        @error('email', 'form.application')<p class="form-error">{{ $message }}</p>@enderror
    </div>

    <div class="form-field">
        <label for="motivation">Motivation</label>
        <textarea id="motivation" name="motivation" required>{{ old('motivation') }}</textarea>
        @error('motivation', 'form.application')<p class="form-error">{{ $message }}</p>@enderror
    </div>

    <input type="text" name="website" class="hidden" tabindex="-1" autocomplete="off">
    <button type="submit">Send application</button>
</form>
