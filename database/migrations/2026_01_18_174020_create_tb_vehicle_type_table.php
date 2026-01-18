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
        Schema::create('tb_vehicle_type', function (Blueprint $table) {
            $table->uuid('id', 36)->primary();
            $table->string('kode')->unique();
            $table->string('nama_tipe');
            $table->integer('ukuran_slot');
            $table->bigInteger('tarif_dasar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_vehicle_type');
    }
};
