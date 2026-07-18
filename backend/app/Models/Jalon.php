<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jalon extends Model
{
    protected $table = 'jalons';

    protected $fillable = [
        'user_id', 'client_token', 'titre', 'date_cible', 'front',
        'critere_mesurable', 'statut', 'fait_le', 'notes',
    ];

    protected $casts = [
        'date_cible' => 'date',
        'fait_le' => 'date',
    ];
}
