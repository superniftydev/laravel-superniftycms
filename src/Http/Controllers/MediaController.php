<?php

namespace Supernifty\CMS\Http\Controllers;

use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\WebM;
use FFMpeg\Format\Video\WMV;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;
use InvalidArgumentException;
use Maestroerror\HeicToJpg;
use Supernifty\CMS\Facades\Helpers;
use Supernifty\CMS\Models\Media;
use Supernifty\CMS\Models\Topic;
use Throwable;

class MediaController extends Controller
{

    protected $table = 'superniftycms_media';


    public function index($topic_id = false, $topic_field_type = false, $topic_field = false)
    {

        $rawMedia = Media::orderByRaw('updated_at DESC')->get(); // all media
        $ids = $rawMedia->pluck('id')->toArray();

        // dd($ids, $topic_id, $topic_field);

        // get field-specific media
        $topic = null;
        $fieldMedia = '';
        if ($topic_id && $topic_field_type && $topic_field) {
            $topic = Topic::find($topic_id);
            // dd($ids, $topic_id, $topic_field_type, $topic_field, $topic);
            if (
                isset($topic->{$topic_field_type}) &&
                isset($topic->{$topic_field_type}[$topic_field]) &&
                is_array($topic->{$topic_field_type}[$topic_field]) &&
                count($topic->{$topic_field_type}[$topic_field]) > 0
            ) {
                $fieldMedia = implode('|', $topic->{$topic_field_type}[$topic_field]['value']);
            }
        }

        $data = [
            'allMedia' => Helpers::dropzone_media($ids),
            'fieldMedia' => $fieldMedia,
            'topic' => $topic,
            'topic_field_type' => $topic_field_type,
            'topic_field' => $topic_field,
        ];

        // dd($data);

        return response()->view('media.index', $data);

    }



