<?php


use Supernifty\CMS\Http\Controllers\TopicController;

it('has a route', function() {

    $this
        ->get(action([TopicController::class,'fuckme']))
        ->assertOK()
        ->assertSee('fuckme');


});
