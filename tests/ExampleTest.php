<?php

use Supernifty\CMS\Commands\CMSCommand;
use Symfony\Component\Console\Command\Command as CommandAlias;

use function Pest\Laravel\artisan;

it('can ploob in the starmaron', function () {
    artisan(CMSCommand::class)->assertExitCode(CommandAlias::SUCCESS);
    expect(true)->toBeTrue();
});
