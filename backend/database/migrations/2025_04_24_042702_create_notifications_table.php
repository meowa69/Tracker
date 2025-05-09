<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotificationsTable extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('record_id'); // No unique constraint
            $table->string('notification_id')->unique();
            $table->string('document_no');
            $table->string('document_type');
            $table->string('vm_status');
            $table->string('cm_status')->nullable();
            $table->string('status');
            $table->string('status_color');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
}