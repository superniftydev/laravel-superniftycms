<?php

namespace Supernifty\CMS;

use Illuminate\Support\Facades\Route;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Supernifty\CMS\Commands\CMSCommand;
use Supernifty\CMS\Http\Controllers\TopicController;

class CMSServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package
            ->name('laravel-superniftycms')
            ->hasConfigFile()
            ->hasViews()
            ->hasAssets()
            ->hasMigration('create_media_table')
            ->hasMigration('create_topics_table')
            ->hasMigration('create_redirects_table')
            ->hasCommand(CMSCommand::class);
    }

    public function packageRegistered()
    {

        Route::macro('superniftycms', function (string $baseURL = 'dashboard') {
            Route::prefix($baseURL)->group(function () {
                Route::get('fuckme', [TopicController::class, 'fuckme']);
                Route::get('eatshit', [TopicController::class, 'eatshit']);
                Route::get('dieinafire', [TopicController::class, 'dieinafire']);

            });
        });

        // Route::superniftyCMS('whatever-the-developer-wants'); # /whatever-the-developer-wants/fuckme

    }
}
