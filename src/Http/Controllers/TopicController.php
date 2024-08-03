<?php

namespace Supernifty\CMS\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Supernifty\CMS\Facades\Helpers;
use Supernifty\CMS\Models\Topic;
use Throwable;

class TopicController extends Controller
{
    public function render(Request $request)
    {
        // dd($request->all());

        $error = 404;
        if ($request->path() === '/') {
            $url = config('superniftycms.urls.home');
        } else {
            $url = $request->path();
        }
        $topic = Topic::where('url', $url)->first();
        // dd($topic);

        // topic found
        if (isset($topic->id)) {

            // dd($topic->getAttributes());

            // topic not published and the user is not authenticated
            if (! auth()->check() && $topic->status !== config('superniftycms.access.topics.published')) {
                $error = 401;
            }

            // all good
            else {

                // confirm blade
                view()->exists($topic->blade) ? $blade = $topic->blade : $blade = 'auto';

                // return view
                return response()->view($blade, [
                    'topic' => $topic,
                ], 200);

            }

        }

        if (function_exists('sn_static_error')) {
            sn_handle_error($error);
        } else {
            Helpers::staticError($error);
        }

    }

    public function cmsdash(Request $request)
    {

        $user = Auth::user();
        if (config('superniftycms.access.cms.policy') !== '*') {
            if (config('superniftycms.access.cms.policy') === 'auth') {
                if (is_null($user)) {
                    return redirect()->guest(route('login'));
                }
            } else {
                $model = config('superniftycms.auth.model');
                $column = config('superniftycms.auth.column');
                $value = config('superniftycms.auth.value');
                if ($$model->$column !== $value) {
                    dd('you are not authorized to use this feature...');
                }
            }
        }

        return response()->view('cmsdash', [
            'user' => $user,
            'topics' => config('superniftycms.topics'),
        ], 200);
    }

    // confirm unique topic slug
    public function validatetopicurl(Request $request)
    {
        $result = 'ng';
        $reserved = ['admin', 'sn', 'supernifty', 'api'];
        if (! is_null($request->url) && ! is_null($request->id)) {
            if (strlen($request->url) < 3) {
                $result = 'short';
            } elseif (in_array($request->url, $reserved)) {
                $result = 'reserved';
            } else {

                $topic = Topic::where('url', sn_urlify($request->url))->first();
                if (isset($topic->id)) {
                    if ($topic->id !== $request->id) {
                        $result = 'taken';
                    } elseif ($topic->id === $request->id && $topic->url === $request->url) {
                        $result = 'stet';
                    } else {
                        $result = 'ok';
                    }
                } else {
                    $result = 'ok';
                }
            }
        }

        return response()->json([
            'status' => 200,
            'result' => $result,
        ]);
    }

    public function index($do)
    {

        $user = Auth::user();

        if ($do === 'redirects') {
            return redirect()->route('superniftycms.redirects.index');
        }

        $x = Topic::where('functionality', $do)->get();
        $key = array_search($do, array_column(config('superniftycms.topics'), 'functionality'));
        $settings = config("superniftycms.topics.{$key}");

        if (! $x->isEmpty()) {
            $topics = Helpers::organize_topics($x);
        } else {
            $topics = [];
        }

        // dd($topics, $key, $settings);

        return response()->view('topics.index', [
            'user' => $user,
            'topics' => Helpers::dash_topics($topics, 1),
            'settings' => $settings,
        ], 200);

    }

