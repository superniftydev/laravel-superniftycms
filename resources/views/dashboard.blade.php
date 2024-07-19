@props(['site'])

<?php foreach($topics as $topic) $topicGroups[$topic['group']][] = $topic; ?>

<x-superniftycms-layout>

    <div id="dashboard">
        @if(count($topicGroups) > 0)
            <div id="topicGroups">
                @foreach($topicGroups as $groupName => $topicGroup)
                    <ul class="topicGroup" data-group="{{ $groupName }}">
                        @foreach($topicGroup as $functionality => $topic)

                            <li class="topic" data-functionality="{{ $functionality }}">
                                <a class="manage" href="{{ route('superniftycms.topics.manage', [ 'do' => $functionality ]) }}">
                                    <h3>{{ $topic['plural'] ?? 'farts'}}</h3>
                                    <p>{{ $topic['description'] ?? 'more farts'}}</p>
                                </a>
                            </li>
                        @endforeach
                    </ul>
                @endforeach
            </div>
        @else
            <p>Hmm... It looks like config('superniftycms.topics') is empty.</p>
        @endif
    </div>
</x-superniftycms-layout>

