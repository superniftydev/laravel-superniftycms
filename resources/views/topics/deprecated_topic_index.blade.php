@props(['type'])

<x-superniftycms-layout :slug="$parent->slug">

    <div class="adminViewW">

        @if ($errors->any())
            <div class="flex items-center p-4 bg-red-400">
            <h2 class="text-2xl text-white mr-4 font-bold items-center">Oops!</h2>
                <ul class="flex items-center text-white">{!! implode('<br/>', $errors->all('<li>:message</li>')) !!}</ul>
            </div>
        @endif


            <div id="sn_adminHeader">
            <div class="flex justify-between items-center w-full">
                <nav class="breadcrumbs">
                    <ul>
                        <li><a href="{{route('dashboard')}}" title="Topics">Dashboard</a></li>

                        <li>LABEL</li>
                    </ul>
                </nav>
                <ul id="topicTools" class="topicActions">
                    <li data-a="topicnewchild">New {{ $parent->settings['l'] }}</li>
                </ul>
            </div>
        </div>

        <section id="topicsOW" class="section topicActions">
            <a id="targetTopicW" class="topic parent"
                    data-topic_id="{{ $parent->id }}"
                    data-topic_slug="{{ $parent->slug }}"
                    data-title="{{ $parent->title }}"
                    data-created_at="{{ \Carbon\Carbon::parse($parent->created_at)->format('YmdHis') }}"
                    data-updated_at="{{ \Carbon\Carbon::parse($parent->updated_at)->format('YmdHis') }}"
                    data-status="{{ Str::of($parent->status)->slug('-') }}"
               href="{{ route('be.topic.edit', [ 'id' => $parent->id ]) }}"
                >
                {{ $parent->title }}
                <ul class="tools">
                    <li data-a="topicsettings"></li>
                    <li data-a="topictogglepublish"></li>
                    <li data-a="topicview"></li>
                </ul>

            </a>
            <div id="topicChildrenW" @if($children) data-count="{{ count($children) }}" @else data-count="0" @endif data-empty="No Entries Created Yet" data-functionality="{{ $parent->functionality }}">
                @if(isset($children) && count($children) > 0)
                    @foreach($children as $c => $child)
                        @php if(isset($parent->settings['indexdisplay']['active'])) $cols = count($parent->settings['indexdisplay']['active']); else $cols = 1; @endphp
                        @include('be.topics.tr', [ 'topic' => $child, 'cols' => $cols ])
                    @endforeach
                    @else
                    <div class="flex justify-center text-center w-full p-12 text-gray-400">
                        <button data-a="topicnewchild" class="rounded border border-gray-300 text-gray-300 px-12 py-4 hover:border-gray-600 hover:text-gray-600 transition-all">Create a {{ $parent->settings['l'] }}</button>
                    </div>
                @endif
            </div>
            <div class="paginationW"></div>
            <div id="qeToolsTemplate">
                <ul class="qet">
                    <li class="publish">Publish</li>
                </ul>
            </div>
        </section>

            <form id="createChildTopicForm" method="post" action="{{ route('be.topic.settings.save') }}">
                @csrf
                <input type="hidden" name="slug" value="{{ $parent->slug }}">
                <input type="hidden" name="functionality" value="{{ $parent->functionality }}">
                <input type="hidden" name="topic_id" value="new">
                <input type="hidden" name="do" value="create_child">
            </form>
            <form id="destroyTopicForm" method="post" action="{{ route('be.topic.destroy') }}">
                @csrf
                <input type="hidden" name="topic_id" value="">
            </form>

    </div>
</x-superniftycms-layout>
