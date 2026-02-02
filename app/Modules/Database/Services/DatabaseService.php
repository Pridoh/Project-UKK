<?php

namespace App\Modules\Database\Services;

use Carbon\Carbon;
use App\Modules\User\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use App\Modules\Database\Models\BackupHistory;

/**
 * Service untuk backup dan restore database
 * Didesain dengan storage abstraction untuk memudahkan migrasi ke cloud storage
 */
class DatabaseService
{
    /**
     * Disk storage yang digunakan (configurable untuk future cloud migration)
     */
    protected string $storageDisk = 'local';

    /**
     * Folder untuk menyimpan backup
     */
    protected string $backupFolder = 'backups';

    /**
     * Tabel sistem yang tidak boleh di-backup secara terpisah
     */
    protected array $systemTables = [
        'migrations',
        'password_reset_tokens',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'sessions',
    ];

    /**
     * Get semua tabel aplikasi dengan metadata
     */
    public function getTables(): array
    {
        $tables = [];
        $databaseName = DB::getDatabaseName();

        $allTables = DB::select('SHOW TABLES');
        $key = "Tables_in_{$databaseName}";

        foreach ($allTables as $table) {
            $tableName = $table->$key;

            // Skip system tables
            if (in_array($tableName, $this->systemTables)) {
                continue;
            }

            // Get row count
            $count = DB::table($tableName)->count();

            // Get estimated size (untuk MySQL)
            $sizeQuery = DB::select("
                SELECT 
                    ROUND((DATA_LENGTH + INDEX_LENGTH), 0) as size
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ", [$databaseName, $tableName]);

            $size = $sizeQuery[0]->size ?? 0;

            $tables[] = [
                'name' => $tableName,
                'row_count' => $count,
                'size' => (int) $size,
                'formatted_size' => $this->formatBytes($size),
            ];
        }

        return $tables;
    }

    /**
     * Get daftar backup yang sudah ada
     */
    public function getBackups(): array
    {
        // 1. Get backups from Database
        $dbBackups = BackupHistory::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->keyBy('filename'); // Key by filename for easy merging

        // 2. Scan storage for backup files
        $files = Storage::disk($this->storageDisk)->files($this->backupFolder);
        $jsonFiles = array_filter($files, fn($f) => str_ends_with($f, '.json'));

        $storageBackups = [];

        foreach ($jsonFiles as $jsonFile) {
            try {
                $content = Storage::disk($this->storageDisk)->get($jsonFile);
                $metadata = json_decode($content, true);

                if (!$metadata || !isset($metadata['filename'])) continue;

                $filename = $metadata['filename'];

                // If exists in DB, skip (DB takes precedence for creator info etc)
                if ($dbBackups->has($filename)) continue;

                // If not in DB, add to list as a "Storage Only" backup
                $storageBackups[] = [
                    'id' => 'storage_' . $filename, // Virtual ID
                    'filename' => $filename,
                    'backup_type' => $metadata['backup_type'] ?? 1,
                    'tables' => $metadata['tables'] ?? null,
                    'tables_count' => isset($metadata['tables']) ? count($metadata['tables']) : null,
                    'file_size' => $metadata['file_size'] ?? 0,
                    'formatted_size' => $this->formatBytes($metadata['file_size'] ?? 0),
                    'storage_disk' => $this->storageDisk,
                    'created_by_name' => $metadata['created_by_name'] ?? 'System/Unknown', // Fallback
                    'notes' => ($metadata['notes'] ?? '') . ' (Recovered from Storage)',
                    'created_at' => $metadata['created_at'] ?? null,
                    'is_recovered' => true, // Flag for UI
                ];
            } catch (\Exception $e) {
                Log::warning("Failed to parse backup metadata: {$jsonFile}");
            }
        }

        // 3. Format DB backups
        $formattedDbBackups = $dbBackups->map(function ($backup) {
            return [
                'id' => (string) $backup->id,
                'filename' => $backup->filename,
                'backup_type' => $backup->backup_type,
                'tables' => $backup->tables,
                'tables_count' => $backup->tables ? count($backup->tables) : null,
                'file_size' => $backup->file_size,
                'formatted_size' => $backup->formatted_size,
                'storage_disk' => $backup->storage_disk,
                'created_by_name' => $backup->creator?->name ?? 'Unknown',
                'notes' => $backup->notes,
                'created_at' => $backup->created_at->format('Y-m-d H:i:s'),
                'is_recovered' => false,
            ];
        })->values()->toArray();

        // Merge and sort by date desc
        $allBackups = array_merge($formattedDbBackups, $storageBackups);
        usort($allBackups, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return $allBackups;
    }

    /**
     * Buat backup database (full atau partial)
     */
    public function createBackup(array $tables = [], ?string $notes = null, string $userId): array
    {
        $isFullBackup = empty($tables);
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $type = $isFullBackup ? 1 : 2; // 1 = full, 2 = partial
        $typeStr = $isFullBackup ? 'full' : 'partial';
        $filename = "backup_{$typeStr}_{$timestamp}.sql";
        $storagePath = "{$this->backupFolder}/{$filename}";

        try {
            // Generate SQL dump
            $sqlContent = $this->generateDump($isFullBackup ? null : $tables);

            // Simpan file ke storage
            Storage::disk($this->storageDisk)->put($storagePath, $sqlContent);

            $fileSize = Storage::disk($this->storageDisk)->size($storagePath);

            // Simpan history ke database
            $backup = BackupHistory::create([
                'filename' => $filename,
                'backup_type' => $type,
                'tables' => $isFullBackup ? null : $tables,
                'file_size' => $fileSize,
                'storage_disk' => $this->storageDisk,
                'storage_path' => $storagePath,
                'created_by' => $userId,
                'notes' => $notes,
            ]);

            // [NEW] Simpan metadata JSON ke storage (Dual Metadata)
            try {
                $user = User::find($userId);
                $metadata = [
                    'filename' => $filename,
                    'backup_type' => $type,
                    'tables' => $tables,
                    'file_size' => $fileSize,
                    'storage_disk' => $this->storageDisk,
                    'storage_path' => $storagePath,
                    'created_by' => $userId,
                    'created_by_name' => $user ? $user->name : 'Unknown', // Simpan nama untuk recovery
                    'notes' => $notes,
                    'created_at' => Carbon::now()->format('Y-m-d H:i:s'),
                ];

                $jsonFilename = str_replace('.sql', '.json', $filename);
                Storage::disk($this->storageDisk)->put(
                    "{$this->backupFolder}/{$jsonFilename}",
                    json_encode($metadata, JSON_PRETTY_PRINT)
                );
            } catch (\Exception $e) {
                Log::warning('Failed to save backup metadata JSON: ' . $e->getMessage());
                // Non-fatal, continue
            }

            return [
                'success' => true,
                'message' => $isFullBackup
                    ? 'Full database backup created successfully'
                    : 'Backup for ' . count($tables) . ' table(s) created successfully',
                'backup' => $backup,
            ];
        } catch (\Exception $e) {
            Log::error('Database backup failed', [
                'error' => $e->getMessage(),
                'tables' => $tables,
            ]);

            return [
                'success' => false,
                'message' => 'Backup failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Restore database dari backup file
     */
    public function restoreBackup(string $backupId): array
    {
        // Cek apakah ini backup dari storage (recovery) atau DB
        if (str_starts_with($backupId, 'storage_')) {
            $filename = substr($backupId, 8); // remove 'storage_' prefix
            $storagePath = "{$this->backupFolder}/{$filename}";
            $disk = $this->storageDisk;

            // Cek existensi file
            if (!Storage::disk($disk)->exists($storagePath)) {
                return ['success' => false, 'message' => 'Backup file not found in storage'];
            }
        } else {
            // Normal DB backup
            $backup = BackupHistory::find($backupId);
            if (!$backup) {
                return ['success' => false, 'message' => 'Backup not found'];
            }
            $storagePath = $backup->storage_path;
            $disk = $backup->storage_disk;
        }

        try {
            // Baca file backup
            $sqlContent = Storage::disk($disk)->get($storagePath);

            if (empty($sqlContent)) {
                return [
                    'success' => false,
                    'message' => 'Backup file is empty or not found',
                ];
            }

            // Jalankan SQL statements
            DB::unprepared($sqlContent);

            return [
                'success' => true,
                'message' => 'Database restored successfully',
            ];
        } catch (\Exception $e) {
            Log::error('Database restore failed', [
                'backup_id' => $backupId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Restore failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Restore langsung dari upload file .sql
     */
    public function restoreFromUpload(UploadedFile $file): array
    {
        // 1. Validasi ekstensi
        if ($file->getClientOriginalExtension() !== 'sql') {
            return [
                'success' => false,
                'message' => 'Invalid file type. Only .sql files are allowed.',
            ];
        }

        try {
            // 2. Baca content
            $sqlContent = file_get_contents($file->getRealPath());

            if (empty($sqlContent)) {
                return [
                    'success' => false,
                    'message' => 'The uploaded file is empty.',
                ];
            }

            // 3. Jalankan SQL Statement
            // Warning: DB::unprepared is dangerous if input is untested. 
            // Since this is Admin-only high privilege feature, we accept the risk for functionality.
            DB::unprepared($sqlContent);

            return [
                'success' => true,
                'message' => 'Database restored from uploaded file successfully.',
            ];
        } catch (\Exception $e) {
            Log::error('Direct restore failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Direct restore failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Download backup file
     */
    public function getBackupPath(string $backupId): ?string
    {
        $backup = BackupHistory::find($backupId);

        if (!$backup) {
            return null;
        }

        $fullPath = Storage::disk($backup->storage_disk)->path($backup->storage_path);

        if (!file_exists($fullPath)) {
            return null;
        }

        return $fullPath;
    }

    /**
     * Get backup untuk download (return as stream response)
     */
    public function getBackupForDownload(string $backupId): ?array
    {
        $backup = BackupHistory::find($backupId);

        if (!$backup) {
            return null;
        }

        if (!Storage::disk($backup->storage_disk)->exists($backup->storage_path)) {
            return null;
        }

        return [
            'path' => Storage::disk($backup->storage_disk)->path($backup->storage_path),
            'filename' => $backup->filename,
        ];
    }

    /**
     * Hapus backup file
     */
    public function deleteBackup(string $backupId): array
    {
        $disk = $this->storageDisk;

        // Handle storage-only/recovered backup
        if (str_starts_with($backupId, 'storage_')) {
            $filename = substr($backupId, 8);
            $storagePath = "{$this->backupFolder}/{$filename}";
            $jsonDataset = str_replace('.sql', '.json', $storagePath);

            try {
                if (Storage::disk($disk)->exists($storagePath)) {
                    Storage::disk($disk)->delete($storagePath);
                }
                if (Storage::disk($disk)->exists($jsonDataset)) {
                    Storage::disk($disk)->delete($jsonDataset);
                }
                return ['success' => true, 'message' => 'Backup file deleted from storage'];
            } catch (\Exception $e) {
                return ['success' => false, 'message' => 'Delete failed: ' . $e->getMessage()];
            }
        }

        // Handle DB backup
        $backup = BackupHistory::find($backupId);

        if (!$backup) {
            return [
                'success' => false,
                'message' => 'Backup not found',
            ];
        }

        try {
            // Hapus file dari storage
            if (Storage::disk($backup->storage_disk)->exists($backup->storage_path)) {
                Storage::disk($backup->storage_disk)->delete($backup->storage_path);
            }

            // [NEW] Hapus file JSON metadata juga
            $jsonSame = str_replace('.sql', '.json', $backup->storage_path);
            if (Storage::disk($backup->storage_disk)->exists($jsonSame)) {
                Storage::disk($backup->storage_disk)->delete($jsonSame);
            }

            // Hapus record dari database
            $backup->delete();

            return [
                'success' => true,
                'message' => 'Backup deleted successfully',
            ];
        } catch (\Exception $e) {
            Log::error('Delete backup failed', [
                'backup_id' => $backupId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Generate SQL dump untuk tabel yang dipilih atau semua tabel
     * 
     * @param array|null $tables Null = semua tabel
     */
    protected function generateDump(?array $tables = null): string
    {
        $databaseName = DB::getDatabaseName();
        $dump = "-- Database Backup\n";
        $dump .= "-- Generated at: " . Carbon::now()->toDateTimeString() . "\n";
        $dump .= "-- Database: {$databaseName}\n\n";

        // Jika tidak ada tabel yang dipilih, ambil semua
        if ($tables === null) {
            $allTables = DB::select('SHOW TABLES');
            $key = "Tables_in_{$databaseName}";
            $tables = array_map(fn($t) => $t->$key, $allTables);

            // Filter system tables untuk full backup
            $tables = array_filter($tables, fn($t) => !in_array($t, $this->systemTables));
        }

        $dump .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableName) {
            $dump .= $this->dumpTable($tableName);
        }

        $dump .= "SET FOREIGN_KEY_CHECKS=1;\n";

        return $dump;
    }

    /**
     * Dump single table (structure + data)
     */
    protected function dumpTable(string $tableName): string
    {
        $dump = "-- Table: {$tableName}\n";
        $dump .= "-- --------------------------------------------------------\n\n";

        // Drop table if exists
        $dump .= "DROP TABLE IF EXISTS `{$tableName}`;\n\n";

        // Get create table statement
        $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
        if (isset($createTable[0])) {
            $dump .= $createTable[0]->{'Create Table'} . ";\n\n";
        }

        // Get table data
        $rows = DB::table($tableName)->get();

        if ($rows->count() > 0) {
            $columns = array_keys((array) $rows->first());
            $columnsList = implode('`, `', $columns);

            foreach ($rows as $row) {
                $values = array_map(function ($value) {
                    if ($value === null) {
                        return 'NULL';
                    }
                    return "'" . addslashes((string) $value) . "'";
                }, (array) $row);

                $valuesList = implode(', ', $values);
                $dump .= "INSERT INTO `{$tableName}` (`{$columnsList}`) VALUES ({$valuesList});\n";
            }
            $dump .= "\n";
        }

        return $dump;
    }

    /**
     * Format bytes ke human readable
     */
    protected function formatBytes(int $bytes): string
    {
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