    public function saver(Request $request)
    {

        try {


            # featured image is being uploaded
            if(
                $request->hasFile('file') &&
                $request->has('featured_media_id')
            ){

                $topic = Topic::find($request->topic_id);
                if(isset($topic->id)){
                    $file = $request->file('file');
                    $dimensions = explode('x', config('superniftycms.uploads.images.featured.dimensions'));
                    if(Str::isUuid($request->featured_media_id)) $media = Media::find($request->featured_media_id);
                    if(!isset($media->id)){
                        $media = new Media;
                        $media->created_by = Auth::id();
                        $media->last_updated_by = Auth::id();
                    }
                    $media->type = $file->extension(); // jpg | png | gif
                    $media->save();
                    $media->refresh();
                    $manager = new ImageManager(
                        Driver::class,
                        autoOrientation: true,
                        decodeAnimation: true,
                        blendingColor: '232527'
                    );
                    $image = $manager->read($request->file('file'));
                    $image->cover($dimensions[0], $dimensions[1]);
                    Storage::disk(config('superniftycms.uploads.disk'))->put(config('superniftycms.uploads.storage_directory')."/{$media->id}/original.".$file->extension(), (string) $image->encodeByExtension($file->extension()), 'public');

                    $metas = $topic->metas;
                    $metas['featured_media_id'] = $media->id;
                    $topic->metas = $metas;
                    $topic->save();
                    return response()->json([
                        'status' => 200,
                        'topic' => $topic,
                        'media' => $media,
                        'featured_media_id' => $media->id,
                        'message' => 'the featured image has been updated...',
                    ]);


                }



            }

            # standard media files
            else {

                $topic = Topic::find($request->topic_id);
                $media = Media::find($request->media_id);

                # new
                if(!isset($media->id)) {
                    $media = new Media;
                    $media->created_by = Auth::id();
                    $media->last_updated_by = Auth::id();
                }

                # external vendor
                if(isset($request->vendor_media_id)) {
                    $media->vendor_media_id = $request->vendor_media_id;
                    $media->type = $request->type;
                }

                # update metas
                if(isset($request->metas)) $media = Helpers::update_media_metas($media, $request->metas);

                # add the media to the topic content sort order
                if (
                    isset($topic->content) &&
                    $request->has('topic_field') &&
                    $request->has('field_type') # 'content' | 'metas'
                ) {
                    if($request->field_type === 'content') $holder = $topic->content;
                    else $holder = $topic->metas;
                    if(!is_array($holder)) $holder = [];
                    if(isset($holder)) {
                        if(!isset($holder[$request->get('topic_field')])) $holder[$request->get('topic_field')] = [];
                        if(!in_array($media->id, $holder[$request->get('topic_field')])) array_unshift($holder[$request->get('topic_field')], $media->id);
                        if($request->field_type === 'content') $topic->content = $holder;
                        else $topic->metas = $holder;
                        $topic->save();
                    }
                }

                # existing ( no file upload )
                if(!$request->hasFile('file')) {
                    $media->save();
                    return response()->json([
                        'status' => 200,
                        'media' => $media,
                        'message' => 'here!',
                    ]);
                }

                # a file is being uploaded - this is new
                else {

                    $metas = $media->metas;
                    $file = $request->file('file');
                    $original_file_size = $file->getSize();
                    $mime_type = $file->getMimeType();
                    $media->type = $file->extension(); // jpg | png | gif | m4v | pdf | doc | aif | heic | heif | etc ( laravel uses mime type to determine file extension)

                    # special cases
                    if($media->type === 'heic' || $media->type === 'heif') $media->type = 'jpg';
                    if($media->type === 'bin') $media->type = 'glb';

                    $metas['title'] = $file->getClientOriginalName();
                    $metas['original_file_size'] = $original_file_size;
                    $media->metas = $metas;

                    # heic/heif - convert to jpg - later. getting the required server software installed is a pita...
                    # https://image.intervention.io/v3/introduction/frameworks#integration
                    # if (in_array($mime_type, ['image/heic', 'image/heif'])) {
                    #     $file->storeAs($media_root_directory, 'original.'.$file->extension(), config('filesystems.default')); // store the original
                    #     $converted = HeicToJpg::convert($path_prefix.$media->id.'/original.'.$file->extension()); // convert the original to a jpg
                    #     $converted->saveAs($path_prefix.$media->id.'/original.jpg'); // save the original as a jpg
                    # }

                    # it must be saved at this point in order to create the parent directory
                    $media->save();

                    # pixel-based images
                    if (in_array($media->type, config('superniftycms.uploads.images.process'))) {
                        try {
                            $ext = $file->extension();

                            $manager = new ImageManager(
                                Driver::class,
                                autoOrientation: true,
                                decodeAnimation: true,
                                blendingColor: '232527'
                            );
                            $image = $manager->read($request->file('file'));
                            Storage::disk(config('superniftycms.uploads.disk'))->put(config('superniftycms.uploads.storage_directory')."/{$media->id}/original.".$file->extension(), (string) $image->encodeByExtension($file->extension()), 'public');

                            $urls['original']  = Helpers::media_upload_url($media, 'original');
                            $urls['thumbnail'] = Helpers::media_upload_url($media, 'thumbnail');

                            # print_r($request->all());
                            # print_r($media->getAttributes());
                            # print Storage::disk(config('superniftycms.uploads.disk'))->path(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/original.'.$ext);
                            # exit;

                        } catch (Throwable $e) {
                            Log::error($e->getMessage());
                            return response()->json([
                                'status' => 200,
                                'topic_id' => null,
                                'media_id' => null,
                                'message' => 'Oops! Error! [2158]: '.$e->getMessage(),
                            ]);
                        }
                    }

                    // videos - generate thumbnail and send to processing
                    elseif (in_array($media->type, config('superniftycms.uploads.videos.process'))) {
                        $file->storeAs(config('superniftycms.uploads.storage_directory').'/'.$media->id, 'original.'.$file->extension(), config('superniftycms.uploads.disk'));

                        # grab poster frame
                        $ffmpeg = FFMpeg::create(config('superniftycms.uploads.videos.ffmpeg'), null);
                        $video = $ffmpeg->open(Storage::disk(config('superniftycms.uploads.disk'))->path(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/original.'.$file->extension()));
                        $video
                            ->frame(TimeCode::fromSeconds(1)) # create poster 1 second in
                            ->save(Storage::disk(config('superniftycms.uploads.disk'))->path(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/poster.jpg'));
                        $urls['poster'] = $urls['thumbnail'] = Storage::disk(config('superniftycms.uploads.disk'))->url(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/poster.jpg');

                    }

                    # bins that have been converted to glb in this temporary patch
                    elseif ($media->type === 'glb') {
                        $file->storeAs(config('superniftycms.uploads.storage_directory').'/'.$media->id, 'original.glb', config('superniftycms.uploads.disk'));
                        $urls['original'] = Storage::disk(config('superniftycms.uploads.disk'))->url(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/original.glb');
                    }

                     // svgs
                    elseif ($mime_type === 'image/svg+xml') {
                        $file->storeAs(config('superniftycms.uploads.storage_directory').'/'.$media->id, 'original.glb', config('superniftycms.uploads.disk'));
                        $urls['original'] = $urls['thumbnail'] = Storage::disk(config('superniftycms.uploads.disk'))->url(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/original.svg');
                    }

                    # all other file types
                    else {
                        $file->storeAs(config('superniftycms.uploads.storage_directory').'/'.$media->id, 'original.'.$file->extension(), config('superniftycms.uploads.disk'));
                        $urls['original'] = Storage::disk(config('superniftycms.uploads.disk'))->url(config('superniftycms.uploads.storage_directory').'/'.$media->id.'/original.'.$media->type);
                    }



                }

                return response()->json([
                    'status' => 200,
                    'topic_id' => $topic->id,
                    'media_id' => $media->id,
                    'original_file_size' => $original_file_size,
                    'original_mime_type' => $mime_type,
                    'ext' => $media->type,
                    'urls' => $urls,
                    'created_by' => $media->created_by,
                    'created_at' => $media->created_at->format(config('superniftycms.ui.time_format')),
                    'last_updated_by' => $media->last_updated_by,
                    'updated_at' => $media->updated_at->format(config('superniftycms.ui.time_format')),
                ]);


            }

        } catch (Throwable $e) {
            Log::error($e->getMessage());
            return response()->json([
                'status' => 200,
                'topic_id' => null,
                'media_id' => null,
                'message' => 'Oops! Error! [0704]: '.$e->getMessage(),
            ]);

        }

    }


    public function updatedetails(UpdateMediaRequest $request)
    {
        $media = Media::find($request->media_id);
        if (isset($media->id)) {
            if (isset($request->meta)) {
                $media = sn_update_media_metas($media, $request->meta);
            }
            $media->save();

            return response()->json([
                'status' => 200,
                'topic_id' => $media->foreign_id,
                'media_id' => $media->id,
                'location' => $media->location,
                'ext' => $media->type,
                'updated_at' => $media->updated_at->format(sn_config('app.timeformat')),
                'created_at' => $media->created_at->format(sn_config('app.timeformat')),
                'message' => "Media #{$media->id} title updated...",
            ]);

        }

        return response()->json([
            'status' => 404,
            'message' => 'Media not found...',
        ]);

    }

    public function download($filename, $id)
    {
        try {
            $media = Media::find($id);
            if (isset($media->id)) {

                $file_path = base_path('sites/'.sn_site_root_directory_name()."/media/{$media->id}/original.{$media->type}");
                if (file_exists($file_path)) {
                    return response()->download($file_path, $filename);
                }
            }
        } catch (Throwable $e) {
            Log::error($e->getMessage());
        }
    }

    public function open($filename, $id)
    {
        try {
            $media = Media::find($id);
            if (isset($media->id)) {

                $file_path = base_path('sites/'.sn_site_root_directory_name()."/media/{$media->id}/original.{$media->type}");
                if (file_exists($file_path)) {
                    $quoted = sprintf('"%s"', addcslashes(basename($file_path), '"\\'));
                    header('Content-Description: File Transfer');
                    header('Content-Type: application/octet-stream');
                    header('Content-Disposition: attachment; filename='.$quoted);
                    header('Content-Transfer-Encoding: binary');
                    header('Connection: Keep-Alive');
                    header('Expires: 0');
                    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
                    header('Pragma: public');
                    header('Content-Length: '.filesize($file_path));
                    header('Content-Type: '.config('uploads.accepted.'.$media->type));
                    header('Content-Disposition: inline; filename="'.$filename.'"');
                    ob_clean();
                    flush();
                    readfile($file_path);
                    exit();
                }
            }
        } catch (Throwable $e) {
            Log::error($e->getMessage());
        }

    }

    public function sort(Request $request)
    {
        $topic = Topic::find($request->topic_id);
        if (
            isset($topic->content) &&
            $request->has('topic_field') &&
            $request->has('media_sort_order')
        ) {

            $content = $topic->content;
            if (isset($content) && is_array($request->media_sort_order)) {
                $content[$request->get('topic_field')]['value'] = array_unique($request->media_sort_order);
                $topic->content = $content;
                $topic->last_updated_by = Auth::id();
                $topic->save();

                return response()->json([
                    'status' => 200,
                    'topic_id' => $topic->id,
                    'message' => "Sort order for {$request->topic_field} has been updated...",
                    'updated_sort_order' => $request->media_sort_order,
                ]);
            }
        }

        return response()->json([
            'status' => 200,
            'message' => 'Unable to sort the media...', // 9a9487f2-ae35-4a06-b5b8-1bc4514eb178
        ]);

    }


    public function assign(Request $request)
    {

        $topic = Topic::find($request->topic_id);
        if (isset($topic->id) && isset($request->selected_media_ids) && isset($request->topic_field) && isset($request->topic_field_type)) {

            if (is_array($request->selected_media_ids)) {
                $media_sort_order = array_unique($request->selected_media_ids);
            } else {
                $media_sort_order = [];
            }
            $t = $request->topic_field_type; // content or metas

            $data = $topic->{$t}; // create temp var to avoid overloaded element

            // print_r($topic);

            // exit;

            $data[$request->topic_field]['value'] = $media_sort_order; // set the new value
            $topic->{$t} = $data; // place the value in the object
            $topic->last_updated_by = Auth::id();
            $topic->save();

            return response()->json([
                'status' => 200,
                'topic_id' => $topic->id,
                'topic_field' => $request->topic_field,
                'selected_media_ids' => $request->selected_media_ids,
                'message' => 'The media for this topic field have been updated...',
                'updated_topic' => $topic,
                'updated_sort_order' => $request->selected_media_ids,
            ]);
        } else {
            return response()->json([
                'status' => 200,
                'topic_id' => $request->topic_id,
                'topic_field' => $request->topic_field,
                'selected_media_ids' => $request->selected_media_ids,
                'message' => 'unable to save the new media selections',
                'updated_sort_order' => $request->selected_media_ids,
            ]);
        }

    }

    public function destroy(Media $media)
    {

        $report = [
            'db_record_deleted' => 'no',
            'file_deleted' => 'no',
        ];

        try {

            if (isset($media->id)) {
                $report['media'] = $media;

                $directory_path = base_path('/sites/'.sn_site_root_directory_name().'/media/'.$media->id);

                // let's not accidentally delete everything now...
                if (
                    Str::isUuid($media->id) &&
                    File::isDirectory($directory_path) &&
                    File::isFile($directory_path."/original.{$media->type}")
                ) {
                    if (File::deleteDirectory($directory_path)) {
                        $report['file_deleted'] = 'yes';
                    }
                }
                if ($media->delete()) {
                    $report['db_record_deleted'] = 'yes';
                }

                $report['status'] = 'success';

                return response()->json([
                    'status' => 200,
                    'report' => $report,
                    'message' => "Media #{$media->id} deleted...",
                ]);

            } else {

                $report['status'] = 'error';

                return response()->json([
                    'status' => 200,
                    'report' => $report,
                    'message' => "Oops... Media #{$media->id} was not found...",
                ]);

            }

        } catch (Throwable $e) {
            Log::error($e->getMessage());

            return response()->json([
                'status' => 500,
                'message' => 'Could not delete media: '.$e->getMessage(),
            ]);

        }

    }

}
