@props(['site'])

<x-superniftycms-layout :site="$site">

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
            <nav class="breadcrumbs">
                <ul>
                    <li><a href="{{route('dashboard')}}" title="Topics">Dashboard</a></li>
                    <li>Redirects</li>
                </ul>
            </nav>
            <div class="flex w-full justify-between items-center">
                <h1>Redirects</h1>
                <button class="toggleNewRedirectForm"></button>

            </div>
        </div>

        <section id="redirectsOW" class="section">

            <div id="createNewRedirectFormW">

                <form method="post" action="{{ route('be.redirects.create') }}">
                    @csrf
                    <h5>Create New Redirect</h5>

                    <div class="fw" data-label="old">
                        <input type="text" name="old_url" value="https://{{ sn_site_domain() }}/old_url"
                               placeholder="https://{{ sn_site_domain() }}/old_url">
                    </div>
                    <div class="fw" data-label="new">
                        <input type="text" name="new_url" value="https://{{ sn_site_domain() }}/new_url"
                               placeholder="https://{{ sn_site_domain() }}/new_url">
                    </div>
                    <div class="select-submit">
                        <select name="type">
                            <option value="301">301 Permanent</option>
                            <option value="303">303 Temporary</option>
                        </select>
                        <button>Create New Redirect</button>
                    </div>
                </form>

            </div>


            <ul id="redirectsW">
                @if(isset($redirects))
                    @foreach($redirects as $r => $redirect)
                        <li data-redirect_id="{{ $redirect->id }}" @if($redirect->active) class="active" @endif>
                            <ul>
                                <li contenteditable>{{ $redirect->old_url }}</li>
                                <li contenteditable>{{ $redirect->new_url }}</li>
                            </ul>
                            <select name="type">
                                <option value="301" @if($redirect->type === '301') selected @endif>301 Permanent
                                </option>
                                <option value="303" @if($redirect->type === '303') selected @endif>303 Temporary
                                </option>
                            </select>
                            <div class="fw cbw">
                                <input id="redirect-{{ $redirect->id ?? '' }}" type="checkbox" name="active" value="yes"
                                       @if(isset($redirect) && $redirect->active) checked @endif>
                                <label for="redirect-{{ $redirect->id ?? '' }}"><i></i></label>
                            </div>
                            <span></span>
                        </li>
                    @endforeach
                @endif
            </ul>
        </section>

    </div>

</x-superniftycms-layout>




