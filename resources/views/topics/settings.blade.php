

@php
    if($target_topic->parent === null){
        $relationship = 'parent';
        # $do = 'edit_topic_parent';
    }
    else {
        $relationship = 'child';
        # $do = 'edit_topic_child';
    }

@endphp


@props(['do'])
@props(['type'])
@props(['topic'])

<x-superniftycms-layout :topic="$target_topic" :environment="app()->environment" :do="$do">
    <div class="adminViewW">

        <div id="sn_adminHeader">
            <div class="flex justify-between items-center w-full">
                <nav class="breadcrumbs">

                    <ul>
                        <li><a href="{{route('dashboard')}}" title="Topics">Dashboard</a></li>
                        @php
                            if(strlen($target_topic->title) > 0) $edit_label = $target_topic->title;
                            else $edit_label = "Untitled Topic";
                            if($parent->functionality !== 'single' && strlen($parent['settings']['p']) > 0) $index_label = "All ".$parent['settings']['p'];
                            elseif($parent->functionality !== 'single' && strlen($parent->title) > 0) $index_label = "All ".$parent->title;
                            elseif($parent->functionality === 'group') $index_label = 'Untitled Group Index';
                            elseif($parent->functionality === 'form') $index_label = 'Untitled Form Index';
                            else $index_label = 'Untitled Topic Index';
                        @endphp

                        @if($parent->functionality === 'single')
                            <li><a href="{{route('be.topic.edit', [ 'id' => $target_topic->id ])}}" title="{{ $target_topic->slug ?? 'Topic' }} Settings">{{ $edit_label }}</a></li>
                        @else
                            <li><a href="{{route('be.topic.index', [ 'id' => $parent->id ])}}" title="{{ $target_topic->slug ?? 'Topic' }} Settings">{{ $index_label }}</a></li>
                        @endif
                        @if($target_topic->parent !== null)
                            <li><a href="{{route('be.topic.edit', [ 'type' => $target_topic->slug, 'id' => $target_topic->id ])}}" title="Back To Topic">{{ $edit_label }}</a></li>
                        @endif
                        <li id="topicTitleDisplay">Settings</li>
                    </ul>
                </nav>
            </div>
        </div>
        @include('be.topics.settingsForm')
        @include('be.tools.infoTags', ['topic' => $target_topic])
    </div>
</x-superniftycms-layout>





