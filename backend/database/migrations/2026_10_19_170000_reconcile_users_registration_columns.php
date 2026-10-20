<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'prenom')) {
                $table->string('prenom')->nullable()->after('name');
            }

            if (! Schema::hasColumn('users', 'telephone')) {
                $table->string('telephone')->nullable()->unique()->after('email');
            }

            if (! Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'cheikh', 'student'])->default('student')->index();
            }

            if (! Schema::hasColumn('users', 'status')) {
                $table->enum('status', ['pending', 'active', 'rejected', 'suspended'])->default('pending')->index();
            }
        });
    }

    public function down(): void
    {
        // These columns may already be defined by the initial migration.
    }
};