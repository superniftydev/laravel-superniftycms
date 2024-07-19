@props(['topic'])
@props(['url_status'])

<x-superniftycms-layout :environment="app()->environment" :topic="$topic" :url_prefix="$url_prefix" :url_status="'ok'">

    <div class="adminViewW">
        @if ($errors->any())
            <h2 class="text-2xl text-red-500 mb-4 font-bold">Oops!</h2>
            <p class="text-red-500 mb-4 font-bold">Please fix the issues below:</p>
            <div class="alert alert-danger alert-dismissible">
                <button type="button" class="btn bg-gray-800 text-white hover:bg-gray-700-close"
                        data-bs-dismiss="alert"></button>
                <strong>
                    {!! implode('<br/>', $errors->all('<span>:message</span>')) !!}
                </strong>
            </div>
        @endif

        <div id="sn_adminHeader">
            <div class="flex justify-between items-center w-full">
                <nav class="breadcrumbs">
                    <ul>
                        <li><a href="{{route('dashboard')}}" title="Topics">Dashboard</a></li>
                        <li>
                            <a href="/admin/topics/manage/{{ $topic->functionality }}">{{ sn_config('topics.topics.'.$topic->functionality.'.plural') }}</a>
                        </li>
                        <li class="topicTitleDisplay">{{ $topic->title }}</li>
                    </ul>
                </nav>
            </div>
        </div>

        <div id="editorFormW">
            <button type="button" class="snSaveButton">Save</button>
            <form id="topicEditForm" class="w-full relative" method="post" action="{{ route('be.topic.save') }}"
                  enctype="multipart/form-data">
                @csrf
                <input type="hidden" name="topic_id" value="{{ $topic->id ?? 'new' }}"/>
                <input type="hidden" name="status" value="{{ $topic->status ?? 'new' }}" id="topicStatus"
                       class="update">
                <div class="titleTools">
                    <div id="topicURLW">
                        <i id="pageurl" data-url="https://{{ sn_site_domain() }}/{{ $topic->url ?? '' }}"></i>
                        <i data-domain="https://{{ sn_site_domain() }}/"></i>
                        <input type="text" id="topicURL" value="{{ $topic->url ?? '' }}"/>
                    </div>
                    <ul id="tools" class="tools topicActions" data-functionality="{{ $topic->functionality }}">
                        <li id="gotourl"></li>
                        <li class="sn_ddmenu status">
                            <i></i>
                            <ul>@foreach(sn_config('ui.status.values') as $v => $value)
                                    <li data-v="{{$v}}" data-l="{{$value['label'] }}"></li>
                                @endforeach</ul>
                        </li>
                    </ul>
                </div>

                <section id="topicContent" data-field_type="content">

                    <!--// title : displays in the browser title bar //-->
                    <div id="titleSNFW" class="snfw">
                        <div id="title-snfwi" data-field="title" class="snfwi text contenteditableW">
                            <div id="topicTitle" contenteditable data-field_type="topic_title" data-name="title"
                                 class="editor nobr topicTitleInput"
                                 data-placeholder="Untitled Topic">{{ $topic->title ?? '' }}</div>
                        </div>
                    </div>

                    {{-- content fields --}}
                    @php # print "<pre>"; print_r($topic->content); exit; @endphp

                    @if(!is_null($topic->content['sn_fso']))
                        <div class="sort content">
                            @foreach ($topic->content['sn_fso'] as $field_name)
                                @if(isset($topic->content[$field_name]['type']))
                                    {{-- if a user has deleted the content in a field, that value will not be set --}}
                                    @php isset($topic->content[$field_name]['value']) ? $value = $topic->content[$field_name]['value'] : $value = ''; # print "<pre>";  print_r($topic->content); exit; @endphp
                                    @php # if(!isset($topic->content[$field_name]['type'])) { print "<pre>"; print_r($topic->content); exit; } @endphp
                                    @include("be.topics.field", [ "field_type" => "content", "field_name" => $field_name, "field" => $topic->content[$field_name], "value" => $value, "media" => $topic->media ?? [], "mediaJSON" => $topic->mediaJSON['content'] ?? [] ])
                                @endif
                            @endforeach
                        </div>
                    @else
                        <p class="flex justify-center text-center p-12 text-red-500">Looks like there are issues with
                            the settings for this topic.</p>
                    @endif

                    <div id="layoutFields">
                        <div id="layoutW" class="labelSelect">
                            <label>Page Layout:</label>
                            <select id="topicLayout" name="layout">
                                <option value="components.auto" selected>Auto</option>
                                @foreach($sn_page_layouts as $directory => $layout)
                                    <option value="{{ $directory }}.{{ $layout }}"
                                        @if($layout === $topic->layout) selected @endif>{{ $layout }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </section>

                <h2>META TAGS</h2>
                <section id="topicMetas" class="panel" data-field_type="metas">
                    @if(!is_null($topic->metas['sn_fso']))
                        <div class="sort metas">
                            @foreach ($topic->metas['sn_fso'] as $meta_name)
                                @include("be.topics.field", [ "field_type" => "metas", "field_name" => $meta_name, "field" => $topic->metas[$meta_name], "value" => $topic->metas[$meta_name]['value'], "media" => $topic->media ?? [], "mediaJSON" => $topic->mediaJSON['metas'] ?? [] ])
                            @endforeach
                        </div>
                    @else
                        <p class="flex justify-center text-center p-12 text-red-500">Looks like there are issues with
                            the meta tag settings for this topic.</p>
                    @endif
                </section>
            </form>
            <button id="deleteTopicButton"></button>
            <form id="destroyTopicForm" method="post" action="{{ route('be.topic.destroy') }}">
                @csrf
                <input type="hidden" name="topic_id" value="{{ $topic->id }}">
            </form>
        </div>
        <div id="fieldSource">
            @php
                $source_text_field['type'] = 'text';
                $source_richtext_field['type'] = 'richtext';
                $source_media_field['type'] = 'media';
            @endphp
            @include("be.topics.field", [ "field_type" => "", "field_name" => "new-text-field", "field" => $source_text_field, "value" => '', "media" => [], "mediaJSON" => [] ])
            @include("be.topics.field", [ "field_type" => "", "field_name" => "new-rich-text-field", "field" => $source_richtext_field, "value" => '', "media" => [], "mediaJSON" => [] ])
            @include("be.topics.field", [ "field_type" => "", "field_name" => "new-media-field", "field" => $source_media_field, "value" => '', "media" => [], "mediaJSON" => [] ])
            {{--
            <div data-format="html" class="snfw" data-format="field['type'] ?? 'rawHTMLCode'">
                <div id="sn_slug(field_name)-snfwi" data-field="field_name" class="snfwi contenteditableW">
                    <label for="field_name-textarea" title="field_name"><i>field_name</i> <i>field['type']</i></label>
                    <div class="w">
                        <div id="t_topic->id_field_name" data-field_type="field_type" data-name="field_name" data-field_format="field['type']" class="editor field['type']">stripslashes(value)</div>
                        <div class="flex preview w-full">value</div>
                    </div>
                </div>
            </div>
            --}}
        </div>
    </div>
    <?php $topic = $topic->getAttributes(); $content = json_decode($topic['content'], true); ?>
    @include('tools.dropzone.template')
    @include('tools.dropzone.modal')
</x-superniftycms-layout>
