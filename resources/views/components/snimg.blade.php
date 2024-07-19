
<x-superniftycms-layout>
    <div class="adminViewW mx-4 xl:mx-auto max-w-7xl">
        <nav class="breadcrumbs">
            <ul>
                <li><a href="{{route('dashboard')}}">Dashboard</a></li>
                <li>/</li>
                <li>Image Processor</li>
            </ul>
        </nav>
        <div id="topicChildrenW" class="w-full bg-white shadow-sm overflow-hidden sm:rounded-lg p-6">
            <div class="flex flex-col w-full items-center justify-between mb-6">
                <img id="resultImage">
                <form class="flex flex-col" id="sendImagePredictionForm">
                    @csrf
                    <input id="sourceImageURLInput" type="hidden" value="">
                    <input id="predictionIDInput" type="hidden" value="">
                    <label class="hidden" for="prompt">Prompt</label>
                    <input id="prompt" type="text" name="prompt" placeholder="Prompt" class="p-6 text-sm border-2 rounded m-6 text-center"/>
                    <button type="button" id="sendImagePredictionButton" class="px-6 py-4 rounded my-4 bg-black text-white mx-auto">Create Image</button>
                    <a href="#" id="cancelPredictionButton" class="px-6 py-4 rounded my-4 bg-black text-white mx-auto">Cancel Image Creation</a>
                    <button type="button" id="getImageResultButton" class="px-6 py-4 rounded my-4 bg-black text-white mx-auto">Get Result</button>
                    <div id="processingStatusDisplay" class="p-6 text-sm border rounded m-6 text-center">doink</div>
                    <div id="errorDisplay" class="p-6 text-sm text-red-500 m-6 text-center"></div>
                </form>
            </div>
        </div>
    </div>
</x-superniftycms-layout>
