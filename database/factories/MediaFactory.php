<?php

namespace Supernifty\CMS\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Supernifty\CMS\Models\Media;

class MediaFactory extends Factory
{
    protected $model = Media::class;

    public function definition()
    {
        return [
            'id' => $this->faker->uuid(),
            'location' => $this->faker->randomElement(['local', 's3', 'do', 'youtube', 'vimeo']),
            'type' => $this->faker->randomElement(['jpg', 'png', 'gif', 'mp4', 'pdf', 'docx', 'doc', 'xls', 'xlsx']),
            'vendor_media_id' => $this->faker->randomElement(['', '', '', '', '', '', '', '12345', '']),
            'created_by' => $this->faker->uuid(),
            'last_updated_by' => $this->faker->uuid(),

        ];
    }
}

/*
    $table->uuid('id', 36)->primary();
    $table->string('location',25); # local | youtube | vimeo | aws | do | etc
    $table->string('type',25); # jpg | png | gif | m4v | pdf | doc | aif | etc
    $table->string('vendor_media_id',250)->nullable(); # youtube video id | vimeo video id
    $table->json('metas')->nullable();
    $table->uuid('created_by');
    $table->uuid('last_updated_by');
    $table->timestamps();
 */
