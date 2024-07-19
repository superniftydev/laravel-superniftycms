@props(['type'])
@props(['topic'])
@props(['topic_field'])
@props(['topic_field_type'])
<x-superniftycms-layout :topic="$topic" :topic_field="$topic_field" :topic_field_type="$topic_field_type">

    <div class="adminViewW">

        @if ($errors->any())
            <h2 class="text-2xl text-red-500 mb-4 font-bold">Oops!</h2>
            <p class="text-red-500 mb-4 font-bold">Please fix the issues below:</p>
            <div class="alert alert-danger alert-dismissible">
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                <strong>
                    {!! implode('<br/>', $errors->all('<span>:message</span>')) !!}
                </strong>
            </div>
        @endif
        <div id="sn_adminHeader">
            <h1>All Media</h1>
            @if(!is_null($topic))
                <div class="flex justify-between">
                    <p>Right click any media below and select <strong>Add To Topic</strong> to make it available to the <strong>{{ $topic->title ?? 'Untitled Topic' }}</strong> topic.</p>
                    <a class="done" href="{{ route('be.topic.edit', [ 'id' => $topic->id ]) }}">DONE</a>
                </div>
             @endif
        </div>
    </div>

    <?php # dd($allMedia); ?>

    @include('tools.dropzone.dropzone', [ 'media' => $allMedia ])
    @include('tools.dropzone.template')
    @include('tools.dropzone.modal')

</x-superniftycms-layout>


