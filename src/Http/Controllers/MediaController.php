<?php

namespace Supernifty\CMS\Http\Controllers;

use Illuminate\Routing\Controller;
use Supernifty\CMS\Models\Media;
use Supernifty\CMS\Models\Topic;
use FFMpeg\Coordinate\Dimension;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\Format\Video\WebM;
use FFMpeg\Format\Video\WMV;
use FFMpeg\Format\Video\X264;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use InvalidArgumentException;
use Maestroerror\HeicToJpg;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use Throwable;

class MediaController extends Controller
{

    public function index()
    {
        //
    }



    public function saver(Request $request){

        # print_r($request->all()); exit;

        try {

            $new_topic = false;
            $topic_id = null;
            $urls = null;
            $mime_type = null;
            $original_file_size = null;

            # if the media is to be associated with a specific topic
            if($request->has('topic_id')) $topic = Topic::find($request->topic_id);


            # if there is a topic, get the sort order
            if(isset($topic->id)) $topic_id = $topic->id;

            # find or create media
            $media = Media::find($request->media_id);

            # print_r($media);
            # exit;

            $meta = [];

            # creating new media instance
            if(!isset($media->id) || $request->media_id === 'new'){

                # for external vendors, location and type might share the same value (eg: youtube)
                if(!isset($request->location)) $request->location = $request->type;
                $media = new Media;
                $media->location = $request->location; # sn | youtube | vimeo | aws | do | etc
                $media->type = $request->location; # youtube | vimeo | gif | mov | pdf | svg | etc
                $media->created_by = Auth::id();
                if(isset($request->meta)) $media = sn_update_media_metas($media, $request->meta);
                $media->last_updated_by = Auth::id();
                $media->save();
            }

            # saving an existing media
            else {

                # youtube / vimeo media
                if(isset($request->vendor_media_id)) {
                    $media->vendor_media_id = $request->vendor_media_id;
                    $media->type = $request->type;
                }

                if(isset($request->metas)) $media = sn_update_media_metas($media, $request->metas);

                $media->last_updated_by = Auth::id();
                $media->save();

                return response()->json([
                    'status' => 200,
                    'media' => $media,
                    'message' => 'here!',
                ]);

            }

            # youtube or vimeo
            if(isset($request->vendor_media_id)) {
                $media->vendor_media_id = $request->vendor_media_id;
                $media->type = $request->type;
                $media->metas = $request->metas;
                $media->save();
            }

            # a file is being uploaded
            if($request->hasFile('file')) {

                # print_r('here'); exit;

                $metas = $media->metas;
                $path_prefix = sn_media_directory_public_path()."/"; # HeidToJpg and ffmpeg are both ignorant of Laravel pathing
                # Log::debug("---> MediaController-> saver -> \$request=>hasFile() -> \$path_prefix: ".$path_prefix);

                $file = $request->file('file');
                $original_file_size = $file->getSize();
                $mime_type = $file->getMimeType();
                $media->location = config('filesystems.default'); # sn | aws | do | etc ( youtube and vimeo are also possible when not a file upload)
                $media->type = $file->extension(); # jpg | png | gif | m4v | pdf | doc | aif | heic | heif | etc ( laravel uses mime type to determine file extension)
                if($media->type === 'heic' || $media->type === 'heif') $media->type = 'jpg'; # because it will be converted to a jpg on upload
                if($media->type === 'bin') $media->type = 'glb';
                $metas['title'] = $file->getClientOriginalName();
                $metas['original_file_size'] = $original_file_size;
                $media->metas = $metas;
                $media_root_directory = "/{$media->id}";
                $media->save();

                # heic/heif - convert to jpg
                if(in_array($mime_type, [ 'image/heic', 'image/heif' ])) {
                    $file->storeAs($media_root_directory, "original.".$file->extension(), config('filesystems.default')); # store the original
                    $converted = HeicToJpg::convert($path_prefix.$media->id."/original.".$file->extension()); # convert the original to a jpg
                    $converted->saveAs($path_prefix.$media->id."/original.jpg"); # save the original as a jpg
                }

                # non-heic images
                elseif(in_array($mime_type, [ 'image/gif', 'image/jpeg', 'image/jpg', 'image/webp', 'image/png'])) {

                    try {

                        $mime_type === 'image/heic' ? $ext = 'jpg' : $ext = $file->extension(); # print $mime_type; exit;
                        $img = Image::make($request->file('file'))->orientate();
                        Storage::put($media_root_directory."/original.".$ext, $img->stream(), 'public');

                    } catch (Throwable $e) {
                        Log::error($e->getMessage());
                        return response()->json([
                            'status' => 200,
                            'topic_id' => null,
                            'media_id' => null,
                            'message' => "Oops! Error! [0704]: ".$e->getMessage()
                        ]);

                    }



                }

                # videos - generate thumbnail and send to processing
                elseif(in_array($media->type, config('uploads.videos.process'))) {

                    /*
                    'original_file_path' => $path_prefix."original.".$media->type,
                    'width' => sn_extract_value('width=', $info), # 9c65d38e-3408-4657-b661-5de63580bbc1
                    'height' => sn_extract_value('height=', $info),
                    'rotation' => sn_extract_value('rotation=', $info),
                    'seconds' => sn_extract_value('duration=', $info),
                    'milliseconds' => sn_extract_value('duration_ts=', $info),
                    'frame_rate' => sn_extract_value('avg_frame_rate=', $info),
                    'bit_rate' => sn_extract_value('bit_rate=', $info),
                    'size' => sn_extract_value('extradata_size=', $info),
                    'format_name' => sn_extract_value('format_name=', $info),
                    'format_long_name' => sn_extract_value('format_long_name=', $info),
                    'upload_time' => sn_extract_value('TAG:creation_time=', $info),
                    'TAG:com.apple.quicktime.location.accuracy.horizontal' => sn_extract_value('TAG:com.apple.quicktime.location.accuracy.horizontal=', $info),
                    'TAG:com.apple.quicktime.location.ISO6709' => sn_extract_value('TAG:com.apple.quicktime.location.ISO6709=', $info),
                    'TAG:com.apple.quicktime.make' => sn_extract_value('TAG:com.apple.quicktime.make=', $info),
                    'TAG:com.apple.quicktime.model' => sn_extract_value('TAG:com.apple.quicktime.model=', $info),
                    'TAG:com.apple.quicktime.software' => sn_extract_value('TAG:com.apple.quicktime.software=', $info),
                    'TAG:com.apple.quicktime.creationdate' => sn_extract_value('TAG:com.apple.quicktime.creationdate=', $info)
                    */
                    # Log::debug('VIDEO');

                    $file->storeAs($media_root_directory, "original.".$file->extension(), config('filesystems.default'));

                    # grab poster frame
                    $ffmpeg = FFMpeg::create(config('ffmpeg'), null);
                    $video = $ffmpeg->open($path_prefix.sn_media_path($media));
                    $video
                        ->frame(TimeCode::fromSeconds(1)) # create poster 1 second in
                        ->save($path_prefix.$media_root_directory."/poster.jpg");
                    $urls['poster'] = sn_media_upload_url($media, 'poster');
                    $urls['thumbnail'] = sn_media_upload_url($media, 'poster');

                    $settings['video'] = [
                        'square' => false,              # make it a perfect square? true|false - not implemented yet
                        'framerate' => 30,              # eg: 30 is a youtube standard
                        'gop' => 12,                    # eg: 12 - don't understand this
                        'kilobitrate' => 8000,          # eg: 8000 is a youtube standard
                        'audiochannels' => 2,           # eg: 2 - stereo
                        'audiokilobitrate' => 384,      # eg: 384 is a youtube standard
                    ];

                    $data = sn_extract_video_data($media);

                    # https://stackoverflow.com/questions/20847674/ffmpeg-libx264-height-not-divisible-by-2
                    # Log::debug("initial video width: ". $data['width']);
                    # Log::debug("initial video height: ". $data['height']);
                    if($data['width'] % 2 != 0) $data['width']++;
                    if($data['height'] % 2 != 0) $data['height']++;

                    # Log::debug("========================================================================");
                    # Log::debug("initial width modulus: ". $data['width'] % 2);
                    # Log::debug("initial height modulus: ". $data['height'] % 2);
                    # Log::debug("new video width: ". $data['width']);
                    # Log::debug("new video height: ". $data['height']);
                    # Log::debug("========================================================================");

                    ProcessMP4::dispatch($media, $settings, $data)->onConnection('database');  # send to queued job
                    ProcessWEBM::dispatch($media, $settings, $data)->onConnection('database'); # send to queued job
                    ProcessOGG::dispatch($media, $settings, $data)->onConnection('database');  # send to queued job

                }

                # bins that have been converted to glb in this temporary patch
                elseif($media->type === 'glb') $file->storeAs($media_root_directory, "original.glb", config('filesystems.default'));

                # all other file types
                else $file->storeAs($media_root_directory, "original.".$file->extension(), config('filesystems.default'));

                # $urls['original']  = secure_url('media/'.sn_media_path($media));

                # all images - generate thumbnail
                if(in_array($mime_type, [ 'image/gif', 'image/jpeg', 'image/jpg', 'image/webp', 'image/png', 'image/heic', 'image/heif'])){
                    $urls['original'] = sn_media_upload_url($media, 'original');
                    $urls['thumbnail'] = sn_media_upload_url($media, 'thumbnail');
                }

                # svgs
                elseif($mime_type === 'image/svg+xml'){

                    $path = "{$media->id}/original.{$media->type}";
                    $url = secure_url("/" . str_replace('.', '', sn_site_root_directory_name()) ."/".$path);
                    $urls['original'] = $url;
                    $urls['thumbnail'] = $url;
                }


                # presentation layer typing

                # POSSIBLE FILE TYPES
                # image:   [ "gif", "jpeg", "jpg", "png", "webp", "heic", "svg" ]
                # audio: [ "mp3" ]
                # video: [ "3gp", "avi", "mov", "ogg", "ts", "mp4", "webm", "wmv" ]
                # youtube: [ "yoputube" ]
                # vimeo: [ "vimeo" ]
                # document: [ "doc", "docx", "pdf", "ppt", "pptx", "txt",  "xls",  "xlsx" ]
                # text: [ "txt" ]

                /*

                "gif"   => "image/*",
                "heic"  => "image/*",
                "heif"  => "image/*",
                "jpg"   => "image/*",
                "webp"  => "image/*",
                "png"   => "image/*",
                "svg"   => "image/*",

                "3gp"   => "video/*",
                "avi"   => "video/*",
                "ts"    => "video/*",
                "mp4"   => "video/*",
                "webm"  => "video/*",
                "mov"   => "video/*",
                "ogg"   => "video/*",
                "wmv"   => "video/*",

                "doc"   => "application/*",
                "docx"  => "application/*",
                "pdf"   => "application/*",
                "ppt"   => "application/*",
                "pptx"  => "application/*",
                "xls"   => "application/*",
                "xlsx"  => "application/*"

                "txt"   => "text/*",

                "audio" => "audio/*",

               {
                    "type": "image|video|youtube|vimeo|document|audio|text",
                    "media": ["9a8d126e-dcaa-4a84-ae62-347239e0a23f", "4a7d126x-ea4d-4a84-cc62-347239e92q17"],
                }

                */
                # if(isset($request->vendor_media_id)) $media_type =  $request->type;
                # else $media_type = explode('/', $mime_type)[0];

            }

            # add the media to the topic content sort order
            if(
                isset($topic->content) &&
                $request->has('topic_field') &&
                $request->has('field_type') # content or metas
            ){

                if($request->field_type === 'content') $holder = $topic->content;
                elseif($request->field_type === 'metas') $holder = $topic->metas;
                if(isset($holder)){
                    if(!isset($holder)) $holder = [];
                    if(!isset($holder[$request->get('topic_field')])) $holder[$request->get('topic_field')] = [];
                    if(!in_array($media->id, $holder[$request->get('topic_field')])){
                        array_unshift($holder[$request->get('topic_field')], $media->id);
                        # $media_key = 0;
                    }
                    # else $media_key = array_search($media->id, $holder[$request->get('topic_field')]);

                    if($request->field_type === 'content') $topic->content = $holder;
                    else $topic->metas = $holder;
                    $topic->save();
                }

            }

            return response()->json([
                'status' => 200,
                'topic_id' => $topic_id,
                'new_topic' => $new_topic,
                'media_id' => $media->id,
                'original_file_size' => $original_file_size,
                'original_mime_type' => $mime_type,
                'location' => $media->location,
                'ext' => $media->type,
                'urls' => $urls,
                'created_by' => $media->created_by,
                'created_at' => $media->created_at->format(sn_config('app.timeformat')),
                'last_updated_by' => $media->last_updated_by,
                'updated_at' => $media->updated_at->format(sn_config('app.timeformat')),
            ]);

        } catch (Throwable $e) {
            Log::error($e->getMessage());
            return response()->json([
                'status' => 200,
                'topic_id' => null,
                'media_id' => null,
                'message' => "Oops! Error! [0704]: ".$e->getMessage()
            ]);

        }


    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Http\Requests\UpdateMediaRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatedetails(UpdateMediaRequest $request)
    {
        $media = Media::find($request->media_id);
        if(isset($media->id)){
            if(isset($request->meta)) $media = sn_update_media_metas($media, $request->meta);
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
            'message' => "Media not found...",
        ]);

    }


