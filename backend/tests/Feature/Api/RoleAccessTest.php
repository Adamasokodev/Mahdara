<?php

namespace Tests\Feature\Api;

use App\Models\Cheikh;
use App\Models\Cours;
use App\Models\Mahdara;
use App\Models\Matiere;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_an_active_student_by_default(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Diallo',
            'prenom' => 'Aminata',
            'email' => 'aminata@example.com',
            'telephone' => '+22246565458',
            'password' => 'correct-password',
            'password_confirmation' => 'correct-password',
        ])->assertCreated()
            ->assertJsonPath('user.role', User::ROLE_STUDENT)
            ->assertJsonPath('user.status', 'active');
    }

    public function test_visitors_can_browse_public_catalogues_without_course_material(): void
    {
        [$cheikh, $mahdara] = $this->createCheikh();
        $course = $this->createCourse($cheikh, $mahdara);

        $this->getJson('/api/cheikh')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/mahdara')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/cours')
            ->assertOk()
            ->assertJsonPath('0.id', $course->id)
            ->assertJsonPath('0.matiere', 'Fiqh')
            ->assertJsonPath('0.extrait_url', 'https://example.com/extrait.mp3')
            ->assertJsonPath('0.description', null)
            ->assertJsonPath('0.fichier_url', null);

        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
            'status' => 'active',
        ]);
        $this->actingAs($student, 'sanctum')
            ->getJson('/api/cours')
            ->assertOk()
            ->assertJsonPath('0.contenu', 'Contenu du cours')
            ->assertJsonPath('0.fichier_url', 'https://example.com/cours.mp3');
    }

    public function test_assistant_can_create_update_and_delete_courses_for_the_assigned_cheikh(): void
    {
        [$cheikh, $mahdara] = $this->createCheikh();
        $assistant = User::factory()->create([
            'role' => User::ROLE_ASSISTANT,
            'assistant_cheikh_id' => $cheikh->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($assistant, 'sanctum')
            ->postJson('/api/cours', [
                ...$this->coursePayload(),
                'matiere_id' => $cheikh->matieres()->first()->id,
                'type' => 'video',
                'type_media' => 'video',
            ])
            ->assertCreated()
            ->assertJsonPath('cours.cheikh_id', $cheikh->id)
            ->assertJsonPath('cours.mahdara_id', $mahdara->id)
            ->assertJsonPath('cours.type', 'video')
            ->assertJsonPath('cours.matiere_id', $cheikh->matieres()->first()->id);

        $courseId = $response->json('cours.id');

        $this->patchJson("/api/cours/{$courseId}", ['titre' => 'Titre modifié'])
            ->assertOk()
            ->assertJsonPath('cours.titre', 'Titre modifié');

        $this->deleteJson("/api/cours/{$courseId}")->assertOk();
        $this->assertDatabaseMissing('cours', ['id' => $courseId]);
    }

    public function test_assistant_cannot_manage_courses_belonging_to_another_cheikh(): void
    {
        [$assignedCheikh] = $this->createCheikh('Assigned');
        [$otherCheikh, $otherMahdara] = $this->createCheikh('Other');
        $assistant = User::factory()->create([
            'role' => User::ROLE_ASSISTANT,
            'assistant_cheikh_id' => $assignedCheikh->id,
            'status' => 'active',
        ]);
        $course = $this->createCourse($otherCheikh, $otherMahdara);

        $this->actingAs($assistant, 'sanctum')
            ->patchJson("/api/cours/{$course->id}", ['titre' => 'Intrusion'])
            ->assertForbidden();
    }

    public function test_admin_can_create_cheikh_with_new_profile_and_subject_fields(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => 'active',
        ]);
        $mahdara = $this->createMahdara('Teaching');
        $user = User::factory()->create([
            'role' => User::ROLE_CHEIKH,
            'status' => 'active',
        ]);
        $matiere = $this->createMatiere();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/cheikh', [
                'user_id' => $user->id,
                'mahdara_id' => $mahdara->id,
                'photo_path' => 'cheikhs/profile.jpg',
                'bio' => 'Biographie du cheikh.',
                'verifier' => true,
                'matiere_ids' => [$matiere->id],
            ])
            ->assertCreated()
            ->assertJsonPath('cheikh.photo_path', 'cheikhs/profile.jpg')
            ->assertJsonPath('cheikh.verifier', true)
            ->assertJsonPath('cheikh.matieres.0.id', $matiere->id);

        $this->getJson('/api/cheikh')
            ->assertOk()
            ->assertJsonPath('0.matieres.0.nom', $matiere->nom);
    }

    public function test_admin_can_manage_mahdara_details_and_matiere_fields(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => 'active',
        ]);

        $mahdaraResponse = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/mahdara', [
                'nom' => 'Mahdara de test',
                'wilaya' => 'Nouakchott',
                'localisation' => 'Tevragh Zeina',
                'description' => 'Description complète.',
                'actif' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('mahdara.localisation', 'Tevragh Zeina')
            ->assertJsonPath('mahdara.actif', true);

        $mahdaraId = $mahdaraResponse->json('mahdara.id');

        $this->patchJson("/api/mahdara/{$mahdaraId}", [
            'description' => 'Description mise à jour.',
        ])->assertOk()
            ->assertJsonPath('mahdara.description', 'Description mise à jour.');

        $matiereResponse = $this->postJson('/api/matiere', [
            'nom' => 'Langue arabe',
            'slug' => 'langue-arabe',
            'description' => 'Étude de la langue.',
            'icone' => 'language',
            'ordre' => 2,
            'actif' => true,
        ])->assertCreated()
            ->assertJsonPath('matiere.slug', 'langue-arabe')
            ->assertJsonPath('matiere.icone', 'language');

        $matiereId = $matiereResponse->json('matiere.id');
        $this->patchJson("/api/matiere/{$matiereId}", ['ordre' => 1])
            ->assertOk()
            ->assertJsonPath('matiere.ordre', 1);
        $this->getJson('/api/matiere')
            ->assertOk()
            ->assertJsonPath('0.nom', 'Langue arabe');
    }

    private function createCheikh(string $suffix = 'One'): array
    {
        $mahdara = $this->createMahdara($suffix);
        $user = User::factory()->create([
            'name' => "Cheikh {$suffix}",
            'role' => User::ROLE_CHEIKH,
            'status' => 'active',
        ]);
        $cheikh = Cheikh::create([
            'user_id' => $user->id,
            'mahdara_id' => $mahdara->id,
            'verifier' => true,
        ]);
        $cheikh->matieres()->attach($this->createMatiere()->id);

        return [$cheikh, $mahdara];
    }

    private function createCourse(Cheikh $cheikh, Mahdara $mahdara): Cours
    {
        $matiereId = $cheikh->matieres()->first()->id;

        return Cours::create([
            ...$this->coursePayload(),
            'matiere_id' => $matiereId,
            'cheikh_id' => $cheikh->id,
            'mahdara_id' => $mahdara->id,
            'statut' => 'publie',
            'publie_le' => now(),
        ]);
    }

    private function coursePayload(): array
    {
        return [
            'titre' => 'Introduction au fiqh',
            'niveau' => 'Débutant',
            'fichier_path' => 'https://example.com/cours.mp3',
            'description' => 'Contenu du cours',
            'type' => 'audio',
            'langue' => 'ar',
            'duree_secondes' => 1800,
            'taille_octets' => 1024000,
            'image_path' => 'cours/fiqh.jpg',
            'livre' => 'Les bases',
            'contenu' => 'Contenu du cours',
            'type_media' => 'audio',
            'extrait_url' => 'https://example.com/extrait.mp3',
        ];
    }

    private function createMahdara(string $suffix = 'One'): Mahdara
    {
        return Mahdara::create([
            'nom' => "Mahdara {$suffix}",
            'wilaya' => 'Nouakchott',
            'localisation' => 'Centre-ville',
            'description' => 'Description de la mahdara.',
            'actif' => true,
        ]);
    }

    private function createMatiere(): Matiere
    {
        return Matiere::create([
            'nom' => 'Fiqh',
            'slug' => 'fiqh-'.fake()->unique()->numerify('####'),
            'description' => 'Jurisprudence islamique.',
            'icone' => 'book',
            'ordre' => 1,
            'actif' => true,
        ]);
    }
}
