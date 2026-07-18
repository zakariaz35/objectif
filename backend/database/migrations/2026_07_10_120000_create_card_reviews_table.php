<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('client_token')->nullable()->index();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('card_index');
            // SM-2 scheduler state.
            $table->float('ease')->default(2.5);
            $table->unsignedInteger('interval_days')->default(0);
            $table->unsignedInteger('reps')->default(0);
            $table->timestamp('due_at')->nullable()->index();
            $table->timestamps();

            // One scheduler row per (owner, card). NULLs are distinct in Postgres,
            // so anonymous rows are de-duplicated at the app level (updateOrCreate).
            $table->unique(['user_id', 'lesson_id', 'card_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_reviews');
    }
};
