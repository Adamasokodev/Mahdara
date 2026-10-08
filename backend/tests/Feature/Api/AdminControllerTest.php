<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_admin_can_approve_a_pending_cheikh(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);
        $cheikh = User::factory()->create([
            'role' => 'cheikh',
            'status' => 'pending',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/cheikhs/{$cheikh->id}/approve")
            ->assertOk()
            ->assertJsonPath('user.status', 'active');

        $this->assertDatabaseHas('users', [
            'id' => $cheikh->id,
            'status' => 'active',
        ]);
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'active',
        ]);

        $this->actingAs($student, 'sanctum')
            ->getJson('/api/admin/cheikhs/pending')
            ->assertForbidden();
    }
}
