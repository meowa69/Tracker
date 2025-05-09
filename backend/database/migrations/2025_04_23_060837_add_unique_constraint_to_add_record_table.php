<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUniqueConstraintToAddRecordTable extends Migration
{
    public function up()
    {
        Schema::table('add_record', function (Blueprint $table) {
            // Drop existing unique constraint on 'no' if it exists
            $table->dropUnique(['no']);
            
            // Add composite unique constraint on 'no' and 'document_type'
            $table->unique(['no', 'document_type'], 'add_record_no_document_type_unique');
        });
    }

    public function down()
    {
        Schema::table('add_record', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('add_record_no_document_type_unique');
            
            // Restore the original unique constraint on 'no' (if needed)
            $table->unique('no');
        });
    }
}