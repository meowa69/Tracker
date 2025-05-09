<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransmittedRecipient extends Model
{
    protected $table = 'transmitted_recipients';

    protected $fillable = [
        'edit_record_id',
        'salutation',
        'name',
        'designation',
        'office',
        'address',
    ];

    public function editRecord()
    {
        return $this->belongsTo(EditRecord::class, 'edit_record_id', 'id');
    }
}