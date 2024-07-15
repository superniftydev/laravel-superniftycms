<?php

namespace Supernifty\CMS;

use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Supernifty\CMS\Commands\CMSCommand;

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
            ->name('laravel-supernifty-cms')
            ->hasConfigFile()
            ->hasViews()
            ->hasMigration('create_laravel-supernifty-cms_table')
            ->hasCommand(CMSCommand::class);
    }
}
