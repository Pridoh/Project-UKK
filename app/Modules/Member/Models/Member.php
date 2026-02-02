<?php

namespace App\Modules\Member\Models;

use App\Modules\Datavehicle\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tb_member';

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
     * Member type constants
     */
    const TIPE_REGULAR = 1;
    const TIPE_SILVER = 2;
    const TIPE_GOLD = 3;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'member_id',
        'vehicle_id',
        'nama',
        'tipe_member',
        'package_duration',
        'diskon',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tipe_member' => 'integer',
        'package_duration' => 'integer',
        'diskon' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Relationship: Member belongs to a vehicle
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id', 'id');
    }

    /**
     * Accessor for formatted discount display
     */
    public function getFormattedDiskonAttribute(): string
    {
        return number_format($this->diskon, 2) . '%';
    }

    /**
     * Accessor for member type label
     */
    public function getTipeMemberLabelAttribute(): string
    {
        return match ($this->tipe_member) {
            self::TIPE_REGULAR => 'Regular',
            self::TIPE_SILVER => 'Silver',
            self::TIPE_GOLD => 'Gold',
            default => 'Unknown',
        };
    }

    /**
     * Accessor for package duration label
     */
    public function getPackageDurationLabelAttribute(): string
    {
        return match ($this->package_duration) {
            1 => 'Monthly (1 Month)',
            3 => 'Quarterly (3 Months)',
            6 => 'Semi-Annual (6 Months)',
            12 => 'Yearly (1 Year)',
            default => 'Unknown',
        };
    }

    /**
     * Accessor for membership status
     */
    public function getStatusAttribute(): string
    {
        return $this->isActive() ? 'Active' : 'Expired';
    }

    /**
     * Accessor for days remaining until expiration
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->isActive()) {
            return 0;
        }
        return now()->diffInDays($this->end_date, false);
    }

    /**
     * Scope: Get active members (membership not expired)
     */
    public function scopeActive($query)
    {
        return $query->where('end_date', '>=', now()->toDateString());
    }

    /**
     * Scope: Get members with valid membership on a specific date
     */
    public function scopeValidOn($query, string $date)
    {
        return $query->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date);
    }

    /**
     * Check if membership is currently valid
     */
    public function isActive(): bool
    {
        $today = now()->toDateString();
        return $this->start_date <= $today && $this->end_date >= $today;
    }

    /**
     * Get member type options for dropdown
     */
    public static function getMemberTypes(): array
    {
        return [
            self::TIPE_REGULAR => 'Regular',
            self::TIPE_SILVER => 'Silver',
            self::TIPE_GOLD => 'Gold',
        ];
    }
}
