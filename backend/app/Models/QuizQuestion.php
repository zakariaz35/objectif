<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestion extends Model
{
    protected $fillable = ['lesson_id', 'position', 'prompt_html', 'options', 'correct_index', 'explanation_html'];

    protected $casts = [
        'options' => 'array',
        'correct_index' => 'integer',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
