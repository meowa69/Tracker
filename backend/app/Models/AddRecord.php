<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AddRecord extends Model
{
    protected $table = 'add_record';
    protected $fillable = ['no', 'document_type', 'date_approved', 'title'];

    public function editRecord()
    {
        return $this->hasOne(EditRecord::class, 'record_id');
    }
}
