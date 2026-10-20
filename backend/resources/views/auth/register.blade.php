<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Inscription</title>
    <style>
        body { background: #fdfdfc; color: #1b1b18; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 2rem 1rem; }
        main { margin: 0 auto; max-width: 28rem; }
        h1 { font-size: 1.5rem; }
        label { display: block; font-size: .9rem; font-weight: 600; margin-top: 1rem; }
        input { box-sizing: border-box; border: 1px solid #d6d3d1; border-radius: .375rem; display: block; margin-top: .35rem; padding: .65rem; width: 100%; }
        button { background: #d97706; border: 0; border-radius: .375rem; color: white; cursor: pointer; font-size: 1rem; margin-top: 1.5rem; padding: .75rem; width: 100%; }
        .message { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: .375rem; padding: .75rem; }
        .error { color: #b91c1c; font-size: .85rem; margin-top: .25rem; }
        a { color: #92400e; }
    </style>
</head>
<body>
    <main>
        <h1>Créer un compte</h1>
        <p>Remplissez le formulaire pour demander l'accès à Mahdara.</p>

        @if (session('status'))
            <p class="message">{{ session('status') }}</p>
        @endif

        <form method="POST" action="{{ route('register.store') }}">
            @csrf

            <label for="name">Nom</label>
            <input id="name" name="name" value="{{ old('name') }}" required autocomplete="family-name">
            @error('name') <p class="error">{{ $message }}</p> @enderror

            <label for="prenom">Prénom</label>
            <input id="prenom" name="prenom" value="{{ old('prenom') }}" required autocomplete="given-name">
            @error('prenom') <p class="error">{{ $message }}</p> @enderror

            <label for="email">Adresse e-mail</label>
            <input id="email" name="email" type="email" value="{{ old('email') }}" required autocomplete="email">
            @error('email') <p class="error">{{ $message }}</p> @enderror

            <label for="telephone">Téléphone</label>
            <input id="telephone" name="telephone" type="tel" value="{{ old('telephone') }}" required autocomplete="tel" placeholder="+22246565458">
            @error('telephone') <p class="error">{{ $message }}</p> @enderror

            <label for="password">Mot de passe</label>
            <input id="password" name="password" type="password" required autocomplete="new-password">
            @error('password') <p class="error">{{ $message }}</p> @enderror

            <label for="password_confirmation">Confirmer le mot de passe</label>
            <input id="password_confirmation" name="password_confirmation" type="password" required autocomplete="new-password">

            <button type="submit">Register</button>
        </form>

        <p><a href="{{ route('filament.admin.auth.login') }}">Déjà inscrit ? Se connecter</a></p>
    </main>
</body>
</html>