    // create new topic
    public function create(Request $request)
    {

        // dd($request->all());

        if (! is_null($request->clone_id)) {
            $original = Topic::find($request->clone_id);
            if (isset($original->id)) {
                $topic = $original->replicate();
                $content = $topic->content;
                foreach ($content as $key => $values) {
                    $content[$key]['value'] = '';
                }
                $topic->content = $content;
                $metas = $topic->metas;
                foreach ($metas as $key => $values) {
                    $metas[$key]['value'] = '';
                }
                $topic->metas = $metas;
                $topic->url = null;
            }
        }
        if (! isset($topic->content)) {
            $topic = new Topic;
            $topic->functionality = $request->functionality;
            $topic->content = sn_default_topic_content();
            $topic->metas = sn_default_topic_metas();
        }
        $topic->title = ucwords('New Untitled '.sn_config('topics.topics.'.$request->functionality.'.label'));
        $topic->status = 'draft';
        $topic->created_by = Auth::id();
        $topic->last_updated_by = Auth::id();

        $topic->save();
        if (! is_null($request->url_prefix)) {
            $topic->url = $request->url_prefix.'/'.$topic->id;
        } else {
            $topic->url = 'new-'.strtolower(sn_config('topics.topics.'.$request->functionality.'.label')).'-'.$topic->id;
        }
        $topic->save();

        return redirect()->route('be.topic.edit', ['id' => $topic->id]);
    }

    // edit topic content
    public function edit($id)
    {

        $user = Auth::user();
        $topic = Topic::find($id);
        if (isset($topic->content)) {

            // clean up content fields...
            $content = $topic->content;
            $content_fso = $content['sn_fso'];

            foreach ($content as $field_name => $values) {
                if (isset($content[$field_name]['type'])) {
                    if ($content[$field_name]['type'] === 'media') {
                        if (! isset($content[$field_name]['value'])) {
                            $content[$field_name]['value'] = [];
                        }
                        if (! isset($content[$field_name]['aft'])) {
                            $content[$field_name]['aft'] = 'jpg,png,gif';
                        }
                    } elseif ($content[$field_name]['type'] === 'text' || $content[$field_name]['type'] === 'richtext') {
                        if (! isset($content[$field_name]['value'])) {
                            $content[$field_name]['value'] = '';
                        }
                        if (! isset($content[$field_name]['max'])) {
                            $content[$field_name]['max'] = '999';
                        }
                    }
                }
            }

            foreach ($content_fso as $k => $field_name) {
                if (! array_key_exists($field_name, $content)) {
                    unset($content_fso[$k]);
                }
            }
            // dd($content_fso);

            foreach ($content as $k => $v) {
                if (! in_array($k, $content_fso) && $k !== 'sn_fso') {
                    $content_fso[] = $k;
                }
            }
            // if($k = array_search('sn_fso', $content_fso) !== false) { unset($content_fso[$k]); }
            $content['sn_fso'] = $content_fso;
            // $topic->content = $content;

            // clean up meta fields...

            // print "<pre>";
            // print_r($topic->content);
            // print_r($topic->metas);
            // exit;

            $topic = Helpers::get_topic_media($topic);

            // dd($topic->getAttributes());

            // dd($topic);
            if (str_contains($topic->url, '/')) {
                $x = explode('/', $topic->url);
                array_pop($x);
                $url_prefix = implode('/', $x);
            } else {
                $url_prefix = config('superniftycms.topics.'.$topic->functionality.'.public_url');
            }

            return response()->view('topics.edit', [
                'id' => $topic->id,
                'user' => $user,
                'sn_view_blades' => Helpers::get_blade_options($topic->functionality),
                'sn_text_blades' => Helpers::get_blade_options('components/fields/text'),
                'sn_media_blades' => Helpers::get_blade_options('components/fields/media'),
                'topic' => $topic,
                'url_prefix' => $url_prefix,
            ], 200);

        } else {
            abort(404);
        }

    }

    // save topic
    public function save(Request $request)
    {

        $result = 'ng';
        try {
            if (isset($request->id)) {
                $topic = Topic::find($request->id);
                if (isset($topic->id)) {

                    $old_content = $topic->content;
                    $new_content = $request->sn_content;
                    foreach ($new_content as $field_name => $values) {
                        if (! str_contains($field_name, 'sn_fso')) {
                            isset($old_content[$field_name]['sn_style']) ? $new_content[$field_name]['sn_css'] = $old_content[$field_name]['sn_style'] : $new_content[$field_name]['sn_css'] = '';
                            isset($old_content[$field_name]['sn_blade']) ? $new_content[$field_name]['sn_blade'] = $old_content[$field_name]['sn_blade'] : $new_content[$field_name]['sn_blade'] = '';
                        }
                    }
                    $topic->content = $new_content;

                    $topic->title = $request->title;
                    $topic->url = $request->url;
                    $topic->blade = $request->blade;
                    $topic->metas = $request->metas;
                    $topic->save();
                    $result = 'ok';
                    $message = 'Topic updated.';
                } else {
                    $message = 'Could not find that topic.';
                }
            } else {
                $message = 'No topic ID provided. Topic not updated.';
            }
        } catch (Throwable $e) {
            $result = 'error';
            $message = $e->getMessage();
            Log::error($message);
        }

        return response()->json([
            'status' => 200,
            'result' => $result,
            'message' => $message,
        ]);

    }

