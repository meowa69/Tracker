<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('add_record', function (Blueprint $table) {
            $table->id();
            $table->string('no')->unique(); // Ensure "No" is unique
            $table->enum('document_type', ['Ordinance', 'Resolution', 'Motion']);
            $table->date('date_approved');
            $table->text('title'); 
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('add_record', function (Blueprint $table) {
            $table->string('title', 255)->change(); // Rollback to original
        });
    }
};
