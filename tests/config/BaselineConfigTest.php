<?php


use Supernifty\CMS\Commands\CMSCommand;
use Symfony\Component\Console\Command\Command as CommandAlias;
use function Pest\Laravel\artisan;

it('confirm baseline config functionality', function () {
    artisan(CMSCommand::class)
        ->expectsOutput(config('supernifty-cms.command_output'))
        ->assertExitCode(0);
});




