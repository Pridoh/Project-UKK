<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
    */
    public function run(): void
    {
        DB::table('tb_role')->insert([
            [
                'id' => Str::uuid(),
                'role_name' => 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'role_name' => 'Petugas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'role_name' => 'Owner',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
