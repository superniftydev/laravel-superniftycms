@php use App\Models\User; @endphp
<a
    class="topic child"
    data-topic_id="{{ $topic->id }}"
    data-topic_slug="{{ $topic->slug }}"
    data-title="{{ $topic->title }}"
    data-created_at="{{ \Carbon\Carbon::parse($topic->created_at)->format('YmdHis') }}"
    data-updated_at="{{ \Carbon\Carbon::parse($topic->updated_at)->format('YmdHis') }}"
    data-status="{{ Str::of($topic->status)->slug('-') }}"
    href="{{ route('be.topic.edit', [ 'id' => $topic->id ]) }}"
>
    <div class="header">
        <div class="title col-span-10">
            {{ $topic->title }}
        </div>
        @if($parent->functionality === 'form')
            <ul class="tools col-span-2">
                <li data-a="topicdelete"></li>
            </ul>
        @else
            <ul class="tools">
                <li data-a="topicdelete"></li>
                <li data-a="topicsettings"></li>
                <li data-a="topictogglepublish"></li>
                <li data-a="topicview"></li>
            </ul>
        @endif
    </div>

    @if(isset($parent->settings['indexdisplay']) && is_array($parent->settings['indexdisplay']))
        <div class="columns" style="grid-template-columns: repeat({{ $cols }}, minmax(0, 1fr));">
            @php $active_fields = $parent->settings['indexdisplay']['active'] ?? []; @endphp

        @foreach($active_fields as $field)
            {{-- non-content fields --}}
            @if(str_starts_with($field, 'sn_'))
                @php
                    $field = substr($field, 3);
                    if($field === 'created_by' || $field === 'last_updated_by'){
                        $user = User::find($topic->{$field});
                        isset($user->id) ? $sn_value = $user->name : $sn_value = 'Admin';
                    }

                    elseif($field === 'created_at' || $field === 'updated_at'){
                         $sn_value = Carbon\Carbon::parse($topic->{$field})->format('Y.m.d @ h:i:s');
                    }
                    else {
                        isset($topic->{$field}) ? $sn_value = $topic->{$field} : $sn_value = '-';
                    }
                @endphp
                <div data-field="{{ $field }}">{{ $sn_value ?? '' }}</div>
            @else
                @php # print $field; print_r($topic->content[$field]); @endphp
                @php isset($topic->content[$field]) && !is_array($topic->content[$field])? $content = strip_tags($topic->content[$field]) : $content = ""; @endphp
                <div data-field="{{ $field }}">{{ $content }}</div>
             @endif
        @endforeach

        </div>

    @endif

</a>

