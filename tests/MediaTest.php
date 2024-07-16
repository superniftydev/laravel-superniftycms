<?php

use Supernifty\CMS\Models\Media;

it('can create media model instance', function () {
    $media = Media::factory()->create();
    expect($media)->toBeInstanceOf(Media::class);
    // print_r($media->getAttributes());
});
