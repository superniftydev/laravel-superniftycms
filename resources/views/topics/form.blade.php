


{{-- i believe this file is deprecated and not in use anymore --}}



@if(isset($parent->content['report_style']))
<style>{!!  $parent->content['report_style']  !!}</style>
@endif
<div id="dashboardFormReportW">
    <table id="dashboardFormReport" data-report="{{ $children[0]->slug }}">
        <thead>
            <tr>
                @foreach($children[0]->content as $field_name => $value)
                    <th data-field="{{ $field_name }}">{{ $field_name }}</th>
                @endforeach
                    <th>created at</th>
            </tr>
        </thead>
        <tbody>
        @foreach($children as $c => $child)
            <tr
                data-topic_id="{{ $child->id }}"
                data-topic_slug="{{ $child->slug }}"
                data-title="{{ $child->title }}"
                data-created_at="{{ \Carbon\Carbon::parse($child->created_at)->format('YmdHis') }}"
                data-updated_at="{{ \Carbon\Carbon::parse($child->updated_at)->format('YmdHis') }}"
                data-status="{{ Str::of($child->status)->slug('-') }}"
            >
                @foreach($child->content as $field_name => $value)
                <td><div contenteditable>{{ $value ?? "--" }}</div></td>
                @endforeach
                <td><div contenteditable>{{ $child->created_at ?? "--" }}</div></td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