    public function saveFe(Request $request)
    {

        $html = null;
        $result = 'ng';
        try {
            if (isset($request->t)) {
                $topic = Topic::find($request->t);
                if (isset($topic->id)) {
                    $content = $topic->content;
                    $content[$request->f][$request->k] = $request->v;

                    if (isset($content[$request->f]['sn_style'])) {
                        unset($content[$request->f]['sn_style']);
                    }

                    $topic->content = $content;
                    $topic->save();
                    $topic->fresh();
                    $result = 'ok';
                    $message = 'Topic updated.';
                    if ($request->k === 'sn_blade') {
                        // determine blade location
                        // if($topic->content[$request->f]['type'] === 'media') $blade = "components.fields.{$topic->content[$request->f]['type']}.{$topic->content[$request->f]['aft']}.{$topic->content[$request->f]['sn_blade']}";
                        if ($topic->content[$request->f]['type'] === 'media') {
                            $blade = "components.fields.{$topic->content[$request->f]['type']}.images.{$topic->content[$request->f]['sn_blade']}";
                        } else {
                            $blade = "components.fields.{$topic->content[$request->f]['type']}.{$topic->content[$request->f]['sn_blade']}";
                        }
                        if (View::exists($blade)) {
                            $html = View::make($blade)->with('topic', $topic)->with('field_name', $request->f)->render();
                        } else {
                            $html = "<p style=\"border:2px dashed currentColor!important;margin:1rem auto!important;padding:2rem!important;width:50vw!important;text-align:center!important;\">View [ {$topic->content[$request->f]['sn_blade']} ] is missing!</p>";
                        }
                    }
                } else {
                    $message = 'Could not find that topic.';
                }
            } else {
                $message = 'No topic ID provided. Topic not updated.';
            }
        } catch (Throwable $e) {
            $result = 'error';
            $message = $e->getMessage();
            Log::error($message);
        }

        return response()->json([
            'status' => 200,
            'result' => $result,
            'message' => $message,
            'html' => $html,
        ]);

    }

    // save topic status
    public function saveTopicStatus(Request $request)
    {

        $result = 'ng';
        try {
            if (isset($request->url) && isset($request->status)) {
                $topic = Topic::where('url', $request->url)->first();
                if (isset($topic->id)) {
                    $topic->status = $request->status;
                    $topic->last_updated_by = Auth::id();
                    $topic->save();
                    $result = 'ok';
                    $message = 'Topic status updated.';
                } else {
                    $message = 'Could not find that topic.';
                }
            } else {
                $message = 'Missing data. Topic not updated.';
            }
        } catch (Throwable $e) {
            $result = 'error';
            $message = $e->getMessage();
            Log::error($message);
        }

        return response()->json([
            'status' => 200,
            'result' => $result,
            'message' => $message,
        ]);

    }

    // destroy topic field
    public function destroyTopicField(Request $request)
    {
        $data = $request->all();
        // print_r($data);
        // exit;
        $topic = Topic::find($data['topic_id']);
        if (isset($topic->id) && isset($data['field_to_destroy'])) {
            $content = $topic->content;
            if (isset($content[$data['field_to_destroy']])) {
                unset($content[$data['field_to_destroy']]);
            }
            if (isset($content['sn_fso']) && ($key = array_search($data['field_to_destroy'], $content['sn_fso'])) !== false) {
                unset($content['sn_fso'][$key]);
            }
            $topic->content = $content;
            $topic->save();

            return response()->json([
                'result' => 'ok',
                'status' => 200,
                'message' => "Field {$data['field_to_destroy']} was destroyed...",
            ]);
        }

        return response()->json([
            'result' => 'ng',
            'status' => 200,
            'message' => "Unable to destroy the {$data['field_to_destroy']} field...",
        ]);
    }

