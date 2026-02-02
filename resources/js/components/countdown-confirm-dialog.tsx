import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as React from 'react';
import { useEffect, useState } from 'react';

interface CountdownConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: string | React.ReactNode;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'destructive' | 'default' | 'warning';
    loading?: boolean;
    countdownSeconds?: number;
}

/**
 * Dialog konfirmasi dengan countdown timer sebelum tombol confirm bisa ditekan
 * Digunakan untuk operasi kritis seperti restore database
 */
export function CountdownConfirmDialog({
    open,
    onOpenChange,
    title,
    message,
    onConfirm,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'destructive',
    loading = false,
    countdownSeconds = 5,
}: CountdownConfirmDialogProps) {
    const [countdown, setCountdown] = useState(countdownSeconds);
    const [canConfirm, setCanConfirm] = useState(false);

    // Reset countdown ketika dialog dibuka
    useEffect(() => {
        if (open) {
            setCountdown(countdownSeconds);
            setCanConfirm(false);
        }
    }, [open, countdownSeconds]);

    // Countdown timer
    useEffect(() => {
        if (!open || canConfirm) return;

        if (countdown <= 0) {
            setCanConfirm(true);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanConfirm(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open, countdown, canConfirm]);

    const getButtonVariant = () => {
        switch (variant) {
            case 'destructive':
                return 'destructive';
            case 'warning':
                return 'default'; // Or specific warning style if defined
            default:
                return 'default';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription asChild>
                        <div className="pt-2 text-sm text-muted-foreground">{message}</div>
                    </DialogDescription>
                </DialogHeader>

                {/* {!canConfirm && (
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="flex items-center gap-3 rounded-md bg-muted/50 px-4 py-3">
                            <div className="relative h-8 w-8">
                                <svg className="h-8 w-8 -rotate-90 transform">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        className="text-muted-foreground/20"
                                    />
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r="14"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeDasharray={88}
                                        strokeDashoffset={(countdown / countdownSeconds) * 88}
                                        className="text-primary transition-all duration-1000 ease-linear"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{countdown}</span>
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Please wait to confirm...</span>
                        </div>
                    </div>
                )} */}

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button variant={getButtonVariant()} onClick={onConfirm} disabled={!canConfirm || loading} className="min-w-[100px]">
                        {loading ? 'Processing...' : canConfirm ? confirmLabel : `Wait ${countdown}s`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
