<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Revue extends Model
{
    protected $table = 'revues';

    protected $fillable = [
        'user_id', 'client_token', 'semaine', 'demontrable',
        'heures_etudes_estimees', 'blocages', 'humeur',
    ];

    protected $casts = [
        'semaine' => 'date',
    ];
}
