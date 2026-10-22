<?php

namespace Tests\Feature\Filament;

use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminPanelAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.key' => 'base64:'.base64_encode(str_repeat('a', 32))]);
    }

    public function test_admin_login_page_is_available(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_homepage_login_link_points_to_the_filament_login_page(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('href="'.route('filament.admin.auth.login').'"', false);
    }

    public function test_homepage_does_not_link_to_the_api_registration_endpoint(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('href="'.route('register').'"', false)
            ->assertDontSee('api/register');
    }

    public function test_registration_page_is_available_and_posts_to_the_web_route(): void
    {
        $this->get(route('register'))
            ->assertOk()
            ->assertSee('action="'.route('register.store').'"', false)
            ->assertSee('name="password_confirmation"', false);
    }

    public function test_web_registration_creates_an_active_student_account(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Diallo',
            'prenom' => 'Aminata',
            'email' => 'aminata@example.com',
            'telephone' => '+22246565458',
            'password' => 'correct-password',
            'password_confirmation' => 'correct-password',
        ])->assertRedirect(route('register'));

        $this->assertDatabaseHas('users', [
            'email' => 'aminata@example.com',
            'role' => User::ROLE_STUDENT,
            'status' => 'active',
        ]);
    }

    public function test_only_active_admins_can_access_the_admin_panel(): void
    {
        $panel = Filament::getPanel('admin');

        $admin = new User([
            'role' => 'admin',
            'status' => 'active',
        ]);
        $student = new User([
            'role' => 'student',
            'status' => 'active',
        ]);
        $inactiveAdmin = new User([
            'role' => 'admin',
            'status' => 'pending',
        ]);

        $this->assertTrue($admin->canAccessPanel($panel));
        $this->assertFalse($student->canAccessPanel($panel));
        $this->assertFalse($inactiveAdmin->canAccessPanel($panel));
    }

    public function test_admin_can_open_all_content_management_resources(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => 'active',
        ]);

        $this->actingAs($admin);

        foreach ([
            '/admin/cours',
            '/admin/cours/create',
            '/admin/cheikhs',
            '/admin/cheikhs/create',
            '/admin/mahdaras',
            '/admin/mahdaras/create',
            '/admin/matieres',
            '/admin/matieres/create',
        ] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_cheikh_photo_is_served_from_public_storage_without_a_symlink(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('cheikhs/profile.jpg', 'test-image');

        $this->get(route('media.public.show', ['path' => 'cheikhs/profile.jpg']))
            ->assertOk()
            ->assertHeader('content-type', 'image/jpeg')
            ->assertStreamedContent('test-image');
    }

    public function test_cheikh_photo_endpoint_does_not_allow_path_traversal(): void
    {
        $this->get('/media/cheikhs/%2E%2E/private.jpg')->assertNotFound();
    }

    public function test_uploaded_course_files_are_served_from_public_storage(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('cours/audio/lesson.mp3', 'test-audio');

        $this->get('/media/cours/audio/lesson.mp3')
            ->assertOk()
            ->assertStreamedContent('test-audio');
    }
}
