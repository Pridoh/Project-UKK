import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

type VehicleType = {
    id: string;
    kode: string;
    nama_tipe: string;
};

type Vehicle = {
    id: string;
    plat_nomor: string;
    nama_pemilik: string | null;
    vehicle_type_id: string;
    vehicle_type: VehicleType;
    member?: {
        id: string;
        member_id: string;
        nama: string;
        tipe_member: number;
        diskon: string;
        end_date: string;
    };
};

type AreaParkir = {
    id: string;
    nama_area: string;
};

type User = {
    id: string;
    name: string;
};

type Transaction = {
    id: string;
    kode_transaksi: string;
    vehicle_id: string;
    area_id: string;
    vehicle_type_id: string;
    tarif_id: string | null;
    jam_masuk: string;
    jam_keluar: string | null;
    durasi: number | null;
    tarif_dasar: number;
    diskon: number;
    total_bayar: number;
    metode_pembayaran: number | null;
    status: number;
    vehicle: Vehicle;
    area: AreaParkir;
    vehicle_type: VehicleType;
    user?: User;
    formatted_total_bayar?: string;
    duration_formatted?: string;
};

type ReceiptModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction | null;
    type: 'checkin' | 'checkout';
};

const paymentMethods: { [key: number]: string } = {
    1: 'Tunai',
    2: 'Kartu Debit/Kredit',
    3: 'E-Wallet (Gopay)',
    4: 'E-Wallet (Dana)',
    5: 'E-Wallet (OVO)',
};

