<div data-field data-type="{{ $field['type'] ?? 'text' }}">
    <div contenteditable data-s="name" data-cv="{{ $field_name }}" data-l="name">{{ $field_name }}</div>
    @if($field['type'] === 'media')
        <div contenteditable data-s="format" data-l="accepted file types (comma-separated)"> {{ $field['format'] ?? 'png, jpg, gif' }}</div>
    @else
        <div contenteditable data-s="max" data-l="maxlength">{{ $field['max'] ?? '500' }}</div>
    @endif
    <div class="sn_ddmenu li">
        <i></i>
        <ul>
            <li class="destroyContentOrMetaField">Delete Field & Data?</li>
        </ul>
    </div>
</div>


