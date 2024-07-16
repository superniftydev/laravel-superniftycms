<?php

namespace Supernifty\CMS\Http\Controllers;

use App\Models\Redirect;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectController extends Controller
{

    # redirects index
    public function index() {
        $site = Site::where('domain', sn_site_domain())->first();
        return response()->view('be.redirects.index', [
            'site' => $site,
            'redirects' => Redirect::all()->sortBy([['created_at', 'desc']])
        ], 200);
    }

    public function create(Request $request) {

        $environment = Environment::where([
            ['domain', '=',sn_site_domain()],
            ['slug', '=', sn_site_environment()]
        ])->orWhere(function (Builder $query) {
            $query->where([
                ['domain_alias', '=', sn_site_domain()],
                ['slug', '=', sn_site_environment()]
            ]);
        })->first();

        if(isset($environment->id)){
            $redirect = new Redirect;
            $redirect->environment_id = $environment->id;
            $redirect->created_by = Auth::id();
            $redirect->old_url = $request->old_url;
            $redirect->new_url = $request->new_url;
            $redirect->type = $request->type;
            isset($request->active) ? $redirect->active = true : $redirect->active = false;
            $redirect->save();
            return redirect()->action([RedirectController::class, 'index']);
        }
        else dd('unable to create redirect...');
    }

    public function save(Request $request) {
        $redirect = Redirect::find($request->redirect_id);
        if(isset($redirect->id)){
            $redirect->old_url = $request->old_url;
            $redirect->new_url = $request->new_url;
            $redirect->type = $request->type;
            isset($request->active) ? $redirect->active = true : $redirect->active = false;
            $redirect->save();
            $result = "Redirect {$request->redirect_id} was updated...";
            $action = 'updated';
        }
        else {
            $result = "Unable to find redirect {$request->redirect_id}...";
            $action = 'failed';
        }

        isset($redirect->id) ? $redirect_id = $redirect->id : $redirect_id = 'N/A';
        return response()->json([
            'status' => 200,
            'result' => $result,
            'action' => $action,
            'redirect_id' => $redirect_id,
        ]);
    }

    # destroy redirect
    public function destroy(Request $request) {
        $redirect = Redirect::find($request->redirect_id);
        if(isset($redirect->id)){
            $redirect->delete();
            return response()->json([
                'status' => 200,
                'result' => "{$redirect->id} was deleted..."
            ]);
        }
    }




}
