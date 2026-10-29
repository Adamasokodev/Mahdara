<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oeuvres', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('type')->index(); // livre, poeme, manuel
            $table->string('auteur')->nullable();
            $table->string('langue', 20)->default('ar');
            $table->string('confrerie')->nullable();
            $table->text('description')->nullable();
            $table->text('aide_pedagogique')->nullable();
            $table->string('fichier_path')->nullable();
            $table->string('source_url', 2048)->nullable();
            $table->string('statut')->default('brouillon')->index();
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oeuvres');
    }
};
