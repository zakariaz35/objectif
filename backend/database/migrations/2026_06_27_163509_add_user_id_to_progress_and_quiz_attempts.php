<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('progress', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('client_token')->nullable()->change();
            $table->unique(['user_id', 'lesson_id']);
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('client_token')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('progress', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'lesson_id']);
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
