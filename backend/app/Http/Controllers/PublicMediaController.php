<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicMediaController extends Controller
{
    public function show(Request $request, string $path): StreamedResponse
    {
        abort_unless(
            preg_match('/\A(?:cheikhs|cours|bibliotheque)\/[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*\z/', $path) === 1,
            404,
        );

        abort_unless(Storage::disk('public')->exists($path), 404);

        return $request->boolean('download')
            ? Storage::disk('public')->download($path, basename($path))
            : Storage::disk('public')->response($path);
    }
}
