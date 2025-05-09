<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeMember extends Model
{
    use HasFactory;

    protected $fillable = ['committee_id', 'term_id', 'member_name', 'role'];

    public function committee()
    {
        return $this->belongsTo(Committee::class);
    }

    public function term()
    {
        return $this->belongsTo(CommitteeTerm::class);
    }
}