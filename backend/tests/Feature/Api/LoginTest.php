<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_log_in_with_a_telephone_number(): void
    {
        User::create([
            'name' => 'Test',
            'prenom' => 'User',
            'email' => 'test@example.com',
            'telephone' => '+22246565458',
            'password' => 'correct-password',
            'status' => 'active',
        ]);

        $this->postJson('/api/login', [
            'telephone' => '+22246565458',
            'password' => 'correct-password',
        ])->assertOk()
            ->assertJsonStructure(['user' => ['id', 'telephone'], 'token']);
    }

    public function test_an_email_address_cannot_be_used_to_log_in(): void
    {
        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'correct-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('telephone');
    }

    public function test_an_inactive_account_cannot_log_in(): void
    {
        User::create([
            'name' => 'Test',
            'prenom' => 'Pending',
            'email' => 'pending@example.com',
            'telephone' => '+22246565459',
            'password' => 'correct-password',
            'status' => 'pending',
        ]);

        $this->postJson('/api/login', [
            'telephone' => '+22246565459',
            'password' => 'correct-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('telephone')
            ->assertJsonPath('errors.telephone.0', 'Votre compte n’est pas actif. Contactez un administrateur.');
    }
}
