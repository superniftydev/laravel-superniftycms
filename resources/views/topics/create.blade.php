@props(['type'])
@props(['topic'])

<x-superniftycms-layout :environment="app()->environment">


    <div class="adminViewW">
            <div id="sn_adminHeader">
                <div class="flex justify-between items-center w-full">
                    <nav class="breadcrumbs">
                        <ul>
                            <li><a href="{{route('dashboard')}}" title="Topics">Dashboard</a></li>
                            <li id="topicTitleDisplay">Create Topic</li>
                        </ul>
                    </nav>
                </div>
            </div>

            <h1 class="flex flex-col max-w-7xl mx-auto font-bold text-4xl mb-4 text-gray-900">Create A New Topic</h1>

            <section class="flex flex-col bg-white rounded shadow max-w-7xl mx-auto px-4 py-8">
                @include('be.topics.settingsForm')
            </section>


        </div>
    </div>

</x-superniftycms-layout>
