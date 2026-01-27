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
        Schema::table('tb_member', function (Blueprint $table) {
            $table->integer('package_duration')->after('tipe_member')->comment('Duration in months: 1, 3, 6, 12');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_member', function (Blueprint $table) {
            $table->dropColumn('package_duration');
        });
    }
};
