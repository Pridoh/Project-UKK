import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface NotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant: 'success' | 'error' | 'warning';
    title: string;
    message: string;
}

export function NotificationDialog({ open, onOpenChange, variant, title, message }: NotificationDialogProps) {
    const icons = {
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
        },
    };

    const { icon: Icon, bgColor, iconColor } = icons[variant];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bgColor}`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={() => onOpenChange(false)} variant={variant === 'error' ? 'destructive' : 'default'}>
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
