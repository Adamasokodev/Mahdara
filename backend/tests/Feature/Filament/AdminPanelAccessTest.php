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
