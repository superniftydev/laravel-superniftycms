<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class SuperniftycmsAdminLayout extends Component
{
    public function render(): View
    {
        return view('vendor.superniftycms.admin.layouts.app');
    }
}
