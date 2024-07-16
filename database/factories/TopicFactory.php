<?php

namespace Supernifty\CMS\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Supernifty\CMS\Models\Topic;


class TopicFactory extends Factory
{
    protected $model = Topic::class;

    public function definition()
    {
        return [
            'id' => $this->faker->uuid(),
            'url' => $this->faker->filePath(),
            'title' => $this->faker->sentence(),
            'functionality' => $this->faker->unique()->word(),
            'layout' => $this->faker->randomElement(['custom','post','home','about','contact','default']),
            'status' => $this->faker->randomElement(['draft','live','review','feedback','copy','layout']),
        ];
    }
}


/*
    $table->uuid('id', 36)->primary();
    $table->string('url', 500)->unique()->nullable();
    $table->string('title',500)->default('Untitled Topic')->index();
    $table->string('functionality', 250)->default('posts'); # posts|pages|forms|components|etc...
    $table->string('layout', 250)->default('default'); # if sn_config('app.default_blade_template') is not set
    $table->json('settings')->nullable();
    $table->json('content')->nullable();
    $table->json('metas')->nullable();
    $table->string('status', 250)->default('draft');
    $table->uuid('created_by')->default('eaac9ce2-80ab-11ed-a1eb-0242ac120002');
    $table->uuid('last_updated_by')->default('eaac9ce2-80ab-11ed-a1eb-0242ac120002');
    $table->timestamps();
 */
