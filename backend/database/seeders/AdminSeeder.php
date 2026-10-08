<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = config('admin.password');

        if (! is_string($password) || $password === '') {
            throw new RuntimeException('Set ADMIN_PASSWORD before seeding the admin user.');
        }

        User::updateOrCreate(
            ['email' => config('admin.email')],
            [
                'name' => config('admin.name'),
                'prenom' => config('admin.first_name'),
                'password' => $password,
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}
