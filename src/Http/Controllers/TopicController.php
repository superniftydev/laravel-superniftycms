<?php

namespace Supernifty\CMS\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Supernifty\CMS\Models\Topic;
use Throwable;

class TopicController extends Controller
{
    public function fuckme()
    {
        return 'fuckme';
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

    public function manage($do)
    {

        $user = Auth::user();
        if ($user->status === 'registered') {
            $user->status = 'active';
            $user->save();
        }

        // try the primary domain first
        $environment = Environment::where([
            ['domain', '=', sn_site_domain()],
            ['slug', '=', sn_site_environment()],
        ])->orWhere(function (Builder $query) {
            $query->where([
                ['domain_alias', '=', sn_site_domain()],
                ['slug', '=', sn_site_environment()],
            ]);
        })->first();
        // dd(sn_site_domain(), sn_site_environment(), $environment);

        if (sn_can('content')) {

            if ($do === 'redirects') {
                return redirect()->route('be.redirects.index');
            }

            $x = Topic::where('functionality', $do)->get();

            if (! $x->isEmpty()) {
                $topics = sn_organize_topics($x);
                $settings = sn_config('topics.topics.'.$x->first()->functionality);
                $settings['functionality'] = $x->first()->functionality;
            } else {
                $topics = [];
                $settings = sn_config('topics.topics.'.$do);
                $settings['functionality'] = $do;
            }

            return response()->view('be.manage', [
                'user' => $user,
                'topics' => $topics,
                'settings' => $settings,
            ], 200);

        }

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
            $topic = new Topic();
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
            $metas = $topic->metas;
            $metas_fso = $metas['sn_fso'];
            foreach ($metas as $field_name => $values) {
                if (isset($metas[$field_name]['type'])) {
                    if ($metas[$field_name]['type'] === 'media') {
                        if (! isset($metas[$field_name]['value'])) {
                            $metas[$field_name]['value'] = [];
                        }
                        if (! isset($metas[$field_name]['aft'])) {
                            $metas[$field_name]['aft'] = 'jpg,png,gif';
                        }
                    } elseif ($metas[$field_name]['type'] === 'text' || $metas[$field_name]['type'] === 'richtext') {
                        if (! isset($metas[$field_name]['value'])) {
                            $metas[$field_name]['value'] = '';
                        }
                        if (! isset($metas[$field_name]['max'])) {
                            $metas[$field_name]['max'] = '999';
                        }
                    }
                }
            }
            foreach ($metas_fso as $k => $field_name) {
                if (! array_key_exists($field_name, $metas)) {
                    unset($metas_fso[$k]);
                }
            }
            foreach ($metas as $k => $v) {
                if (! in_array($k, $metas_fso) && $k !== 'sn_fso') {
                    $metas_fso[] = $k;
                }
            }
            if ($k = array_search('sn_fso', $metas_fso) !== false) {
                unset($metas_fso[$k]);
            }
            $metas['sn_fso'] = array_values($metas_fso);
            $topic->metas = $metas;

            // $topic->save();

            // print "<pre>";
            // print_r($topic->content);
            // print_r($topic->metas);
            // exit;

            $topic = sn_get_topic_media($topic);

            // dd($topic);
            if (str_contains($topic->url, '/')) {
                $x = explode('/', $topic->url);
                array_pop($x);
                $url_prefix = implode('/', $x);
            } else {
                $url_prefix = sn_config('topics.topics.'.$topic->functionality.'.public_url');
            }

            return response()->view('be.topics.edit', [
                'id' => $topic->id,
                'user' => $user,
                'sn_page_layouts' => sn_page_layouts($topic->functionality),
                'sn_text_layouts' => sn_text_layouts(),
                'sn_media_layouts' => sn_media_layouts(),
                'topic' => $topic,
                'url_prefix' => $url_prefix,
            ], 200);

        } else {
            abort(404);
        }

    }

    // save the topic content
    public function save(UpdateTopicRequest $request)
    {

        $result = 'ng';
        try {
            if (isset($request->id)) {
                $topic = Topic::find($request->id);
                if (isset($topic->id)) {
                    $topic->title = $request->title;
                    $topic->url = $request->url;
                    $topic->content = $request->content;
                    $topic->layout = $request->layout;
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

    // topic group index
    public function index($id)
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

    // create new topic
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

    // save topic status
    public function saveTopicStatus(UpdateTopicRequest $request)
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
        $do = $topic->functionality;
        if (sn_can('content')) {
            $topic->delete();

            return redirect()->route('be.topics.manage', ['do' => $do]);
        }

        return redirect()->route('be.topics.manage', ['do' => $do])->with('error', 'You do not have permission to do this.');
    }

    public function zarp(Request $request)
    {

        $topic['content'] = [
            '12345' => [
                'headline' => [
                    'type' => 'text',
                    'max' => 99,
                    'value' => 'Hello!',
                ],
                'description' => [
                    'type' => 'text',
                    'max' => 99,
                    'value' => '<p>Just another description</p>',
                ],
                'featured_image' => [
                    'type' => 'text',
                    'max' => 99,
                    'value' => ['12345', '21345', '31254'],
                ],
                'cta_text' => [
                    'type' => 'text',
                    'max' => 99,
                    'value' => 'Learn More',
                ],
                'cta_link' => [
                    'type' => 'text',
                    'max' => 99,
                    'value' => 'http://google.com',
                ],
            ],
        ];

    }
}
