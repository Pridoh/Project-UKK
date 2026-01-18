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
        Schema::create('tb_transaksi', function (Blueprint $table) {
            $table->uuid('id', 36)->primary();
            $table->string('kode_transaksi')->unique();
            $table->uuid('vehicle_id');
            $table->uuid('area_id');
            $table->uuid('vehicle_type_id');
            $table->uuid('user_id');
            $table->timestamp('jam_masuk');
            $table->timestamp('jam_keluar')->nullable();
            $table->integer('durasi');
            $table->bigInteger('tarif_dasar');
            $table->decimal('diskon', 10, 2);
            $table->bigInteger('total_bayar');
            $table->integer('metode_pembayaran');
            $table->integer('payment_status');
            $table->integer('status');
            $table->timestamp('created_at');
            
            $table->foreign('vehicle_id')->references('id')->on('tb_vehicles');
            $table->foreign('area_id')->references('id')->on('tb_area');
            $table->foreign('vehicle_type_id')->references('id')->on('tb_vehicle_type');
            $table->foreign('user_id')->references('id')->on('tb_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_transaksi');
    }
};
