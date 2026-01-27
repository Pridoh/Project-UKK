<?php

namespace App\Modules\Areaparkir\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AreaParkir extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tb_area';

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
        'kode_area',
        'nama_area',
        'lokasi',
    ];

    /**
     * Relationship: Area has many capacity records (one per vehicle type)
     */
    public function kapasitasArea(): HasMany
    {
        return $this->hasMany(KapasitasArea::class, 'area_id', 'id');
    }
}
