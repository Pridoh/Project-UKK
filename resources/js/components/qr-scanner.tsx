import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface QrScannerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (result: string) => void;
}

export function QrScanner({ open, onOpenChange, onScan }: QrScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isMountedRef = useRef(true);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2) {
                    // SCANNING state
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                // Ignore errors during cleanup
                console.log('Scanner cleanup:', err);
            } finally {
                scannerRef.current = null;
                if (isMountedRef.current) {
                    setIsScanning(false);
                }
            }
        }
    }, []);

    const startScanner = useCallback(async () => {
        // Check if we're in a secure context (HTTPS or localhost)
        if (!window.isSecureContext) {
            setError(
                'Akses kamera memerlukan HTTPS. Untuk menggunakan fitur ini dari perangkat lain, ' +
                'akses melalui HTTPS atau ketik kode transaksi secara manual.'
            );
            return;
        }

        const element = document.getElementById('qr-reader-container');
        if (!element) {
            setError('Container tidak ditemukan');
            return;
        }

        // Clear previous scanner if exists
        await stopScanner();

        try {
            setError(null);

            // Create new scanner instance
            const scanner = new Html5Qrcode('qr-reader-container', { verbose: false });
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 200, height: 200 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    // Successfully scanned
                    if (isMountedRef.current) {
                        onScan(decodedText);
                        stopScanner();
                        onOpenChange(false);
                    }
                },
                () => {
                    // QR code not found - this is called frequently, ignore
                },
            );

            if (isMountedRef.current) {
                setIsScanning(true);
                setIsInitialized(true);
            }
        } catch (err: any) {
            console.error('Failed to start scanner:', err);
            if (isMountedRef.current) {
                const errorStr = err?.toString() || '';
                const errorMsg = err?.message || 'Unknown error';
                
                if (errorStr.includes('Permission') || errorStr.includes('NotAllowed')) {
                    setError('Akses kamera ditolak. Mohon izinkan akses kamera di browser.');
                } else if (errorStr.includes('NotFound') || errorStr.includes('DevicesNotFound')) {
                    setError('Tidak ada kamera yang ditemukan pada perangkat ini.');
                } else if (errorStr.includes('NotReadable')) {
                    setError('Kamera sedang digunakan oleh aplikasi lain.');
                } else if (errorStr.includes('NotSupported') || errorStr.includes('TypeError')) {
                    setError('Browser tidak mendukung akses kamera. Gunakan HTTPS atau localhost.');
                } else {
                    setError('Gagal mengakses kamera: ' + errorMsg);
                }
            }
        }
    }, [onScan, onOpenChange, stopScanner]);

    // Handle dialog open/close
    useEffect(() => {
        isMountedRef.current = true;

        if (open) {
            // Delay to ensure DOM is ready
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    startScanner();
                }
            }, 300);
            return () => {
                clearTimeout(timer);
            };
        } else {
            // Stop scanner when dialog closes
            stopScanner();
            setIsInitialized(false);
            setError(null);
        }

        return () => {
            isMountedRef.current = false;
        };
    }, [open, startScanner, stopScanner]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            stopScanner();
        };
    }, [stopScanner]);

    const handleClose = async () => {
        await stopScanner();
        onOpenChange(false);
    };

    const handleRetry = () => {
        setError(null);
        startScanner();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Scan QR Code
                    </DialogTitle>
                    <DialogDescription>Arahkan kamera ke QR Code pada struk parkir</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* QR Scanner Container */}
                    <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-lg bg-black">
                        <div id="qr-reader-container" className="h-full w-full" />
                        {!isScanning && !error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <div className="text-center text-white">
                                    <Camera className="mx-auto mb-2 h-12 w-12 animate-pulse" />
                                    <p className="text-sm">Memulai kamera...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    {isScanning && (
                        <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-center text-sm text-muted-foreground">Posisikan QR Code di dalam kotak untuk scan otomatis</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        {error && (
                            <Button onClick={handleRetry} className="flex-1">
                                Coba Lagi
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleClose} className="flex-1">
                            Batal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
