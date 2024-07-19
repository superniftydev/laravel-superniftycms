@php
    use App\Models\User;
    $last_modifier = User::find($topic->last_updated_by);
@endphp


<ul class="sn_infoTags">
    <li>{{ $topic->id }}</li>
    <li>{{ $topic->slug }}</li>
    <li>{{ $relationship }}</li>
    <li>Last Updated by {{ $last_modifier->name ?? 'Someone' }} @ {{ $topic->updated_at }}</li>
    <li class="publishStatus"></li>
</ul>
