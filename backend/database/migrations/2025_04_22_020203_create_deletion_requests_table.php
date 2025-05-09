<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDeletionRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('deletion_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('record_id');
            $table->string('user_name');
            $table->string('document_type');
            $table->string('number');
            $table->text('title');
            $table->text('reason');
            $table->string('status')->default('Pending'); // e.g., Pending, Approved, Rejected
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('record_id')->references('id')->on('add_record')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('deletion_requests');
    }
}