<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('histories', function (Blueprint $table) {
            $table->index('username');
            $table->index('document_type');
            $table->index('document_no');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::table('histories', function (Blueprint $table) {
            $table->dropIndex(['username']);
            $table->dropIndex(['document_type']);
            $table->dropIndex(['document_no']);
            $table->dropIndex(['action']);
            $table->dropIndex(['created_at']);
        });
    }
};