<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeTerm extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['term'];

    /**
     * Define the relationship with CommitteeMember.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function members()
    {
        return $this->hasMany(CommitteeMember::class, 'term_id');
    }

    /**
     * Define the relationship with EditRecord.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function editRecords()
    {
        return $this->hasMany(EditRecord::class, 'term_id');
    }
}