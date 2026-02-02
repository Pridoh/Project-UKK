<?php

namespace App\Modules\Database\Models;

use App\Modules\User\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Model untuk history backup database
 * Menyimpan log setiap backup yang dibuat
 */
class BackupHistory extends Model
{
    use HasUuids;

    protected $table = 'tb_backup_history';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'filename',
        'backup_type', // 1: Full, 2: Partial
        'tables',
        'file_size',
        'storage_disk',
        'storage_path',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'tables' => 'array',
        'file_size' => 'integer',
        'backup_type' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke user yang membuat backup
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Format ukuran file ke human readable (KB, MB, GB)
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' bytes';
    }
}
