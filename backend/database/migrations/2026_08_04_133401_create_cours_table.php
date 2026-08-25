<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cours', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('matiere');
            $table->string('niveau'); // debutant, intermediaire, avance
            $table->string('fichier_url');
            $table->integer('duree_minutes')->nullable();
            $table->foreignId('cheikh_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mahdara_id')->constrained('mahdaras')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cours');
    }
};
