<?php

namespace Supernifty\CMS\Commands;

use Illuminate\Console\Command;

class CMSCommand extends Command
{
    public $signature = 'laravel-supernifty-cms';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
