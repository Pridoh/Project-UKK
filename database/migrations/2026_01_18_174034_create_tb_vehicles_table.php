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
        Schema::create('tb_vehicles', function (Blueprint $table) {
            $table->uuid('id', 36)->primary();
            $table->string('plat_nomor')->unique();
            $table->uuid('vehicle_type_id');
            $table->integer('status');
            
            $table->foreign('vehicle_type_id')->references('id')->on('tb_vehicle_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_vehicles');
    }
};
