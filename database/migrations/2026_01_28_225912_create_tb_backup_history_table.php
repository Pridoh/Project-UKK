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
        Schema::create('tb_backup_history', function (Blueprint $table) {
            $table->string('id')->primary(); // UUID
            $table->string('filename')->unique()->comment('Nama file backup');
            $table->integer('backup_type')->comment('Tipe backup: 1 = full database, 2 = partial table');
            $table->json('tables')->nullable()->comment('Daftar tabel yang di-backup (null jika full)');
            $table->unsignedBigInteger('file_size')->default(0)->comment('Ukuran file dalam bytes');
            $table->string('storage_disk')->default('local')->comment('Disk storage (local, s3, etc.)');
            $table->string('storage_path')->comment('Path file dalam storage');
            $table->string('created_by')->comment('User yang membuat backup');
            $table->text('notes')->nullable()->comment('Catatan atau keterangan backup');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('created_by')->references('id')->on('tb_user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_backup_history');
    }
};
