<?php

use Supernifty\CMS\Models\Redirect;

it('can create redirect', function () {
    $redirect = Redirect::factory()->create();
    expect($redirect)->toBeInstanceOf(Redirect::class);
});

/*

    $table->uuid('id', 36)->primary();
    $table->uuid('environment_id', 36)->nullable();
    $table->string('old_url',2500)->nullable();
    $table->string('new_url',2500)->nullable();
    $table->string('type',10)->default('301');
    $table->boolean('active')->nullable();
    $table->uuid('created_by')->default('eaac9ce2-80ab-11ed-a1eb-0242ac120002');
    $table->uuid('last_updated_by')->default('eaac9ce2-80ab-11ed-a1eb-0242ac120002');
    $table->timestamps();

 */
