<?php

namespace Supernifty\CMS;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Supernifty\CMS\Commands\CMSCommand;
use Supernifty\CMS\Facades\Helpers;
use Supernifty\CMS\Http\Controllers\MediaController;
use Supernifty\CMS\Http\Controllers\RedirectController;
use Supernifty\CMS\Http\Controllers\TopicController;
use Supernifty\CMS\Http\Controllers\YoastController;
use Supernifty\CMS\Models\Media;

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
        return view('vendor.superniftycms.admin.layouts.core');
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



            # admin
            Route::prefix($baseURL)->group(function () {

                Route::middleware(['auth'])->group(function () {

                    # topics
                    Route::get('/', [TopicController::class, 'cmsdash'])->name('superniftycms.cmsdash');
                    Route::get('topics/index/{do}', [ TopicController::class, 'index' ])->name('superniftycms.topics.index');
                    Route::post('topic/create', [ TopicController::class, 'create' ])->name('superniftycms.topics.create');
                    Route::match([ 'get', 'post' ], 'topic/edit/{id}', [ TopicController::class, 'edit' ])->name('superniftycms.topics.edit');
                    Route::post('topic/save', [ TopicController::class, 'save' ])->name('superniftycms.topics.save');
                    Route::post('topic/save/fe', [ TopicController::class, 'saveFe' ])->name('superniftycms.topics.savefe');
                    Route::post('topic/status/save', [ TopicController::class, 'saveTopicStatus' ])->name('superniftycms.topics.status.save');
                    Route::post('topic/validatetopicurl', [ TopicController::class, 'validatetopicurl' ])->name('superniftycms.topics.validateurl');
                    Route::post('topic/destroy/field', [ TopicController::class, 'destroyTopicField' ])->name('superniftycms.topics.destroy.field');
                    Route::post('topic//stfv', [ TopicController::class, 'saveTextFieldValue' ])->name('superniftycms.topics.stfv');
                    Route::post('topic/satfv', [ TopicController::class, 'saveAllTextFieldValues' ])->name('superniftycms.topics.satfv');
                    Route::match([ 'get', 'post' ],'topic/destroy', [ TopicController::class, 'destroy' ])->name('superniftycms.topics.destroy');

                    # media
                    Route::get('media/all/{topic_id?}/{type?}/{field?}', [ MediaController::class, 'index' ])->name('superniftycms.media.index');
                    Route::post('media/topic/assign', [ MediaController::class, 'assign' ])->name('superniftycms.media.assign');
                    Route::post('media/save', [ MediaController::class, 'saver' ])->name('superniftycms.media.saver');
                    Route::post('media/updatedetails', [ MediaController::class, 'updatedetails' ])->name('superniftycms.media.updatedetails');
                    Route::post('media/destroy/{media}', [ MediaController::class, 'destroy' ])->name('superniftycms.media.destroy');
                    Route::post('media/sort', [ MediaController::class, 'sort' ])->name('superniftycms.media.sort');


                    # redirects
                    Route::get('redirects', [ RedirectController::class, 'index' ])->name('superniftycms.redirects.index');
                    Route::post('redirects/create', [ RedirectController::class, 'create' ])->name('superniftycms.redirects.create');
                    Route::post('redirects/save', [ RedirectController::class, 'save' ])->name('superniftycms.redirects.save');
                    Route::post('redirects/destroy', [ RedirectController::class, 'destroy' ])->name('superniftycms.redirects.destroy');

                });
            });

            # render
            Route::match(
                [ 'get', 'post' ],
                '{a?}/{b?}/{c?}/{d?}/{e?}/{f?}/{g?}/{h?}/{i?}/{j?}/{k?}/{l?}/{m?}/{n?}/{o?}/{p?}/{q?}/{r?}/{s?}/{t?}/{u?}/{v?}/{w?}/{x?}/{y?}/{z?}',
                [ TopicController::class, 'render' ])
                ->where('a', '(?!'.config('superniftycms.urls.reserved').')[^\/]+')
                ->name('render.topic');

        });

        # Route::superniftyCMS('custom-route-prefix'); ---> /custom-route-prefix/dashboard


    }
}
