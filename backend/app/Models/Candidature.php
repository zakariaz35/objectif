<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidature extends Model
{
    protected $table = 'candidatures';

    protected $fillable = [
        'user_id', 'client_token', 'type', 'poste', 'entreprise', 'canal',
        'url', 'date_envoi', 'statut', 'relance_due_le', 'notes',
    ];

    protected $casts = [
        'date_envoi' => 'date',
        'relance_due_le' => 'date',
    ];
}
