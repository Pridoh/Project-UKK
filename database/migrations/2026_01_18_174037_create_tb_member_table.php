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
        Schema::create('tb_member', function (Blueprint $table) {
            $table->uuid('id', 36)->primary();
            $table->uuid('vehicle_id');
            $table->string('nama');
            $table->integer('tipe_member');
            $table->decimal('diskon', 10, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->softDeletes();
            
            $table->foreign('vehicle_id')->references('id')->on('tb_vehicles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_member');
    }
};
