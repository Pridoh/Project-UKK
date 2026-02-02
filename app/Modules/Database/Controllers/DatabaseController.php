<?php

namespace App\Modules\Database\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Database\Services\DatabaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Controller untuk menangani backup dan restore database
 * Hanya accessible oleh Admin
 */
class DatabaseController extends Controller
{
    public function __construct(
        protected DatabaseService $databaseService
    ) {}

    /**
     * Halaman utama database management
     */
    public function index(): Response
    {
        $tables = $this->databaseService->getTables();
        $backups = $this->databaseService->getBackups();

        return Inertia::render('settings/database', [
            'tables' => $tables,
            'backups' => $backups,
        ]);
    }

    /**
     * Buat backup database
     */
    public function backup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tables' => 'nullable|array',
            'tables.*' => 'string',
            'notes' => 'nullable|string|max:500',
        ]);

        $tables = $validated['tables'] ?? [];
        $notes = $validated['notes'] ?? null;

        $result = $this->databaseService->createBackup(
            $tables,
            $notes,
            $request->user()->id
        );

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Restore database dari backup
     */
    public function restore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'backup_id' => 'required|string',
        ]);

        $result = $this->databaseService->restoreBackup($validated['backup_id']);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Restore database dari upload file manual
     */
    public function uploadRestore(Request $request): RedirectResponse
    {
        $request->validate([
            'backup_file' => 'required|file|mimes:sql,txt', // txt allowed just in case mime detection is weird for sql
        ]);

        $file = $request->file('backup_file');

        $result = $this->databaseService->restoreFromUpload($file);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Download backup file
     */
    public function download(string $id): BinaryFileResponse|RedirectResponse
    {
        $backup = $this->databaseService->getBackupForDownload($id);

        if (!$backup) {
            return back()->with('error', 'Backup file not found');
        }

        return response()->download(
            $backup['path'],
            $backup['filename'],
            ['Content-Type' => 'application/sql']
        );
    }

    /**
     * Hapus backup file
     */
    public function destroy(string $id): RedirectResponse
    {
        $result = $this->databaseService->deleteBackup($id);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }
}
