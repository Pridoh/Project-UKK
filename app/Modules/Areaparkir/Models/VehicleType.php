<?php

namespace App\Modules\Areaparkir\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Modules\Tarifparkir\Models\TarifParkir;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VehicleType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tb_vehicle_type';

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
        'kode',
        'nama_tipe',
        'deskripsi',
        // 'ukuran_slot', // Removed: slot size is managed in parking area menu
        // 'tarif_dasar', // Removed: tariffs are now managed in tarif menu
    ];

    /**
     * Relationship: Vehicle type has many capacity records
     */
    public function kapasitasArea(): HasMany
    {
        return $this->hasMany(KapasitasArea::class, 'vehicle_type_id', 'id');
    }

    /**
     * Relationship: Vehicle type has many tariffs
     */
    public function tariffs(): HasMany
    {
        return $this->hasMany(TarifParkir::class, 'vehicle_type_id', 'id');
    }
}
