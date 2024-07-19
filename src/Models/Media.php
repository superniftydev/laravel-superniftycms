<?php

namespace Supernifty\CMS\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'superniftycms_media';

    protected $fillable = [
        'id',
        'location',
        'type',
        'vendor_media_id',
        'metas',
        'created_by',
        'last_updated_by',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'metas' => 'array',
    ];
}

/*

[id] => 9c26ee4f-e577-45b1-aea2-9699b9e8ec5b
[location] => sn
[type] => jpg
[vendor_media_id] =>
[metas] => {"title": "Grinding-1.jpg", "original_file_size": 871553}
[created_by] => 9bd62196-22cc-4e79-a84b-cf26be1ce20b
[last_updated_by] => 9bd62196-22cc-4e79-a84b-cf26be1ce20b
[created_at] => 2024-05-28 15:30:09
[updated_at] => 2024-05-28 15:30:09
*/
