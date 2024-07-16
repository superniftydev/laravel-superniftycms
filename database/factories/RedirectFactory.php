<?php

namespace Supernifty\CMS\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Supernifty\CMS\Models\Redirect;

class RedirectFactory extends Factory
{
    protected $model = Redirect::class;

    public function definition()
    {
        return [
            'id' => $this->faker->uuid(),
            'old_url' => $this->faker->url(),
            'new_url' => $this->faker->url(),
            'type' => $this->faker->randomElement(['301', '302']),
            'active' => $this->faker->randomElement([0, 1]),
            'created_by' => $this->faker->uuid(),
            'last_updated_by' => $this->faker->uuid(),
        ];
    }
}

/*
    $table->string('old_url',2500)->nullable();
    $table->string('new_url',2500)->nullable();
    $table->string('type',10)->default('301');
    $table->boolean('active')->nullable();
 */
