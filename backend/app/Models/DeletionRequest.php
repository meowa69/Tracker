<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeletionRequest extends Model
{
    protected $fillable = [
        'record_id',
        'user_name',
        'document_type',
        'number',
        'title',
        'reason',
        'status',
    ];

    public function record()
    {
        return $this->belongsTo(AddRecord::class, 'record_id');
    }
}