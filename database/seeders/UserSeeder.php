<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    /**
     * Seeders for Dummy User.
     */
    public function run(): void
    {
        $roleAdminId = DB::table('tb_role')->where('role_name', 'Admin')->value('id');

        DB::table('tb_user')->insert([
            'id' => Str::uuid(),
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@example.com',
            // 'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'is_active' => 1,
            'role_id' => $roleAdminId,
            // 'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
