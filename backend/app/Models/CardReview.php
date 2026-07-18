<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardReview extends Model
{
    protected $fillable = ['user_id', 'client_token', 'lesson_id', 'card_index', 'ease', 'interval_days', 'reps', 'due_at'];

    protected $casts = [
        'ease' => 'float',
        'interval_days' => 'integer',
        'reps' => 'integer',
        'due_at' => 'datetime',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
