<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Supernifty\CMS\Tests\TestCase;

uses(TestCase::class)

    ->beforeEach(function () {

        Route::superniftyCMS();
    })



    ->in(__DIR__);
