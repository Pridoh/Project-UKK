<?php

namespace App\Modules\Datavehicle\Models;

use App\Modules\Areaparkir\Models\VehicleType;
use App\Modules\Member\Models\Member;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tb_vehicles';

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
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'plat_nomor',
        'nama_pemilik',
        'vehicle_type_id',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'integer',
    ];

    /**
     * Relationship: Vehicle belongs to a vehicle type
     */
    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id', 'id');
    }

    /**
     * Relationship: Vehicle has many members (membership history)
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'vehicle_id', 'id');
    }

    /**
     * Relationship: Get the active member for this vehicle (singular)
     */
    public function member()
    {
        return $this->hasOne(Member::class, 'vehicle_id', 'id')
            ->where('end_date', '>=', now()->toDateString())
            ->where('start_date', '<=', now()->toDateString())
            ->latest('end_date');
    }

    /**
     * Get formatted status
     */
    public function getStatusLabelAttribute(): string
    {
        return $this->status === 1 ? 'Active' : 'Inactive';
    }

    /**
     * Scope: Filter by active status
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope: Filter by inactive status
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }
}
