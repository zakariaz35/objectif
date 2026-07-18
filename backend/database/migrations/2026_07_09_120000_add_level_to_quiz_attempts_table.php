<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            // CEFR level (A2/B1/B2/C1…) computed for placement quizzes (kind: placement).
            // Null for ordinary quizzes → also serves as the "is a placement result" flag.
            $table->string('level')->nullable()->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};
