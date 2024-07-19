@props(['do', 'actions', 'user', 'environment', 'type', 'topic', 'topic_field', 'topic_field_type', 'fields', 'url_status', 'url_prefix', '$sn_existingMedia'])


<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="language" content="{{ config('app.language') ?? 'NOT_SET' }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @if(isset($topic) && isset($topic->id))
        <?php # dd($topic); ?>
    <meta name="parent" content="topic">
    <meta name="parent-type" content="{{ $topic->slug ?? 'NOT_SET' }}">
    <meta name="topic-id" content="{{ $topic->id ?? 'NOT_SET' }}">
    @endif
    <meta name="maxuploadfilesize" content="{{ config('superniftycms.uploads.maxfilesize') }}">
    <meta name="acceptedmimetypes" content="{{ implode(',', config('superniftycms.uploads.accepted')) }}">
    <meta name="acceptedfiletypes" content="{{ implode(' ', array_keys(config('superniftycms.uploads.accepted'))) }}">

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <title>&starf; {{ config('app.name', 'Supernifty CMS') }}</title>

    {{-- <script src="/platform_build/tinymce/tinymce.min.js"></script> --}}

    <!-- scripts -->
    @vite([
    'resources/views/vendor/superniftycms/src/css/styles.css',
    'resources/views/vendor/superniftycms/src/js/scripts.js',
    ])
    <!-- Styles -->
    @livewireStyles

<?php

$style = "<style>\n";
$style.= ".sn_ddmenu.status { width: ".config('superniftycms.ui.status.topics.menu_pixel_width')."px!important; }\n";
$style.= "#topicList ul li .w ol li .sn_ddmenu.status { width: ".config('superniftycms.ui.status.topics.menu_pixel_width')*.675."px!important; }\n";
foreach(config('superniftycms.ui.status.topics.values') as $v => $value){
    $style.= "\tbody[data-topic_status='{$v}'] .sn_ddmenu.status i, [data-s='{$v}'] .sn_ddmenu.status i { border: 1px solid {$value['dark']}!important; background-color: {$value['light']}!important; color: {$value['dark']}!important;  }\n";
    $style.= "\tbody[data-topic_status='{$v}'] .sn_ddmenu.status i:before { content: '{$value['label']}'!important; }\n";
    $style.= "\tbody[data-topic_status='{$v}'] .sn_ddmenu.status li[data-v='{$v}'], body[data-topic_status='{$v}'] .sn_ddmenu.status li[data-v='{$v}']:before { color: {$value['dark']}!important; }\n";
    $style.= "\t#topicList ul li .w ol li[data-s='{$v}'] .sn_ddmenu.status li[data-v='{$v}']:before { color:#343638!important; }\n";
}
$style.= "</style>";
print $style;

?>
</head>
<body id="{{ str_replace('.', '-', Route::currentRouteName()) }}"
      data-do="{{ $do ?? 'x' }}"
      @if(isset($topic) && isset($topic->status))
      data-topic_id="{{ $topic->id ?? 'x' }}"
      data-topic_field="{{ $topic_field ?? 'x' }}"
      data-topic_field_type="{{ $topic_field_type ?? 'x' }}"
      data-topic_parent="{{ $topic->parent ?? 'x' }}"
      data-topic_url="{{ $topic->url ?? 'x' }}"
      data-url_prefix="{{ $url_prefix ?? '' }}"
      data-url_status="{{ $url_status ?? 'ok' }}"
      data-layout="{{ $topic->layout ?? 'pages.auto' }}"
      data-topic_status="{{ $topic->status ?? 'x' }}"
      data-topic_functionality="{{ $topic->functionality ?? 'single' }}"
      @if(Str::isUuid($topic->slug)) data-new_parent @endif
      @endif
      @if(isset($user)) data-user_status="{{$user->status ?? '' }}"  data-user_role="{{$user->role ?? '' }}" @endif
      data-code_editor_status
>
{{-- @livewire('navigation-menu')  --}}
    <main>
        {{ $slot }}
    </main>
@include('vendor.superniftycms.components.contextMenu')
@include('vendor.superniftycms.components.sprites')
@livewireScripts
</body>
</html>



