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
        $roleAdminId = Str::uuid();

        DB::table('tb_role')->insert([
            'id' => $roleAdminId,
            'role_name' => 'Admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
