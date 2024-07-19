@php # print "<pre>"; print_r($field); print "</pre>"; exit; @endphp
@php # print "<pre>"; print_r($mediaJSON); print "</pre>"; exit; @endphp


@if($field['type'] === 'media')


<div class="snfw" data-type="{{ $field['type'] }}">
    <div class="settings">
        <div class="h"></div>
        <div class="attribute n" contenteditable>{{ $field_name }}</div>
        {{-- @if(sn_can('code')) --}}
            <div class="attribute aft e" contenteditable>{{ $field['aft'] ?? 'png,jpg,gif' }}</div>
        {{-- @else
            <div class="aft">{!! sn_accepted_file_type_icons($field['aft']) !!}</div>
        @endif --}}
        @if($field_type !== 'metas')
            <div class="attribute layout">
                <select class="mediaLayoutSelect">
                    <optgroup label="Layout">
                    @foreach($sn_media_layouts as $layout)
                        <option value="{{ $layout }}" @if(isset($field['sn_layout']) && $layout === $field['sn_layout']) selected @endif>{{ $layout }}</option>
                    @endforeach
                    </optgroup>
                </select>
            </div>
            <div class="attribute style">
                <select class="fieldStyleSelect">
                    <optgroup label="Style">
                    @foreach(sn_config('styles.field_style') as $style)
                        <option value="{{ $style }}" @if(isset($field['sn_style']) && $style === $field['sn_style']) selected @endif>{{ $style }}</option>
                    @endforeach
                    </optgroup>
                </select>
            </div>
        @endif
        <i class="x"></i>
    </div>
    <div id="{{ sn_slug($field_name) }}-snfwi" data-field="{{ $field_name }}" data-aft="{{ $field['aft'] ?? 'png,jpg,gif' }}" class="snfwi drop">
        @include('tools.dropzone.dropzone', [ 'media' => $mediaJSON[$field_name] ?? '' ])
    </div>
</div>

@elseif($field['type'] === 'text' || $field['type'] === 'richtext')

    <div class="snfw transcriptor" data-type="{{ $field['type'] ?? 'text' }}">
        <div class="settings">
            <div class="h"></div>
            <div class="attribute n" contenteditable>{{ $field_name }}</div>
            <div></div>
            @if($field_type !== 'metas')
                <div class="attribute layout">
                    <select class="textLayoutSelect">
                        <optgroup label="Layout">
                        @foreach($sn_text_layouts as $layout)
                            <option value="{{ $layout }}" @if(isset($field['sn_layout']) && $layout === $field['sn_layout']) selected @endif>{{ $layout }}</option>
                        @endforeach
                        </optgroup>
                    </select>
                </div>
                @if($field['type'] === 'text')
                    <div class="attribute tag">
                        <select class="textTagSelect">
                            @php $tags = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]; @endphp
                            <optgroup label="Tag">
                            @foreach($tags as $tag)
                                <option value="{{ $tag }}" @if(isset($field['sn_tag']) && $tag === $field['sn_tag']) selected @endif>{{ $tag }}</option>
                            @endforeach
                            </optgroup>
                        </select>
                    </div>

                @endif
                <div class="attribute style">
                    <select class="fieldStyleSelect">
                        <optgroup label="Style">
                        @foreach(sn_config('styles.field_style') as $style)
                            <option value="{{ $style }}" @if(isset($field['sn_style']) && $style === $field['sn_style']) selected @endif>{{ $style }}</option>
                        @endforeach
                        </optgroup>
                    </select>
                </div>
            @endif
            <i class="x"></i>
        </div>

        <div id="{{ sn_slug($field_name) }}-snfwi" data-field="{{ $field_name }}" class="snfwi contenteditableW">
            <div id="t_{{$topic->id}}_{{$field_name}}" data-name="{{ $field_name }}" data-type="{{ $field['type'] }}" class="editor {{ $field['type'] }}">{!! $value !!}</div>
       </div>
        <ol class="final"></ol>
        <ul class="dictationTools"><li><select class="l"></select></li><li><select class="d"></select></li><li class="mic"></li><li class="reset"></li><li class="done"></li><li class="init"></li></ul>
        <span class="interim"></span>
    </div>

@elseif($field['type'] === 'rawHTMLCode')

    <div class="snfw" data-type="{{ $field['type'] ?? 'rawHTMLCode' }}">
        <div class="settings">
            <div class="h"></div>
            <div class="n" contenteditable>{{ $field_name }}</div>
            <div></div>
            <i class="x"></i>
        </div>
        <div id="{{ sn_slug($field_name) }}-snfwi" data-field="{{ $field_name }}" class="snfwi contenteditableW">
            <div class="w">
                <div id="t_{{$topic->id}}_{{$field_name}}" data-name="{{ $field_name }}" data-type="{{ $field['type'] }}" class="editor {{ $field['type'] }}">{!! stripslashes($value) !!}</div>
                <div class="flex preview w-full">{!! $value !!}</div>
            </div>
        </div>
    </div>

@endif
