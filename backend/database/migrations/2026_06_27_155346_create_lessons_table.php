<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('title');
            $table->string('type')->default('lesson'); // lesson | exercise | quiz
            $table->unsignedInteger('position')->default(0);
            $table->longText('body_md')->nullable();
            $table->longText('body_html')->nullable();
            $table->longText('correction_md')->nullable();
            $table->longText('correction_html')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['module_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
