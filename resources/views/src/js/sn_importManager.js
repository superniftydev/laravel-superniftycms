'use strict';


window.sn_site_import = {

    'importSiteForm': document.getElementById('importSiteForm') ? document.getElementById('importSiteForm') : null,
    'imagesToImport': document.getElementById('imagesToImport') ? document.getElementById('imagesToImport') : null,
    'topicURL': document.getElementById('topicURL') ? document.getElementById('topicURL') : null,
    'topicSettingsForm': document.getElementById('topicSettingsForm') ? document.getElementById('topicSettingsForm') : null,
    'importedContentFields': document.querySelectorAll('#importedContent .value') ? document.querySelectorAll('#importedContent .value') : null,
    'importStatus': document.querySelector('#importStatus') ? document.querySelector('#importStatus') : null,

    'topicListW': document.querySelector('#topicListW') ? document.querySelector('#topicListW') : null,
    'importChannel': document.querySelector('#topicListW') ? document.querySelector('#topicListW').dataset.channel : 'none',
    'topicList': document.querySelector('#topicList') ? document.querySelector('#topicList') : null,

    'validateImportForm' : (e) => {
        console.log('what changed: ', e.target);

        let slugDisplay = document.getElementById('topicURLDisplay');
        if(slugDisplay){ slugDisplay.innerText = e.target.value; }

        if(sn_site_import.topicURL){
            sn_site_import.topicURL.value = sn_helpers.slugify(sn_site_import.topicURL.value);
        }
        if(
            sn_site_import.topicURL &&
            sn_site_import.topicURL.value.length > 0
        ){

            sn_helpers.postData(
                '/admin/topic/validatetopicurl',
                    'post',
                    {
                        'id': 'snausages',
                        'slug': sn_site_import.topicURL.value
                    })
                .then(response => {
                    console.log('confirmUniqueTopicSlug response foozy2: ', response);
                    document.body.dataset.topic_slug = response.result;
                })
                .catch((error) => { console.error('!!! --> updateTopicManagerModalFormValue error:', error); });

        }

        /* creating a child that requires a parent selection */
        else {
            let topicParentSelect = document.getElementById('topicParentSelection');
            console.log('topicParentSelect value: ', topicParentSelect.value);
            if(topicParentSelect && topicParentSelect.value !== null){
                document.body.dataset.import_form = 'ok'
            }
        }

    },

    'listenTopicTypeChanges': () => {
        let topicURL = document.getElementById('topicURL');
        if(topicURL){
            console.log('found');
            topicURL.removeEventListener('keyup', sn_site_import.validateImportForm, null);
            topicURL.addEventListener('keyup', sn_site_import.validateImportForm, null);
        }
    },

    'listenTopicTitleChanges': (e) => {
        let topicTitle = document.getElementById("topicTitle");
        let topicTitleDisplay = document.getElementById("topicTitleDisplay");
        if(topicTitleDisplay){
            topicTitle.addEventListener( "keyup", () => {
                topicTitleDisplay.innerText = sn_helpers.slugify(topicTitle.value);
                document.body.setAttribute('data-form_changed', 'y');
            });
        }
    },

    'indicateImportFormContentChanged' : (e) => {
        console.log('what changed: ', e.target);
        document.body.setAttribute('data-form_changed', 'y');
    },

    'listenContentOrMetaValueChanges': () => {
        let importerValues = document.querySelectorAll('.importer .value');
        if(importerValues){
            for (let i = 0; i < importerValues.length; i++) {
                importerValues[i].removeEventListener('keyup', sn_site_import.indicateImportFormContentChanged, null);
                importerValues[i].addEventListener('keyup', sn_site_import.indicateImportFormContentChanged, null);
            }
        }
    },

    "importComplete": () => {
        sn_helpers.postData('/admin/import/site/complete', 'post', '')
            .then(data => {
                console.log('!!! ::::::: --> sn_site_import.importComplete response: ', data);
                if(data.size === 0){
                    // window.location.href = '/admin/import/index';
                    console.log('!!! --> site import complete...');
                }
            })
            .catch((error) => { console.error('!!! --> sn_site_import.importComplete error:', error); });
    },

    /* delete imported page */
    'deleteImportedPage': (e) => {
        sn_helpers.postData('/admin/import/site/page/delete', 'post', { 'id': e.target.closest('li').id })
            .then(data => {
                console.log('!!! ::::::: --> sn_site_import.deleteImportedPage response: ', data);
                e.target.closest('li').remove();
                document.getElementById('importedContent').innerText = '';
            })
            .catch((error) => { console.error('!!! --> sn_site_import.deleteImportedPage error:', error); });
    },

    'listenDeleteImportedPage': () => {
        let deleteImportedPageButton = document.querySelectorAll("#topicList li i.delete-imported-page");
        for (let i = 0; i < deleteImportedPageButton.length; i++) {
            deleteImportedPageButton[i].removeEventListener('click', sn_site_import.deleteImportedPage, null);
            deleteImportedPageButton[i].addEventListener('click', sn_site_import.deleteImportedPage, null);
        }
    },

    /* import media */
    'importMedia': (e) => {
        let type = e.target.dataset.type;
        let media = [];

        if(type === 'pdf'){
            console.log('sn_site_import.queuedPages.length: ', sn_site_import.queuedPages.length);
            for (let i = 0; i < sn_site_import.queuedPages.length; i++) {
                if(sn_site_import.queuedPages[i].querySelector("td:nth-child(4)").dataset.i === 'pdf') {
                    media.push(sn_site_import.queuedPages[i].querySelector("td:nth-child(3) a:nth-child(2)").getAttribute('href'));
                }
            }
        }

        /* watch out for data:: */
        else if(type === 'img'){
            console.log('sn_site_import.queuedPages.length: ', sn_site_import.queuedPages.length);
            for (let i = 0; i < sn_site_import.queuedPages.length; i++) {
                if(sn_site_import.queuedPages[i].querySelector("td:nth-child(4)").dataset.i === 'pdf') {
                    media.push(sn_site_import.queuedPages[i].querySelector("td:nth-child(3) a:nth-child(2)").getAttribute('href'));
                }
            }
        }

        console.log('media: ', media);
        sn_helpers.postData('/admin/import/media', 'post', { 'media': media })
            .then(data => {
                console.log('!!! ::::::: --> sn_site_import.importMedia response: ', data);
            })
            .catch((error) => { console.error('!!! --> sn_site_import.importMedia error:', error); });
    },

    'toggleImportImages': (e) => {
        if(e.target.hasAttribute('id')){
            let importImages = document.querySelectorAll("#imagesToImport ul li");
            if(importImages){
                if(e.target.dataset.import === 'all' || e.target.dataset.import === 'selected'){
                    for (let i = 0; i < importImages.length; i++) {
                        importImages[i].closest('li').classList.remove('import');
                        e.target.setAttribute('data-import', 'none');
                    }
                }
                else {
                    for (let i = 0; i < importImages.length; i++) {
                        importImages[i].closest('li').classList.add('import');
                        e.target.setAttribute('data-import', 'all');
                    }
                }
            }
        }
        else {
            e.target.closest('li').classList.toggle('import');
            document.getElementById('toggleBulkImportImages').setAttribute('data-import','selected');
        }
    },

    'listenToggleImportSpecificMedia': () => {
        let importMedia = document.querySelectorAll("#imagesToImport  ul li, #toggleBulkImportImages");
        if(importMedia){
            for (let i = 0; i < importMedia.length; i++) {
                importMedia[i].removeEventListener('click', sn_site_import.toggleImportImages, null);
                importMedia[i].addEventListener('click', sn_site_import.toggleImportImages, null);
            }
        }
    },

    'listenImportMedia': () => {
        let importMediaButtons = document.querySelectorAll(".importMedia");
        if(importMediaButtons){
            for (let i = 0; i < importMediaButtons.length; i++) {
                importMediaButtons[i].removeEventListener('click', sn_site_import.importMedia, null);
                importMediaButtons[i].addEventListener('click', sn_site_import.importMedia, null);
            }
        }
    },

    /* finalize the importation of a single imported page */
    'finalizeImport': (e) => {
        e.preventDefault();
        console.log('finalizeImport');
        let formData = new FormData(sn_site_import.topicSettingsForm);
        if(sn_site_import.importedContentFields){
            for (let i = 0; i < sn_site_import.importedContentFields.length; i++) {
                let key = sn_site_import.importedContentFields[i].dataset.field;
                if(key === 'main'){
                    formData.append(key, sn_site_import.importedContentFields[i].innerHTML);
                }
                else {
                    formData.append(key, sn_site_import.importedContentFields[i].innerText);
                }
            }
        }

        if(sn_site_import.imagesToImport){
            let imagesToImport = sn_site_import.imagesToImport.querySelectorAll('li.import');
            if(imagesToImport){
                let mediaURLs = {};
                for (let i = 0; i < imagesToImport.length; i++) {
                    mediaURLs[i] = imagesToImport[i].getAttribute('data-url');
                }
                formData.append('media_to_import', JSON.stringify(mediaURLs));
            }
        }

        sn_helpers.postData('/admin/import/site/page/finalize', 'post', Object.fromEntries(formData))
            .then(data => {
                console.log('!!! ::::::: --> sn_site_import.updateQueuedContentField response: ', data);
            })
            .catch((error) => { console.error('!!! --> sn_site_import.updateQueuedContentField error:', error); });

    },

    'listenTopicParentSelection': () => {
        let topicParentSelection = document.querySelector("#topicParentSelection");
        let slugDisplay = document.getElementById('topicURLDisplay');
        if(topicParentSelection && slugDisplay){
            topicParentSelection.addEventListener( "change", () => {
                slugDisplay.innerText = topicParentSelection.options[topicParentSelection.selectedIndex].text;
            });
        }

    },

    'changeTopicFunctionality': (e) => {
        console.log('---> ', e.target);
        document.body.setAttribute('data-topic_functionality', e.target.value);
    },

    'listenChangeTopicFunctionality': () => {
        let selectFunctionalityRadios = document.querySelectorAll("#topicFunctionalityRadios input[type='radio'][name='functionality']");
        if(selectFunctionalityRadios){
            for (let i = 0; i < selectFunctionalityRadios.length; i++) {
                selectFunctionalityRadios[i].removeEventListener('click', sn_site_import.changeTopicFunctionality, null);
                selectFunctionalityRadios[i].addEventListener('click', sn_site_import.changeTopicFunctionality, null);
            }
        }
    },

    'listenMakeHomePage': () => {
        let makeHomePageCheckbox = document.getElementById("makeHomePage");
        let overwriteExistingTopicCheckbox = document.getElementById("overwriteExistingTopic");
        if(makeHomePageCheckbox){
            makeHomePageCheckbox.addEventListener( "change", () => {
                if(makeHomePageCheckbox.checked) {
                    document.body.setAttribute('data-topic_is_homepage', 'y');
                    document.body.setAttribute('data-overwrite_existing_slug', 'y');
                    overwriteExistingTopicCheckbox.checked = true;
                } else {
                    document.body.removeAttribute('data-topic_is_homepage');
                    document.body.removeAttribute('data-overwrite_existing_slug');
                    overwriteExistingTopicCheckbox.checked = false;
                }
            });
        }
    },

    'listenOverwriteExistingTopic': () => {
        let overwriteExistingTopicCheckbox = document.getElementById("overwriteExistingTopic");
        if(overwriteExistingTopicCheckbox){
            overwriteExistingTopicCheckbox.addEventListener( "change", () => {
                if(overwriteExistingTopicCheckbox.checked) {
                    document.body.setAttribute('data-overwrite_existing_slug', 'y');
                } else {
                    document.body.removeAttribute('data-overwrite_existing_slug');
                }
            });
        }
    },

    'updateQueuedContent': (target) => {
        let values = document.querySelectorAll('.importer .value');
        if(values){

            let fields = {};
            for (let i = 0; i < values.length; i++) {
                fields[values[i].dataset.field] = values[i].innerHTML;
            }
            if(fields){
                console.log('fields: ', fields);
                let imported_page_id = document.querySelector("input[name='imported_page_id']").value;
                sn_helpers.postData(
                        '/admin/import/site/page/update',
                        'post',
                        {
                            'title': document.getElementById("topicTitle").value,
                            'imported_page_id': imported_page_id,
                            'fields': fields,
                        }
                    )
                    .then(response => {
                        console.log('!!! ::::::: --> sn_site_import.updateQueuedContentField response: ', response);
                        if(response.result === 'ok'){
                            document.body.removeAttribute('data-form_changed');

                        }

                    })
                    .catch((error) => { console.error('!!! --> sn_site_import.updateQueuedContentField error:', error); });
            }

        }

    },

    'queuedContentChanged': () => {
        document.body.setAttribute('data-queued_content_changed', 'y');
    },

    'listenUpdateQueuedContent': () => {

        let saveChangesButton = document.getElementById("saveChangesButton");
        if(saveChangesButton){
            saveChangesButton.removeEventListener('click', sn_site_import.updateQueuedContent, null);
            saveChangesButton.addEventListener('click', sn_site_import.updateQueuedContent, null);
        }

        let finalizeImportButton = document.getElementById("finalizeImportButton");
        if(finalizeImportButton){
            finalizeImportButton.removeEventListener('click', sn_site_import.finalizeImport, null);
            finalizeImportButton.addEventListener('click', sn_site_import.finalizeImport, null);
        }

    }

}

