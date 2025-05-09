<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('status_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('edit_record_id');
            $table->string('status');
            $table->date('status_date');
            $table->timestamps();

            $table->foreign('edit_record_id')->references('id')->on('edit_record')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('status_history');
    }
};