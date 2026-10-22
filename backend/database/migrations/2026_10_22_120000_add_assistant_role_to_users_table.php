<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->change();
            $table->foreignId('assistant_cheikh_id')
                ->nullable()
                ->after('role')
                ->constrained('cheikhs')
                ->nullOnDelete();
        });

        DB::table('users')
            ->where('role', 'student')
            ->where('status', 'pending')
            ->update(['status' => 'active']);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('role', 'assistant')
            ->update(['role' => 'student', 'assistant_cheikh_id' => null]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assistant_cheikh_id');
            $table->enum('role', ['admin', 'cheikh', 'student'])->default('student')->change();
        });
    }
};