    public function download($filename, $id)
    {
        try {
            $media = Media::find($id);
            if(isset($media->id)){

                $file_path = base_path("sites/".sn_site_root_directory_name()."/media/{$media->id}/original.{$media->type}");
                if(file_exists($file_path)) return response()->download($file_path, $filename);
            }
        } catch (Throwable $e) {
            Log::error($e->getMessage());
        }
    }

    public function open($filename, $id)
    {
        try {
            $media = Media::find($id);
            if(isset($media->id)){

                $file_path = base_path("sites/".sn_site_root_directory_name()."/media/{$media->id}/original.{$media->type}");
                if(file_exists($file_path)) {
                    $quoted = sprintf('"%s"', addcslashes(basename($file_path), '"\\'));
                    header('Content-Description: File Transfer');
                    header('Content-Type: application/octet-stream');
                    header('Content-Disposition: attachment; filename=' . $quoted);
                    header('Content-Transfer-Encoding: binary');
                    header('Connection: Keep-Alive');
                    header('Expires: 0');
                    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
                    header('Pragma: public');
                    header('Content-Length: ' . filesize($file_path));
                    header('Content-Type: ' . config('uploads.accepted.'.$media->type));
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
        if(
            isset($topic->content) &&
            $request->has('field_type') &&
            $request->has('topic_field') &&
            $request->has('media_sort_order')
        ){
            if($request->field_type === 'content') $holder = $topic->content;
            elseif($request->field_type === 'metas') $holder = $topic->metas;
            if(isset($holder) && is_array($request->media_sort_order)) {
                $holder[$request->get('topic_field')]['value'] = array_unique($request->media_sort_order);
                if($request->field_type === 'content') $topic->content = $holder;
                else $topic->metas = $holder;
                $topic->last_updated_by = Auth::id();
                $topic->save();
                return response()->json([
                    'status' => 200,
                    'topic_id' => $topic->id,
                    'message' => "Sort order for {$request->field_type}->{$request->topic_field} has been updated...",
                    'updated_sort_order' => $request->media_sort_order
                ]);
            }
        }
        return response()->json([
            'status' => 200,
            'message' => "Unable to sort the media..." # 9a9487f2-ae35-4a06-b5b8-1bc4514eb178
        ]);

    }

    public function all($topic_id = false, $topic_field_type= false, $topic_field = false) {

        $rawMedia = Media::orderByRaw('updated_at DESC')->get(); # all media
        $ids = $rawMedia->pluck('id')->toArray();

        # dd($ids, $topic_id, $topic_field);

        # get field-specific media
        $topic = null;
        $fieldMedia = '';
        if($topic_id && $topic_field_type && $topic_field){
            $topic = Topic::find($topic_id);
            # dd($ids, $topic_id, $topic_field_type, $topic_field, $topic);
            if(
                isset($topic->{$topic_field_type}) &&
                isset($topic->{$topic_field_type}[$topic_field]) &&
                is_array($topic->{$topic_field_type}[$topic_field]) &&
                count($topic->{$topic_field_type}[$topic_field]) > 0
            ) $fieldMedia = implode('|', $topic->{$topic_field_type}[$topic_field]['value']);
        }

        $data = [
            'allMedia' => sn_dropzone_media($ids), # THIS IS WHERE I LEFT OFF. IT IS CORRECT TO THIS POINT. sn_dropzone_media() or a function it is calling is dropping the ball.
            'fieldMedia' => $fieldMedia,
            'topic' => $topic,
            'topic_field_type' => $topic_field_type,
            'topic_field' => $topic_field
        ];

        # dd($data);

        return response()->view('be.media.index',$data );

    }

    public function assign(Request $request)
    {



        $topic = Topic::find($request->topic_id);
        if(isset($topic->id) && isset($request->selected_media_ids) && isset($request->topic_field) && isset($request->topic_field_type)) {




            if(is_array($request->selected_media_ids)) $media_sort_order = array_unique($request->selected_media_ids);
            else $media_sort_order = [];
            $t = $request->topic_field_type; # content or metas






            $data = $topic->{$t}; # create temp var to avoid overloaded element


            # print_r($topic);

            # exit;



            $data[$request->topic_field]['value'] = $media_sort_order; # set the new value
            $topic->{$t} = $data; # place the value in the object
            $topic->last_updated_by = Auth::id();
            $topic->save();
            return response()->json([
                'status' => 200,
                'topic_id' => $topic->id,
                'topic_field' => $request->topic_field,
                'selected_media_ids' => $request->selected_media_ids,
                'message' => "The media for this topic field have been updated...",
                'updated_topic' => $topic,
                'updated_sort_order' => $request->selected_media_ids
            ]);
        }

        else {
            return response()->json([
                'status' => 200,
                'topic_id' => $request->topic_id,
                'topic_field' => $request->topic_field,
                'selected_media_ids' => $request->selected_media_ids,
                'message' => "unable to save the new media selections",
                'updated_sort_order' => $request->selected_media_ids
            ]);
        }

    }

    public function destroy(Media $media)
    {

        $report = [
            'db_record_deleted' => 'no',
            'file_deleted' => 'no'
        ];

        try {

            if(isset($media->id)){
                $report['media'] = $media;

                $directory_path = base_path("/sites/" . sn_site_root_directory_name() . "/media/".$media->id);

                # let's not accidentally delete everything now...
                if(
                    Str::isUuid($media->id) &&
                    File::isDirectory($directory_path) &&
                    File::isFile($directory_path."/original.{$media->type}")
                ){
                    if(File::deleteDirectory($directory_path)) $report['file_deleted'] = 'yes';
                }
                if($media->delete()) $report['db_record_deleted'] = 'yes';

                $report['status'] = 'success';

                return response()->json([
                    'status' => 200,
                    'report' => $report,
                    'message' => "Media #{$media->id} deleted...",
                ]);

            }

            else {

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
                'message' => "Could not delete media: ".$e->getMessage(),
            ]);

        }

    }


    public function fpo(Media $media)
    {
        $filename = base_path("sites/kmmgrp.com/media/9c3195b2-7572-4e54-969b-057d6af77626/original.jpg");

        if (!file_exists($filename)) {
            throw new InvalidArgumentException('File "'.$filename.'" not found.');
        }
        switch ( strtolower( pathinfo($filename, PATHINFO_EXTENSION ))) {
            case 'jpeg':
            case 'jpg':
                $image = imagecreatefromjpeg($filename);
                break;

            case 'png':
                $image = imagecreatefrompng($filename);
                break;

            case 'gif':
                $image = imagecreatefromgif($filename);
                break;

            default:
                throw new InvalidArgumentException('File "'.$filename.'" is not valid jpg, png or gif image.');
                break;
        }




        $text = "FPO";
        $width = 1920;
        $height = 1080;
        $font_size = $height/2;
        $angle = 5;
        $font = resource_path('fonts/Anton.ttf');
        # $image = imagecreatetruecolor($width, $height);
        # $background_color = imagecolorallocate($image, 0, 0, 0);
        # imagecolortransparent($image, $background_color); # transparent
        $text_color = imagecolorallocatealpha($image, 255, 255, 255, 0);

        # 9c3195b2-7572-4e54-969b-057d6af77626




        $bbox = imagettfbbox($font_size, $angle, $font, $text);


        $x = $bbox[0] + (imagesx($image) / 2) - ($bbox[4] / 2) - 25;
        $y = $bbox[1] + (imagesy($image) / 2) - ($bbox[5] / 2) - 5;


        imagettftext($image, $font_size, $angle, $x, $y, $text_color, $font, $text);
        header("Content-type: image/png");
        print imagepng($image);
        exit;
    }






}
