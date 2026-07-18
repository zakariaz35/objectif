<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesOwner;
use App\Models\Candidature;
use App\Models\Jalon;
use App\Models\QuizAttempt;
use App\Models\Revue;
use App\Models\User;
use App\Services\SuiviAggregator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /suivi/etat — état complet du plan de carrière, consommable par un
 * assistant IA via `curl` (JSON stable, français, dates ISO, auto-descriptif).
 * Lecture seule. Projet personnel : sans identité fournie (ni Bearer ni
 * X-Client-Token), on retombe sur l'unique utilisateur enregistré.
 */
class EtatController extends Controller
{
    use ResolvesOwner;

    public function show(Request $request): JsonResponse
    {
        [$suivi, $owner, $ownerLabel] = $this->resolveAggregator($request);

        $jalons = $this->jalons($owner);
        $candidatures = $this->candidatures($owner);
        $revues = $this->revues($owner);
        $activite = $suivi->activite();
        $certifs = $suivi->certifs();
        $etudes = [
            'certifications' => $certifs,
            'parcours_aws' => $suivi->progressionFormation('parcours-aws'),
            'cartes_srs' => $suivi->srs(),
            'dernier_niveau_cefr' => $this->dernierCefr($owner),
        ];

        return response()->json([
            '_description' => "État du plan de carrière 6 mois (recherche de mission + certifications + portfolio). Généré par la plateforme Objectif. Toutes les dates sont ISO (YYYY-MM-DD). Les montants d'écart sont en jours (négatif = en retard).",
            'genere_le' => now()->toIso8601String(),
            'proprietaire' => $ownerLabel,
            'alertes' => $this->alertes($jalons, $candidatures, $revues, $activite, $certifs),
            'jalons' => $jalons,
            'candidatures' => $candidatures,
            'revues_hebdo' => $revues,
            'regle_2_jours' => $activite['regle_2_jours'],
            'activite_semaine_courante' => $activite['semaine'],
            'etudes' => $etudes,
        ]);
    }

    /**
     * Owner : utilisateur connecté > X-Client-Token explicite > unique utilisateur
     * du système > jeton anonyme propriétaire des jalons du plan (le plus récent).
     * Projet personnel : le but est qu'un simple `curl` sans en-tête retrouve TES données.
     */
    private function resolveAggregator(Request $request): array
    {
        if ($user = $this->currentUser($request)) {
            return [new SuiviAggregator($user->id, null), ['user_id' => $user->id], "utilisateur #{$user->id} ({$user->name})"];
        }
        if ($token = $request->header('X-Client-Token')) {
            return [new SuiviAggregator(null, $token), ['client_token' => $token], 'jeton client fourni'];
        }

        if ($user = User::query()->orderBy('id')->first()) {
            return [new SuiviAggregator($user->id, null), ['user_id' => $user->id], "utilisateur #{$user->id} ({$user->name}) — repli par défaut"];
        }

        $token = Jalon::query()->whereNotNull('client_token')
            ->orderByDesc('updated_at')->value('client_token');
        abort_unless($token, 404, 'Aucun propriétaire identifiable — fournir un X-Client-Token ou importer le plan (jalons) depuis la vue Plan.');

        return [new SuiviAggregator(null, $token), ['client_token' => $token], 'jeton anonyme propriétaire du plan — repli par défaut'];
    }

    private function scopeOwner($query, array $owner)
    {
        foreach ($owner as $col => $val) {
            $query->where($col, $val);
        }

        return $query;
    }

    private function jalons(array $owner): array
    {
        return $this->scopeOwner(Jalon::query(), $owner)
            ->orderBy('date_cible')
            ->get()
            ->map(fn (Jalon $j) => [
                'titre' => $j->titre,
                'date_cible' => $j->date_cible->toDateString(),
                'front' => $j->front,
                'statut' => $j->statut,
                'fait_le' => $j->fait_le?->toDateString(),
                'critere_mesurable' => $j->critere_mesurable,
                'ecart_jours' => (int) now()->startOfDay()->diffInDays($j->date_cible, false),
                'en_retard' => $j->statut === 'a_venir' && $j->date_cible->isPast(),
            ])->all();
    }