    // save the text field value
    public function saveTextFieldValue(Request $request)
    {
        $data = $request->all();
        if (isset($data['field_name']) && isset($data['topic_id'])) {
            $topic = Topic::find($data['topic_id']);
            if (isset($topic->id)) {

                isset($data['field_value']) ? $v = $data['field_value'] : $v = '';

                // topic title
                if ($request->field_type === 'topic_title') {
                    $topic->title = $v;
                }

                // content or metas
                else {
                    $field_type = $request->field_type;
                    $existing = $topic->{$field_type};
                    $existing[$data['field_name']]['value'] = $data['field_value'];
                    $topic->{$field_type} = $existing;
                }

                $topic->save();

                return response()->json([
                    'status' => 200,
                    'topic_id' => $topic->id,
                    'result' => 'ok',
                ]);
            }
        }

        return response()->json([
            'status' => 200,
            'topic_id' => $topic->id,
            'message' => 'Could not update field value',
            'result' => 'ng',
        ]);

    }

    // save the text field value
    public function saveAllTextFieldValues(Request $request)
    {

        $data = $request->all();
        // print_r($data);
        // exit;

        if (isset($data) && is_array($data) & count($data) > 0 && isset($data[0]['topic_id'])) {
            $topic = Topic::find($data[0]['topic_id']);
            if (isset($topic->id)) {
                $content = $topic->content;
                $metas = $topic->metas;
                foreach ($data as $field) {
                    if ($field['field_type'] === 'topic_title') {
                        $topic->title = $field['field_value'];
                    } elseif ($field['field_type'] === 'content') {
                        $content[$field['field_name']]['value'] = $field['field_value'];
                    } elseif ($field['field_type'] === 'metas') {
                        $metas[$field['field_name']]['value'] = $field['field_value'];
                    }
                }
                $topic->content = $content;
                $topic->metas = $metas;
                $topic->save();

                return response()->json([
                    'status' => 200,
                    'topic_id' => $topic->id,
                    'result' => 'ok',
                ]);
            }
        }

        return response()->json([
            'status' => 200,
            'topic_id' => $topic->id,
            'message' => 'Could not update field value',
            'result' => 'ng',
        ]);

    }

    // destroy topic
    public function destroy(Request $request)
    {
        $topic = Topic::find($request->topic_id);
        $topic->delete();

        return redirect()->route('superniftycms.topics.index', ['do' => $topic->functionality]);
    }

    public function settings($id, $do = false)
    {

        $topic = Topic::find($id);

        if ($topic->parent === null) {
            if ($do === false) {
                $do = 'edit_topic_settings_parent';
            }
            $parent = $topic;
            $child = Topic::where([['slug', '=', $topic->slug], ['parent', '=', $topic->id]])->latest()->first(); // representative child for index display sort order
            $secondary_topic = $child;
        } else {
            if ($do === false) {
                $do = 'edit_topic_settings_child';
            }
            $parent = Topic::find($topic->parent); // parent holds labeling
            $child = $topic;
            $secondary_topic = $parent;
        }
        $target_topic = $topic;

        return response()->view('be.topics.settings', [
            'do' => $do,
            'target_topic' => $target_topic,
            'secondary_topic' => $secondary_topic,
            'parent' => $parent,
            'child' => $child,
        ], 200);
    }

    // the below likely deprecated....

    public function deprecated_index($id)
    {
        if (isset($id)) {
            $parent = Topic::find($id);
            if (isset($parent->id)) {
                $children = Topic::where('parent', $parent->id)->orderBy('created_at', 'desc')->get();

                // dd($children);
                return response()->view('be.topics.index', [
                    'parent' => $parent,
                    'children' => $children,
                ], 200);
            }

            return response()->view('be.errors.basic', [
                'message' => "Couldn't find that topic.",
            ], 200);
        }
    }
}
