<?php

namespace App\Modules\Transaction\Models;

use App\Modules\Areaparkir\Models\AreaParkir;
use App\Modules\Areaparkir\Models\VehicleType;
use App\Modules\Datavehicle\Models\Vehicle;
use App\Modules\Tarifparkir\Models\TarifParkir;
use App\Modules\User\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'tb_transaksi';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Transaction status constants
     */
    const STATUS_IN = 1;      // Vehicle is currently parked
    const STATUS_OUT = 2;     // Vehicle has exited
    const STATUS_CANCELLED = 3; // Transaction cancelled

    /**
     * Payment method constants
     */
    const PAYMENT_CASH = 1;
    const PAYMENT_CARD = 2;
    const PAYMENT_EWALLET = 3;

    /**
     * Payment status constants
     */
    const PAYMENT_STATUS_PAID = 1;
    const PAYMENT_STATUS_PENDING = 2;
    const PAYMENT_STATUS_FAILED = 3;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'kode_transaksi',
        'vehicle_id',
        'area_id',
        'vehicle_type_id',
        'tarif_id',
        'user_id',
        'jam_masuk',
        'jam_keluar',
        'durasi',
        'tarif_dasar',
        'diskon',
        'total_bayar',
        'metode_pembayaran',
        'payment_status',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'jam_masuk' => 'datetime',
        'jam_keluar' => 'datetime',
        'durasi' => 'integer',
        'tarif_dasar' => 'integer',
        'diskon' => 'decimal:2',
        'total_bayar' => 'integer',
        'metode_pembayaran' => 'integer',
        'payment_status' => 'integer',
        'status' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'formatted_total_bayar',
        'formatted_tarif_dasar',
        'duration_formatted',
        'status_label',
    ];

    /**
     * Relationship: Transaction belongs to a vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id', 'id');
    }

    /**
     * Relationship: Transaction belongs to a parking area
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(AreaParkir::class, 'area_id', 'id');
    }

    /**
     * Relationship: Transaction belongs to a vehicle type
     */
    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id', 'id');
    }

    /**
     * Relationship: Transaction belongs to a tariff
     */
    public function tarif(): BelongsTo
    {
        return $this->belongsTo(TarifParkir::class, 'tarif_id', 'id');
    }

    /**
     * Relationship: Transaction belongs to a user (operator who processed it)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Accessor for formatted total payment
     */
    public function getFormattedTotalBayarAttribute(): string
    {
        return 'Rp ' . number_format($this->total_bayar, 0, ',', '.');
    }

    /**
     * Accessor for formatted base tariff
     */
    public function getFormattedTarifDasarAttribute(): string
    {
        return 'Rp ' . number_format($this->tarif_dasar, 0, ',', '.');
    }

    /**
     * Accessor for formatted discount
     */
    public function getFormattedDiskonAttribute(): string
    {
        return number_format($this->diskon, 2) . '%';
    }

    /**
     * Accessor for formatted duration (e.g., "2 jam 30 menit")
     */
    public function getDurationFormattedAttribute(): string
    {
        if (!$this->durasi) {
            return '-';
        }

        $hours = floor($this->durasi / 60);
        $minutes = $this->durasi % 60;

        $parts = [];
        if ($hours > 0) {
            $parts[] = $hours . ' jam';
        }
        if ($minutes > 0) {
            $parts[] = $minutes . ' menit';
        }

        return implode(' ', $parts) ?: '0 menit';
    }

    /**
     * Accessor for status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_IN => 'Parkir',
            self::STATUS_OUT => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
            default => 'Unknown',
        };
    }

    /**
     * Accessor for payment method label
     */
    public function getPaymentMethodLabelAttribute(): string
    {
        return match ($this->metode_pembayaran) {
            self::PAYMENT_CASH => 'Tunai',
            self::PAYMENT_CARD => 'Kartu',
            self::PAYMENT_EWALLET => 'E-Wallet',
            default => '-',
        };
    }

    /**
     * Accessor for payment status label
     */
    public function getPaymentStatusLabelAttribute(): string
    {
        return match ($this->payment_status) {
            self::PAYMENT_STATUS_PAID => 'Lunas',
            self::PAYMENT_STATUS_PENDING => 'Pending',
            self::PAYMENT_STATUS_FAILED => 'Gagal',
            default => '-',
        };
    }

    /**
     * Scope: Get active transactions (vehicles currently parked)
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_IN);
    }

    /**
     * Scope: Get completed transactions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_OUT);
    }

    /**
     * Scope: Get transactions by date range
     */
    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('jam_masuk', [$startDate, $endDate]);
    }

    /**
     * Get payment method options for dropdown
     */
    public static function getPaymentMethods(): array
    {
        return [
            self::PAYMENT_CASH => 'Tunai',
            self::PAYMENT_CARD => 'Kartu',
            self::PAYMENT_EWALLET => 'E-Wallet',
        ];
    }

    /**
     * Get status options
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_IN => 'Parkir',
            self::STATUS_OUT => 'Selesai',
            self::STATUS_CANCELLED => 'Dibatalkan',
        ];
    }
}
