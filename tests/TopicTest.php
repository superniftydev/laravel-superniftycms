<?php


use Supernifty\CMS\Models\Topic;

it('can create a topic', function () {
    $topic = Topic::factory()->create();
    expect($topic)->toBeInstanceOf(Topic::class);
});