if(sn_site_import.importChannel !== 'none'){

    // setInterval(function(){
    //     sn_site_import.importComplete();
    // }, 1000);


    /*

    <li id="9c0b3131-0e46-41f7-b227-748137a6c95d" data-type="html" data-status="queued">
    <a href="https://kmmgrp.test/admin/import/site/process/9c0b3131-0e46-41f7-b227-748137a6c95d">About Us - KMM</a>
</li>

    */



    /* enable pusher */
    let p = new Pusher(sn_globals.sn_pusher_key, { cluster: 'us2' });
    let c = p.subscribe(sn_site_import.importChannel);
    console.log('subscribed to ' + sn_site_import.importChannel);

    /* PageImported */
    c.bind('PageImported', function(data) {

        console.log('page imported: ', data);

        let li =  document.createElement('li');
        li.setAttribute('id', data.page.id);
        li.setAttribute('data-status', data.page.status);
        li.setAttribute('data-status', data.page.type);


        let editlink = document.createElement('a');
        editlink.textContent = data.page.title;
        editlink.setAttribute('href', '/admin/import/site/process/' + data.page.id);
        li.appendChild(editlink);

        sn_site_import.topicList.appendChild(li);


    });

    /* AllPagesImported */
    c.bind('AllPagesImported', function(data) {
        console.log('all pages imported: ', data);
    });

}


sn_site_import.listenDeleteImportedPage();
sn_site_import.listenImportMedia();
sn_site_import.listenTopicParentSelection();
sn_site_import.listenToggleImportSpecificMedia();
sn_site_import.listenChangeTopicFunctionality();
// sn_site_import.listenTopicTypeChanges(); /* replace with updated version in sn_helpers.js */
sn_site_import.listenContentOrMetaValueChanges();
sn_site_import.listenUpdateQueuedContent();
sn_site_import.listenMakeHomePage();
sn_site_import.listenOverwriteExistingTopic();
sn_site_import.listenTopicTitleChanges();
