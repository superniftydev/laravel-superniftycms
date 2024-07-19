<?php

namespace Supernifty\CMS;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Supernifty\CMS\Commands\CMSCommand;
use Supernifty\CMS\Http\Controllers\TopicController;

class CMSServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        # https://github.com/spatie/laravel-package-tools
        $package
            ->name('laravel-superniftycms')
            ->hasConfigFile()
            ->hasViews()
            ->hasAssets()
            ->hasMigrations([
                'create_superniftycms_media_table',
                'create_superniftycms_topics_table',
                'create_superniftycms_redirects_table'
            ])
            ->runsMigrations()
            ->hasCommand(CMSCommand::class)
            ->hasInstallCommand(function(InstallCommand $command) {

                $command
                    ->startWith(function(InstallCommand $command) {
                        $command->info('Installing superniftycms...');
                    })
                    ->publishConfigFile()
                    ->publishAssets()
                    ->publishMigrations()
                    ->askToRunMigrations()
                    ->copyAndRegisterServiceProviderInApp()
                    ->endWith(function(InstallCommand $command) {

                        $viewComponent=<<<EOD
<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class SuperniftycmsLayout extends Component
{
    public function render(): View
    {
        return view('vendor.superniftycms.layouts.core');
    }
}

EOD;
                        File::put(base_path('app/View/Components/SuperniftycmsLayout.php'), $viewComponent);
                        File::append(base_path('routes/web.php'), "\n\n# added by the superniftycms installation process...\nChange 'cms' to your preferred url for access to the CMS\nRoute::superniftycms(config('superniftycms.url'));\n\n");
                        Artisan::call('vendor:publish --tag=superniftycms-views');
                    });

            });
    }

    public function packageRegistered()
    {

        # routes
        Route::macro('superniftycms', function (string $baseURL = 'cms') {

            Route::prefix($baseURL)->group(function () {

                Route::get('/', [TopicController::class, 'dashboard'])->name('superniftycms.topics.dashboard');

                Route::post('topic/validatetopicurl', [ TopicController::class, 'validatetopicurl' ])->name('superniftycms.topics.validateurl');
                Route::post('topic/status/save', [ TopicController::class, 'saveTopicStatus' ])->name('superniftycms.topics.status.save');

                Route::get('topics/manage/{do}', [ TopicController::class, 'manage' ])->name('superniftycms.topics.manage');
                Route::post('topic/create', [ TopicController::class, 'create' ])->name('superniftycms.topics.create');
                Route::match([ 'get', 'post' ], 'topic/edit/{id}', [ TopicController::class, 'edit' ])->name('superniftycms.topics.edit');
                Route::post('topic/save', [ TopicController::class, 'save' ])->name('superniftycms.topics.save');

                Route::post('topic/destroy/field', [ TopicController::class, 'destroyTopicField' ])->name('superniftycms.topics.destroy.field');
                Route::post('topic//stfv', [ TopicController::class, 'saveTextFieldValue' ])->name('superniftycms.topics.stfv');
                Route::post('topic/satfv', [ TopicController::class, 'saveAllTextFieldValues' ])->name('superniftycms.topics.satfv');
                Route::match([ 'get', 'post' ],'topic/destroy', [ TopicController::class, 'destroy' ])->name('superniftycms.topics.destroy');

            });

        });

        // Route::superniftyCMS('whatever-the-developer-wants'); # /whatever-the-developer-wants/fuckme

    }
}
