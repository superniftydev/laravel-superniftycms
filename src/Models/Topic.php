<?php

namespace Supernifty\CMS\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'superniftycms_topics';

    public $guarded = [];

    // declaring media as a public variable means Laravel will ignore it when calling $topic->save();
    public $medias;

    public $mediaJSON;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'slug',
        'parent',
        'content',
        'tags',
        'settings',
        'content',
        'metas',
        'status',
    ];

    protected $casts = [
        'settings' => 'json',
        'content' => 'json',
        'metas' => 'json',
    ];
}
