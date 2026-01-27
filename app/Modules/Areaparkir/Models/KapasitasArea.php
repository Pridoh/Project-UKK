<?php

namespace App\Modules\Areaparkir\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KapasitasArea extends Model
{
    use HasFactory;

    protected $table = 'tb_kapasitas_area';

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
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'area_id',
        'vehicle_type_id',
        'kapasitas',
    ];

    /**
     * Relationship: Capacity belongs to an area
     */
    public function areaParkir(): BelongsTo
    {
        return $this->belongsTo(AreaParkir::class, 'area_id', 'id');
    }

    /**
     * Relationship: Capacity belongs to a vehicle type
     */
    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id', 'id');
    }
}
