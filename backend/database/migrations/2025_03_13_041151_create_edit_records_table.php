<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Original edit_record table (modified to remove transmitted_to)
        Schema::create('edit_record', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('record_id');
            $table->string('committee_sponsor')->nullable();
            $table->string('status')->nullable();
            $table->date('vice_mayor_forwarded')->nullable();
            $table->date('vice_mayor_received')->nullable();
            $table->date('city_mayor_forwarded')->nullable();
            $table->date('city_mayor_received')->nullable();
            $table->date('date_transmitted')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('completed')->default(false);
            $table->date('completion_date')->nullable();
            $table->timestamps();

            $table->foreign('record_id')->references('id')->on('add_record')->onDelete('cascade');
        });

        // New table for transmitted recipients
        Schema::create('transmitted_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('edit_record_id');
            $table->string('salutation')->nullable();
            $table->string('name');
            $table->string('designation')->nullable();
            $table->string('office')->nullable();
            $table->text('address');
            $table->timestamps();

            $table->foreign('edit_record_id')->references('id')->on('edit_record')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transmitted_recipients');
        Schema::dropIfExists('edit_record');
    }
};