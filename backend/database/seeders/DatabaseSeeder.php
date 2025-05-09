<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Check if the admin user already exists
        if (!User::where('user_name', 'admin')->exists()) {
            User::create([
                'name' => 'Admin',
                'user_name' => 'admin',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
            ]);
        }

        $this->command->info('Admin account seeded successfully!');
    }
}
