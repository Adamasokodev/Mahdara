<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parties_cours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cours_id')->constrained('cours')->cascadeOnDelete();
            $table->string('titre');
            $table->longText('contenu');
            $table->string('fichier_path')->nullable();
            $table->string('source_url', 2048)->nullable();
            $table->unsignedInteger('duree_secondes')->nullable();
            $table->unsignedInteger('ordre')->default(1);
            $table->timestamps();

            $table->index(['cours_id', 'ordre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parties_cours');
    }
};
