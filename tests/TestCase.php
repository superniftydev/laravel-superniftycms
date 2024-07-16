<?php

namespace Supernifty\CMS\Tests;

use Illuminate\Database\Eloquent\Factories\Factory;
use Orchestra\Testbench\TestCase as Orchestra;
use Supernifty\CMS\CMSServiceProvider;

class TestCase extends Orchestra
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Supernifty\\CMS\\Database\\Factories\\'.class_basename($modelName).'Factory'
        );
    }

    protected function getPackageProviders($app)
    {
        return [
            CMSServiceProvider::class,
        ];
    }

    public function getEnvironmentSetUp($app)
    {
        config()->set('database.default', 'testing');

        $media = include __DIR__.'/../database/migrations/create_media_table.php.stub';
        $redirects = include __DIR__.'/../database/migrations/create_redirects_table.php.stub';
        $topics = include __DIR__.'/../database/migrations/create_topics_table.php.stub';

        $media->up();
        $redirects->up();
        $topics->up();

    }
}