    private function candidatures(array $owner): array
    {
        $base = fn () => $this->scopeOwner(Candidature::query(), $owner);
        $debutSemaine = now()->startOfWeek();

        $relancesDues = $base()->whereNotNull('relance_due_le')
            ->where('relance_due_le', '<=', now())
            ->get()
            ->map(fn ($c) => ['poste' => $c->poste, 'entreprise' => $c->entreprise, 'relance_due_le' => $c->relance_due_le->toDateString()]);

        return [
            'par_statut' => $base()->where('type', 'candidature')->selectRaw('statut, count(*) as n')->groupBy('statut')->pluck('n', 'statut'),
            'semaine_courante' => [
                'candidatures' => $base()->where('type', 'candidature')->where('created_at', '>=', $debutSemaine)->count(),
                'objectif_candidatures' => CandidatureController::OBJECTIF_CANDIDATURES_SEMAINE,
                'contacts_reseau' => $base()->where('type', 'contact')->where('created_at', '>=', $debutSemaine)->count(),
                'objectif_contacts' => CandidatureController::OBJECTIF_CONTACTS_SEMAINE,
            ],
            'relances_dues' => $relancesDues,
            'dernieres' => $base()->orderByDesc('updated_at')->limit(10)
                ->get()
                ->map(fn ($c) => [
                    'type' => $c->type,
                    'poste' => $c->poste,
                    'entreprise' => $c->entreprise,
                    'canal' => $c->canal,
                    'statut' => $c->statut,
                    'date_envoi' => $c->date_envoi?->toDateString(),
                ])->all(),
        ];
    }

    private function revues(array $owner): array
    {
        return $this->scopeOwner(Revue::query(), $owner)
            ->orderByDesc('semaine')->limit(4)
            ->get()
            ->map(fn ($r) => [
                'semaine' => $r->semaine->toDateString(),
                'demontrable' => $r->demontrable,
                'heures_etudes_estimees' => $r->heures_etudes_estimees,
                'blocages' => $r->blocages,
                'humeur' => $r->humeur,
            ])->all();
    }

    private function dernierCefr(array $owner): ?string
    {
        return $this->scopeOwner(QuizAttempt::query(), $owner)
            ->whereNotNull('level')->orderByDesc('created_at')->value('level');
    }

    /** Alertes actionnables, en français, prêtes à être relayées par un coach IA. */
    private function alertes(array $jalons, array $candidatures, array $revues, array $activite, array $certifs): array
    {
        $alertes = [];

        foreach ($jalons as $j) {
            if ($j['en_retard']) {
                $alertes[] = "Jalon en retard : « {$j['titre']} » (cible {$j['date_cible']}, ".abs($j['ecart_jours'])." j de retard).";
            }
        }

        if ($n = count($candidatures['relances_dues'])) {
            $alertes[] = "{$n} relance(s) de candidature due(s).";
        }

        $sem = $candidatures['semaine_courante'];
        if (now()->dayOfWeekIso >= 5 && $sem['candidatures'] < $sem['objectif_candidatures']) {
            $alertes[] = "Objectif hebdo candidatures non atteint : {$sem['candidatures']}/{$sem['objectif_candidatures']} (fin de semaine proche).";
        }

        $lundiCourant = now()->startOfWeek()->toDateString();
        $lundiPrecedent = now()->subWeek()->startOfWeek()->toDateString();
        $semainesAvecRevue = array_column($revues, 'semaine');
        if (! in_array($lundiPrecedent, $semainesAvecRevue, true) && ! in_array($lundiCourant, $semainesAvecRevue, true)) {
            $alertes[] = 'Aucune revue hebdomadaire récente — faire le rituel du dimanche.';
        }

        if (! $activite['regle_2_jours']['respectee']) {
            $alertes[] = 'Règle des 2 jours cassée (2 jours consécutifs sans activité, dernier constat le '.$activite['regle_2_jours']['cassee_le'].').';
        }

        foreach ($certifs as $c) {
            if ($c['status'] === 'pret') {
                $alertes[] = "Test blanc {$c['exam']} : cible atteinte deux fois de suite — réserver l'examen réel.";
            }
        }

        return $alertes;
    }
}
