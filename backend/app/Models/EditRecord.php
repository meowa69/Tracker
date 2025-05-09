<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EditRecord extends Model
{
    protected $table = 'edit_record';
    protected $fillable = [
        'record_id', 'committee_sponsor', 'status', 'vice_mayor_forwarded',
        'vice_mayor_received', 'city_mayor_forwarded', 'city_mayor_received',
        'date_transmitted', 'remarks', 'completed', 'completion_date'
    ];

    public function addRecord()
    {
        return $this->belongsTo(AddRecord::class, 'record_id');
    }

    public function transmittedRecipients()
    {
        return $this->hasMany(TransmittedRecipient::class, 'edit_record_id', 'id');
    }

    public function statusHistory()
    {
        return $this->hasMany(StatusHistory::class, 'edit_record_id', 'id');
    }
}

class StatusHistory extends Model
{
    protected $table = 'status_history';
    protected $fillable = ['edit_record_id', 'status', 'status_date'];
}