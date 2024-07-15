<?php

namespace Supernifty\CMS\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Supernifty\CMS\CMS
 */
class CMS extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Supernifty\CMS\CMS::class;
    }
}
