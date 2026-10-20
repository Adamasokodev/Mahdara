<?php

namespace Tests\Feature\Filament;

use App\Models\User;
use Filament\Facades\Filament;
use Tests\TestCase;

class AdminPanelAccessTest extends TestCase
{
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
}
