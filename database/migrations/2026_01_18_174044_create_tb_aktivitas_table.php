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
        Schema::create('tb_aktivitas', function (Blueprint $table) {
            $table->uuid('id', 36)->primary();
            $table->uuid('user_id');
            $table->integer('actor');
            $table->integer('aktivitas');
            $table->text('note');
            $table->string('ip_address');
            $table->timestamp('created_at');
            
            $table->foreign('user_id')->references('id')->on('tb_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_aktivitas');
    }
};
