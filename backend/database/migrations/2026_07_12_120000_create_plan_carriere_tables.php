<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Suivi du plan de carrière 6 mois : jalons datés, candidatures/contacts réseau,
// revues hebdomadaires. Ownership identique au reste (user_id OU client_token).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jalons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('client_token')->nullable()->index();
            $table->string('titre');
            $table->date('date_cible')->index();
            // Front du plan : recherche (mission/poste), etudes (certifs/portfolio), les-deux.
            $table->string('front')->default('les-deux');
            $table->text('critere_mesurable')->nullable();
            $table->string('statut')->default('a_venir'); // a_venir | fait | rate | reporte
            $table->date('fait_le')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('candidatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('client_token')->nullable()->index();
            $table->string('type')->default('candidature'); // candidature | contact
            $table->string('poste');
            $table->string('entreprise')->nullable();
            $table->string('canal')->nullable(); // linkedin, malt, himalayas, lemon.io, reseau, direct…
            $table->string('url', 500)->nullable();
            $table->date('date_envoi')->nullable();
            // a_envoyer | envoyee | relancee | entretien | test_technique | offre | refus | sans_reponse
            $table->string('statut')->default('a_envoyer')->index();
            $table->date('relance_due_le')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('revues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('client_token')->nullable()->index();
            $table->date('semaine'); // lundi ISO de la semaine couverte
            $table->text('demontrable')->nullable();
            $table->unsignedInteger('heures_etudes_estimees')->default(0);
            $table->text('blocages')->nullable();
            $table->unsignedTinyInteger('humeur')->nullable(); // 1-5
            $table->timestamps();

            // Une revue par (owner, semaine) — NULLs distincts en Postgres,
            // l'unicité anonyme est gérée au niveau applicatif (updateOrCreate).
            $table->unique(['user_id', 'semaine']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revues');
        Schema::dropIfExists('candidatures');
        Schema::dropIfExists('jalons');
    }
};
