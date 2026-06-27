<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    protected $fillable = [
        'module_id', 'slug', 'title', 'type', 'position',
        'body_md', 'body_html', 'correction_md', 'correction_html', 'meta', 'exercise', 'cards',
    ];

    protected $casts = [
        'meta' => 'array',
        'exercise' => 'array',
        'cards' => 'array',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('position');
    }
}
