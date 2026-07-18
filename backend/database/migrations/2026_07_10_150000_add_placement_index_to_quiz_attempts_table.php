<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Partial indexes: placement results are read with `WHERE level IS NOT NULL`
    // scoped by owner (ResultsController@results). Postgres-only.
    public function up(): void
    {
        DB::statement('CREATE INDEX IF NOT EXISTS quiz_attempts_level_user_idx ON quiz_attempts (user_id) WHERE level IS NOT NULL');
        DB::statement('CREATE INDEX IF NOT EXISTS quiz_attempts_level_client_idx ON quiz_attempts (client_token) WHERE level IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS quiz_attempts_level_user_idx');
        DB::statement('DROP INDEX IF EXISTS quiz_attempts_level_client_idx');
    }
};
