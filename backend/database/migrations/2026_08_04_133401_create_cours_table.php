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
            $table->foreignId('matiere_id')->constrained('matieres')->restrictOnDelete();
            $table->foreignId('cheikh_id')->constrained()->restrictOnDelete();
            $table->foreignId('mahdara_id')->constrained('mahdaras')->restrictOnDelete();
            $table->string('niveau')->default('debutant');
            $table->string('fichier_path');
            $table->text('description')->nullable();
            $table->string('type')->default('audio');
            $table->string('langue')->default('ar');
            $table->unsignedInteger('duree_secondes')->nullable();
            $table->unsignedBigInteger('taille_octets')->nullable();
            $table->string('image_path')->nullable();
            $table->string('statut')->default('brouillon');  // brouillon, publie
            $table->unsignedInteger('nombre_ecoutes')->default(0);
            $table->unsignedInteger('telechargements')->default(0);
            $table->timestamp('publie_le')->nullable();
            $table->timestamps();

            $table->index(['statut', 'publie_le']);
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
