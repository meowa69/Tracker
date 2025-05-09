<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_id',
        'notification_id',
        'document_no',
        'document_type',
        'vm_status',
        'cm_status',
        'status',
        'status_color',
        'updated_at',
    ];

    // Relationship with AddRecord
    public function record()
    {
        return $this->belongsTo(AddRecord::class, 'record_id');
    }
}