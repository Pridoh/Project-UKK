<?php

namespace App\Modules\Tarifparkir\Models;

use App\Modules\Areaparkir\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TarifParkir extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tb_tarif_parkir';

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
        'vehicle_type_id',
        'durasi_min',
        'durasi_max',
        'harga',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'durasi_min' => 'integer',
        'durasi_max' => 'integer',
        'harga' => 'integer',
        'is_active' => 'integer',
    ];

    /**
     * Relationship: Tarif belongs to a vehicle type
     */
    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id', 'id');
    }

    /**
     * Accessor for formatted price
     */
    public function getFormattedHargaAttribute(): string
    {
        return 'Rp ' . number_format($this->harga, 0, ',', '.');
    }
}
