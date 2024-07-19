<?php

namespace Supernifty\CMS\Facades;

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Supernifty\CMS\Models\Media;
use Throwable;

/**
 * @see \Supernifty\CMS\CMS
 */
class CMS extends Facade
{

    public static function organize_topics($collection) {

        foreach($collection as $topic){

            $p = explode('/', $topic->url);

            if(count($p) === 1){
                $topics[$p[0]]['l'] = 1;
                $topics[$p[0]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 2){
                $topics[$p[0]]['c'][$p[1]]['l'] = 2;
                $topics[$p[0]]['c'][$p[1]]['a'] = $topic->getAttributes();
            }
            elseif(count($p) === 3){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['l'] = 3;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 4){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['l'] = 4;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 5){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['l'] = 5;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 6){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['l'] = 6;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 7){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['l'] = 7;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 8){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['l'] = 8;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 9){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['l'] = 9;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 10){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['l'] = 10;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 11){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['l'] = 11;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 12){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['l'] = 12;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 13){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['c'][$p[12]]['l'] = 13;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['c'][$p[12]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 14){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['c'][$p[12]['c']][$p[13]]['l'] = 14;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['c'][$p[12]['c']][$p[13]]['a'] = $topic->getAttributes();
            }

            elseif(count($p) === 15){
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['c'][$p[12]['c']][$p[13]['c']][$p[14]]['l'] = 15;
                $topics[$p[0]]['c'][$p[1]]['c'][$p[2]]['c'][$p[3]]['c'][$p[4]]['c'][$p[5]]['c'][$p[6]]['c'][$p[7]]['c'][$p[8]]['c'][$p[9]]['c'][$p[10]]['c'][$p[11]]['c'][$p[12]['c']][$p[13]['c']][$p[14]]['a'] = $topic->getAttributes();
            }

        }

        if(!isset($topics)) return [];
        elseif(is_array($topics)) ksort($topics);
        return $topics;

    }

    public static function dash_topics($array, $l = 1){
        $output = "<ul>";
        foreach ($array as $key => $value) {
            if(isset($value['a']['url'])){
                $x = explode('/', $value['a']['url']);
                $l = count($x);
            }
            if(isset($value['a']['title'])){
                $output.= "<li ";
                $output.= " data-l=\"{$l}\" ";
                $output.= " data-u=\"{$value['a']['url']}\" ";
                $output.= " data-ti=\"{$value['a']['id']}\" ";
                $output.= "><div class=\"w\">";
                $output.= "<strong data-a=\"e\">{$value['a']['title']}</strong> ";
                $output.= "<ol>";
                $output.= "<li data-a=\"x\"></li>";
                $output.= "<li data-a=\"+\"></li>";
                $output.= "<li data-a=\"c\"></li>";
                $output.= "<li data-s=\"{$value['a']['status']}\">";
                $output.= "<div class=\"sn_ddmenu status\">";
                $output.= "<i data-l=\"".config('superniftycms.ui.status.topics.values.'.$value['a']['status'].'.label')."\"></i>";
                $output.= "<ul>";
                foreach(config('superniftycms.ui.status.topics.values') as $s => $status) $output.= "<li data-v=\"{$s}\" data-l=\"{$status['label']}\"></li>";
                $output.= "</ul>";
                $output.= "</div>";
                $output.= "</li>";
                $output.= "<li data-a=\"v\"></li>";
                $output.="</ol>";
            }
            else {
                $output.= "<li ";
                $output.= " data-l=\"{$l}\" data-u=\"{$key}\" class=\"orphan\"";
                $output.= "><div class=\"w\">";
            }
            if(isset($value['c'])) {
                $l++;
                ksort($value['c']);
                $output .= "</div>".CMS::dash_topics($value['c'], $l)."</li>";
            }
            else $output .= "</div></li>";
        }
        $output .= "</ul>\n";
        return $output;
    }

    public static function img_resize($original_path, $size)
    {

        try {
            $p = pathinfo($original_path);
            if(!in_array($p['extension'], config('superniftycms.uploads.images.process'))) return null;

            if($size === 'original') return $original_path;
            if($size === 'thumbnail') $size = config('superniftycms.images.thumb_width');
            elseif($size === 'poster') $size = config('superniftycms.videos.poster_width');
            $name = $size;

            $path = $p['dirname'] . '/' . $name . '.' . $p['extension'];
            $contents = Storage::disk(config('superniftycms.uploads.disk'))->get($original_path);
            $img = Image::make($contents)->orientate()->resize($size, null, function($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            Storage::disk(config('superniftycms.uploads.disk'))->put($path, $img->stream());
            return $path;

        }
        catch (Throwable $e) {
            Log::error('path: '.$original_path);
            Log::error($e->getMessage());
            return null;
        }
    }



    public static function media_upload_url($m, $wof = false) {

        $path = null;
        if(isset($m->id)) $media = $m;
        elseif(Str::isUuid($m)) $media = Media::find($m);
        if(isset($media->id)){

            # pixel-based images
            if(in_array($media->type, config('superniftycms.uploads.images.process'))) {
                if(!$wof) $wof = config('superniftycms.uploads.images.default_width');
                $path = "{$media->id}/{$wof}.{$media->type}";
                $original_path = $media->id.'/original.'.$media->type;

                # attempt resize if requested size doesn't exist
                if(
                    !Storage::disk(config('superniftycms.uploads.disk'))->exists($path) &&
                    Storage::disk(config('superniftycms.uploads.disk'))->exists($original_path)
                ){
                    $path = CMS::img_resize($original_path, $wof);
                }
            }

            # video
            elseif(in_array($media->type, config('superniftycms.uploads.videos.process'))) {
                if($wof === 'poster') $path = "{$media->id}/poster.jpg";
                else $path = "{$media->id}/original.{$media->type}";
            }

            # everything else
            else $path = "{$media->id}/original.{$media->type}";


        }
        elseif(str_contains($m, '/')) $path = $m;


        if(Storage::disk(config('superniftycms.uploads.disk'))->exists($path)) return Storage::url($path);
        return config('supernifty.uploads.images.fpo');
    }



    public static function media_upload_urls($media)
    {
        $urls = [];

        # filesystem files
        if(
            isset($media->id) &&
            Storage::disk(config('superniftycms.uploads.disk'))->exists($media->id.'/original.'.$media->type)
        ) {

            # images
            if(in_array($media->type, config('superniftycms.uploads.images.process'))) {
                $urls['original'] = CMS::media_upload_url($media, 'original');
                $urls['thumbnail'] = CMS::media_upload_url($media, 'thumbnail');
            }

            # videos
            elseif(in_array($media->type, config('superniftycms.uploads.videos.process'))) {
                $urls = [
                    'original' => CMS::media_upload_url($media, 'original'),
                    'poster' => CMS::media_upload_url($media, "poster")
                ];
            }

            # all other file types
            else $urls['original'] = CMS::media_upload_url($media);

        }

        return $urls;
    }


    public static function destroy_media_record_and_file_by_id($media_id){

        try {
            if(Str::isUuid($media_id)){
                Media::destroy($media_id);
                if(Storage::disk(config('superniftycms.uploads.disk'))->exists($media_id)) Storage::deleteDirectory($media_id);
                return true;
            }
            return false;
        }
        catch (Throwable $e) {
            Log::error('there was an issue deleting: '.$media_id);
            Log::error('the error message: '.$e->getMessage());
            return false;
        }
    }


    public static function media_prep_data($media)
    {
        return [
            'media_id' => $media->id,
            'type' => $media->type,
            'vendor_media_id' => $media->vendor_media_id,
            'metas' => $media->metas,
            'urls' => CMS::media_upload_urls($media),
            'created_by' => $media->created_by,
            'created_at' => $media->created_at,
        ];
    }

    public static function dropzone_media($ids = false){

        # dd($ids);
        $rawMedia = [];
        $processedMedia = [];
        if($ids && is_array($ids) && count($ids) > 0) {
            foreach($ids as $id){
                if(Str::isUuid($id)) $rawMedia[$id] = Media::find($id);
            }
        }

        if(count($rawMedia)) {
            foreach($rawMedia as $media) {
                $processedMedia[] = CMS::media_prep_data($media);
            }
        }
        # dd($processedMedia);

        return json_encode($processedMedia);
    }

    public static function get_topic_media($topic){

        # try {

        $medias['content'] = [];
        $mediaJSON['content'] = [];
        if(isset($topic->content) && isset($topic->content['sn_fso'])){
            foreach($topic->content['sn_fso'] as $field_name){

                if($field_name !== 'sn_fso'){

                    # print "<pre>";
                    # print $field_name."\n";
                    # print_r($topic->content[$field_name]);
                    # print "</pre>";
                    # if(!isset($topic->content[$field_name]['type'])) dd($topic->content[$field_name]);

                    # if this is a media field...
                    if(
                        isset($topic->content[$field_name]['type']) &&
                        $topic->content[$field_name]['type'] === 'media'
                    ){

                        # confirm the media field values are set and are an array
                        if(!isset($topic->content) || !isset($topic->content[$field_name]['value']) || !is_array($topic->content[$field_name]['value'])) {
                            $content = $topic->content;
                            $content[$field_name]['value'] = [];
                            $topic->content = $content;
                            $topic->save();
                            $topic->fresh();
                        }

                        # now find the media for each media id
                        foreach($topic->content[$field_name]['value'] as $media_id){

                            # find the media for each id
                            $media = Media::find($media_id);

                            # media was found, so grab get the urls
                            if(!is_null($media) && isset($media->id)){
                                $media->urls = CMS::media_upload_urls($media);
                                $medias[$field_name][$media_id] = $media;
                            }

                            # the media was NOT found in the database so remove the media id from the topic field values and delete the file if it exists
                            else {
                                $content = $topic->content;
                                $content[$field_name]['value'] = array_filter($content[$field_name]['value'], static function ($element) use ($media_id) { return $element !== $media_id; });
                                $topic->content = $content;
                                $topic->save();
                                $topic->fresh();
                                CMS::destroy_media_record_and_file_by_id($media_id);
                            }

                        }

                        # now generate the json for all media ids in the field
                        $mediaJSON['content'][$field_name] = CMS::dropzone_media($topic->content[$field_name]['value']);

                    }

                }

            }

        }

        $medias['metas'] = [];
        $mediaJSON['metas'] = [];
        if(isset($topic->metas) && isset($topic->metas['sn_fso'])){
            foreach($topic->metas['sn_fso'] as $field_name){

                if($field_name !== 'sn_fso'){

                    if(isset($topic->metas[$field_name]) && $topic->metas[$field_name]['type'] === 'media'){

                        # confirm the media field values are set and are an array
                        if(!isset($topic->metas) || !isset($topic->metas[$field_name]['value']) || !is_array($topic->metas[$field_name]['value'])) {
                            $metas = $topic->metas;
                            $metas[$field_name]['value'] = [];
                            $topic->metas = $metas;
                            $topic->save();
                            $topic->fresh();
                        }
                        foreach($topic->metas[$field_name]['value'] as $media_id){

                            $media = Media::find($media_id);

                            # media was found
                            if(!is_null($media) && isset($media->id)) $medias[$field_name][$media_id] = $media;

                            # the media was NOT found in the database so remove the media id from the topic field values and delete the file if it exists
                            else {
                                $metas = $topic->metas;
                                $metas[$field_name]['value'] = array_filter($metas[$field_name]['value'], static function ($element) use ($media_id) { return $element !== $media_id; });
                                $topic->metas = $metas;
                                $topic->save();
                                $topic->fresh();
                                CMS::destroy_media_record_and_file_by_id($media_id);
                            }

                        }
                    }
                    $mediaJSON['metas'][$field_name] = CMS::dropzone_media($topic->metas[$field_name]['value']);
                }
            }
        }
        $topic->media = $medias;
        $topic->mediaJSON = $mediaJSON;

        return $topic;
        /*
    } catch (Throwable $e) {
        Log::error($e->getMessage());
        Log::error("Line " .__LINE__." in ".__FILE__. ' @ ' .date('Y-m-d h:i:s A'));
        return 'media';
    } */
    }



    protected static function getFacadeAccessor(): string
    {
        return \Supernifty\CMS\CMS::class;
    }
}
