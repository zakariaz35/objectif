<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            // Optional per-question facets for the mastery dashboard.
            $table->json('tags')->nullable()->after('explanation_html');
            $table->string('level')->nullable()->after('tags');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropColumn(['tags', 'level']);
        });
    }
};