export function ReceiptModal({ open, onOpenChange, transaction, type }: ReceiptModalProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    // Generate QR code for check-in receipt
    useEffect(() => {
        if (transaction && type === 'checkin') {
            QRCode.toDataURL(transaction.kode_transaksi, {
                width: 200,
                margin: 1,
            })
                .then((url) => setQrCodeUrl(url))
                .catch((err) => console.error('QR Code generation error:', err));
        }
    }, [transaction, type]);

    const handlePrint = () => {
        window.print();
    };

    if (!transaction) return null;

    // Calculate duration for display
    const calculateDuration = () => {
        if (!transaction.jam_keluar) return null;
        const entryTime = new Date(transaction.jam_masuk);
        const exitTime = new Date(transaction.jam_keluar);
        const diffMs = exitTime.getTime() - entryTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        return { hours, minutes };
    };

    const duration = calculateDuration();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{type === 'checkin' ? 'Struk Masuk Parkir' : 'Struk Keluar Parkir'}</DialogTitle>
                </DialogHeader>

                {/* Receipt Content */}
                <div ref={receiptRef} className="receipt-content space-y-4">
                    {type === 'checkin' ? (
                        // Check-In Receipt
                        <div className="space-y-3 rounded-lg border p-4">
                            <div className="text-center">
                                <h3 className="text-lg font-bold">==================</h3>
                                <h3 className="text-lg font-bold">STRUK MASUK PARKIR</h3>
                                <h3 className="text-lg font-bold">==================</h3>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium">Area:</span>
                                    <span>{transaction.area.nama_area}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Jam Masuk:</span>
                                    <span>{format(new Date(transaction.jam_masuk), 'HH:mm')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Plat:</span>
                                    <span className="font-bold">{transaction.vehicle.plat_nomor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Tipe:</span>
                                    <span>{transaction.vehicle_type.nama_tipe}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="text-center">
                                    <p className="text-sm font-medium">Nomor Struk:</p>
                                    <p className="text-lg font-bold">{transaction.kode_transaksi}</p>
                                </div>

                                {/* QR Code */}
                                {qrCodeUrl && (
                                    <div className="flex justify-center">
                                        <img src={qrCodeUrl} alt="QR Code" className="h-32 w-32" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center text-xs text-muted-foreground">
                                <p>{format(new Date(transaction.jam_masuk), 'dd-MM-yyyy HH:mm:ss')}</p>
                                {transaction.user && <p>Operator: {transaction.user.name}</p>}
                            </div>
                        </div>
                    ) : (
                        // Check-Out Receipt
                        <div className="space-y-3 rounded-lg border p-4 print:border-0">
                            <div className="text-center">
                                <h3 className="text-lg font-bold">==================</h3>
                                <h3 className="text-lg font-bold">STRUK KELUAR PARKIR</h3>
                                <h3 className="text-lg font-bold">==================</h3>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium">Plat:</span>
                                    <span className="font-bold">{transaction.vehicle.plat_nomor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Jam Masuk:</span>
                                    <span>{format(new Date(transaction.jam_masuk), 'HH:mm')}</span>
                                </div>
                                {transaction.jam_keluar && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Jam Keluar:</span>
                                        <span>{format(new Date(transaction.jam_keluar), 'HH:mm')}</span>
                                    </div>
                                )}
                                {duration && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Durasi:</span>
                                        <span>
                                            {duration.hours} jam {duration.minutes} menit
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-medium">Tarif Dasar:</span>
                                    <span>Rp {transaction.tarif_dasar.toLocaleString('id-ID')}</span>
                                </div>
                                {transaction.diskon > 0 && (
                                    <div className="flex justify-between text-amber-600">
                                        <span className="font-medium">Diskon Member ({transaction.diskon}%):</span>
                                        <span>- Rp {((transaction.tarif_dasar * transaction.diskon) / 100).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>TOTAL BAYAR:</span>
                                    <span>Rp {transaction.total_bayar.toLocaleString('id-ID')}</span>
                                </div>
                                {transaction.metode_pembayaran && (
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Metode:</span>
                                        <span>{paymentMethods[transaction.metode_pembayaran]}</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="text-center">
                                <p className="font-medium">Terima Kasih!</p>
                                <p className="text-xs text-muted-foreground">
                                    Tanggal: {transaction.jam_keluar && format(new Date(transaction.jam_keluar), 'dd-MM-yyyy')}
                                </p>
                                {transaction.user && <p className="text-xs text-muted-foreground">Operator: {transaction.user.name}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 print:hidden">
                    <Button onClick={handlePrint} className="flex-1" variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Struk
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="flex-1">
                        Tutup
                    </Button>
                </div>

                {/* Print Styles - Thermal Receipt Size */}
                <style>{`
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 2mm;
                        }
                        
                        html, body {
                            width: 80mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            font-size: 10pt !important;
                        }
                        
                        body * {
                            visibility: hidden;
                        }
                        
                        .receipt-content,
                        .receipt-content * {
                            visibility: visible;
                        }
                        
                        .receipt-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 76mm !important;
                            max-width: 76mm !important;
                            padding: 2mm !important;
                            font-size: 9pt !important;
                            line-height: 1.3 !important;
                        }
                        
                        .receipt-content h3 {
                            font-size: 10pt !important;
                            margin: 0 !important;
                        }
                        
                        .receipt-content p,
                        .receipt-content span {
                            font-size: 9pt !important;
                        }
                        
                        .receipt-content .text-lg {
                            font-size: 10pt !important;
                        }
                        
                        .receipt-content .text-xl,
                        .receipt-content .text-2xl {
                            font-size: 12pt !important;
                        }
                        
                        .receipt-content img {
                            max-width: 40mm !important;
                            height: auto !important;
                        }
                        
                        .print\\:hidden {
                            display: none !important;
                        }
                        
                        .rounded-lg {
                            border-radius: 0 !important;
                        }
                        
                        .border {
                            border: none !important;
                        }
                        
                        .p-4 {
                            padding: 1mm !important;
                        }
                        
                        .space-y-4 > * + * {
                            margin-top: 2mm !important;
                        }
                        
                        .space-y-3 > * + * {
                            margin-top: 1.5mm !important;
                        }
                        
                        .space-y-2 > * + * {
                            margin-top: 1mm !important;
                        }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
