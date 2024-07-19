'use strict';

import '../bootstrap';
import Alpine from 'alpinejs';
import Isotope from 'isotope-layout';
import Sortable from 'sortablejs';



// window.Alpine = Alpine;
// Alpine.start();
window.scrollTo(0,1);

window.sn_topics = {

    'activeTopic': {},
    'topicActionButtons': document.querySelectorAll('.topicActions [data-a]') ? document.querySelectorAll('.topicActions [data-a]') : null,
    'topicTagsW': document.querySelector('#topicTagsW') ? document.querySelector('#topicTagsW') : null,
    'topicTagsInput': document.querySelector('#topicTagsInput') ? document.querySelector('#topicTagsInput') : null,
    'snmde': {},

    'deleteChildTopicForm': document.querySelector('#deleteChildTopicForm') ? document.querySelector('#deleteChildTopicForm') : null,
    'warnDeleteChildTopicButton': document.querySelector('#warnDeleteChildTopicButton') ? document.querySelector('#warnDeleteChildTopicButton') : null,

    'toggleEditorModeSelect': document.querySelector('#toggleEditorModeSelect') ? document.querySelector('#toggleEditorModeSelect') : null,
    'topicChildren': document.querySelector('.spreadsheet.children tbody') ? document.querySelector('.spreadsheet.children tbody') : null,
    'topicChildrenFilters': document.querySelector('#topicChildrenFilters') ? document.querySelector('#topicChildrenFilters') : null,
    'topicChildrenFilterButtons': document.querySelectorAll('#topicChildrenFilters li[data-action]') ? document.querySelectorAll('#topicChildrenFilters li[data-action]') : null,
    'manualSortTopicList': null,
    'manualSortTopicListActive': false,
    'topicFilterButtons': [],
    'topicChildrenSorts': document.querySelector('#topicChildrenSorts') ? document.querySelector('#topicChildrenSorts') : null,
    'topicChildrenSortButtons': document.querySelectorAll('#topicChildrenSorts li[data-action]') ? document.querySelectorAll('#topicChildrenSorts li[data-action]') : null,
    'topicSortButtons': [],
    'topicSortData': [],
    'sorting': false,
    'isoSortTopicList': null,
    'isoSortTopicListActive': false,
    'activetinyMce': null,

    'topicChildrenW': document.querySelector('#topicChildrenW') ? document.querySelector('#topicChildrenW') : null,
    'manualTopicSortToggle': document.querySelector('#manualTopicSortToggle') ? document.querySelector('#manualTopicSortToggle') : null,

    'topicEditForm': document.getElementById('topicEditForm') ? document.getElementById('topicEditForm') : null,

    'topicFieldTemplates': document.getElementById('sn_topicFieldTemplates') ? document.getElementById('sn_topicFieldTemplates') : null,

    'topicContentAndMetaFieldSorts': document.querySelectorAll('#topicEditForm .sort') ? document.querySelectorAll('#topicEditForm .sort') : null,


    'topicChanged': () => {
        if(document.body.hasAttribute("data-url_status") && ( document.body.dataset.url_status === 'ok' || document.body.dataset.url_status === 'stet')){
            document.body.setAttribute('data-display_topic_save_button', 'y');
        }
        else {
            document.body.removeAttribute('data-display_topic_save_button');
        }
        document.body.dataset.layout = document.getElementById('topicLayout').value;


    },

    'saveTopic': (e) => {
        let data = sn_topics.constructTopicDataObject();
        console.log('data being sent to server: ', data);




        sn_helpers.postData('/admin/topic/save', 'post', data)
            .then(response => {
                console.log('!!! --> saveTopic: ', response);
                if (response.result === 'ok') {
                    document.body.removeAttribute('data-display_topic_save_button');
                }
            })
            .catch((error) => {
                console.error('!!! --> saveTopic error:', error);
            });





    },


    /* ~~~~~~~~~~~~~~~~~~~~ toggle meta ~~~~~~~~~~~~~~~~~~~~ */

    'toggleTopicMetaData': () => {
        document.body.hasAttribute('data-display_topic_meta') ? document.body.removeAttribute('data-display_topic_meta') : document.body.setAttribute('data-display_topic_meta', 'y')
    },

    'toggleTopicMetaDataListener': () => {
        const toggleTopicMetaDataButton = document.getElementById("toggleTopicMetaData");
        if(toggleTopicMetaDataButton){
            toggleTopicMetaDataButton.removeEventListener('click', sn_topics.toggleTopicMetaData, null);
            toggleTopicMetaDataButton.addEventListener('click', sn_topics.toggleTopicMetaData, null);
        }
    },



    /* ~~~~~~~~~~~~~~~~~~~~ topic actions ~~~~~~~~~~~~~~~~~~~~ */


    'topicActions': (e) => {

        e.preventDefault(); /* for those nested in links */


        /* dashboard */
        if(e.target.dataset.a === 'newparenttopic' || e.target.dataset.a === 'newparenttopic'){
            window.open(e.target.dataset.url, "_self");
        }

        /* topic-specific actions */
        else if(e.target.closest("[data-u]")){

            let target = e.target.closest("[data-u]");
            console.log('target', target);

            if(e.target.dataset.a ==='e'){ window.open("/admin/topic/edit/" + e.target.closest("[data-ti]").dataset.ti, "_self"); }
            else if(e.target.dataset.a ==='v'){ window.open('/' + e.target.closest("[data-u]").dataset.u, "_blank"); }


            else if(e.target.dataset.a === '+' || e.target.dataset.a === 'c') {
                let url_prefix = e.target.closest("li[data-u]").dataset.u;
                if(e.target.dataset.a === 'c'){
                    let url_prefix_parts = url_prefix.split('/');
                    url_prefix_parts.pop();
                    url_prefix = url_prefix_parts.join('/');
                    document.querySelector("#createTopicForm input[name='clone_id']").value = e.target.closest("li[data-ti]").dataset.ti;
                }
                document.querySelector("#createTopicForm input[name='url_prefix']").value = url_prefix;
                document.querySelector("#createTopicForm").submit();

            }

            else if(e.target.dataset.a ==='x'){
                let target = e.target.closest("li[data-ti]");
                if(target.classList.contains('warn')){
                    let destroyTopicForm = document.getElementById('destroyTopicForm');
                    destroyTopicForm.querySelector("input[name='topic_id']").value = target.dataset.ti;
                    destroyTopicForm.submit();
                }
                else {
                    target.classList.add('warn');
                    e.target.addEventListener('mouseleave', function(b) {
                        e.target.classList.remove('warn');
                    });
                }
            }

        }



        else if(e.target.dataset.a ==='topicview'){ window.open('/' + document.body.dataset.topic_url, "_blank"); }


          /*
        else if(e.target.dataset.a === 'newparenttopic'){ window.open(e.target.dataset.url, "_self"); }

        else if(e.target.dataset.a ==='topicnewchild'){
            let createChildTopicForm = document.getElementById('createChildTopicForm');
            createChildTopicForm.submit();
        }

           */

    },



    'deleteTopic': (e) => {
        if(e.target.classList.contains('warn')){
            document.getElementById('destroyTopicForm').submit();
        }
        else {
            e.target.classList.add('warn');
            e.target.addEventListener('mouseleave', function(b) {
                e.target.classList.remove('warn');
            });
        }
    },

    'listenDeleteTopic': () => {
        let deleteTopicButton = document.getElementById('deleteTopicButton');
        if(deleteTopicButton){
            deleteTopicButton.addEventListener( "click", sn_topics.deleteTopic, false);
        }
    },

    'listenTopicActions': () => {
        if(sn_topics.topicActionButtons) {
            for (let b = 0; b < sn_topics.topicActionButtons.length; b++) {
                sn_topics.topicActionButtons[b].addEventListener( "click", sn_topics.topicActions, false);
            }
        }
    },

    'constructTopicDataObject': () => {

        let data = {};
        let sorts = {};
        let content = {};
        let metas = {};

        data['id'] = document.body.dataset.topic_id;
        data['title'] = document.getElementById('topicTitle').innerText.trim();
        data['url'] = document.getElementById('topicURL').value.trim();
        if(data['url'].charAt(data['url'].length - 1) === '-') data['url'] = data['url'].substring(0, data['url'].length - 1);
        document.getElementById('topicURL').value = data['url']
        /* history.pushState({},"", data['url']); */

        data['layout'] = document.getElementById('topicLayout').value;

        let contentFields = document.querySelectorAll("#topicEditForm .sort.content .snfw");
        if(contentFields){
            let sort = [];
            for (let i = 0; i < contentFields.length; i++) {
                let field = {};
                console.log('xxx ---> ', contentFields[i].querySelector(".settings .attribute.n"));
                let name = contentFields[i].querySelector(".settings .attribute.n");
                field['name'] = name.innerText.length > 0 && name.innerText !== 'Untitled Field' ? sn_helpers.slugify(name.innerText.trim()) : 'untitled_field_' + i;
                content[field['name']] = {};
                sort.push(field['name']);
                if(contentFields[i].querySelector('.editor.text')){
                    content[field['name']]['type'] = 'text';
                    content[field['name']]['value'] = contentFields[i].querySelector('.editor.text').innerText;
                    content[field['name']]['sn_layout'] = contentFields[i].querySelector(".settings .attribute.layout select").value;
                    content[field['name']]['sn_tag'] = contentFields[i].querySelector(".settings .attribute.tag select").value;
                    content[field['name']]['sn_style'] = contentFields[i].querySelector(".settings .attribute.style select").value;
                }
                else if(contentFields[i].querySelector('.editor.richtext')){
                    content[field['name']]['type'] = 'richtext';
                    content[field['name']]['value'] = contentFields[i].querySelector('.editor.richtext').innerHTML;
                    content[field['name']]['sn_layout'] = contentFields[i].querySelector(".settings .attribute.layout select").value;
                    content[field['name']]['sn_style'] = contentFields[i].querySelector(".settings .attribute.style select").value;
                }
                else if(contentFields[i].querySelector('.dropzone')){
                    content[field['name']]['type'] = 'media';
                    let aft_container = contentFields[i].querySelector(".settings div.aft");
                    if(aft_container.isContentEditable) {
                        content[field['name']]['aft'] = aft_container.innerText;
                    }
                    else {
                        let aft = [];
                        let types = aft_container.querySelectorAll('ol li');
                        if(types){
                            for (let t = 0; t < types.length; t++) {
                                aft.push(types[t].innerText);
                            }
                        }
                        content[field['name']]['aft'] = aft.join(',');
                    }
                    content[field['name']]['sn_layout'] = contentFields[i].querySelector(".settings .attribute.layout select").value;
                    content[field['name']]['sn_style'] = contentFields[i].querySelector(".settings .attribute.style select").value;
                    let media_sort = [];
                    let media =  contentFields[i].querySelectorAll('.dz-preview');
                    if(media){
                        for (let m = 0; m < media.length; m++) {
                            media_sort.push(media[m].dataset.media_id);
                        }
                    }
                    content[field['name']]['value'] = media_sort;
                }
            }
            content['sn_fso'] = sort;
        }

        let metaFields = document.querySelectorAll("#topicEditForm .sort.metas .snfw");

        if(metaFields){
            let sort = [];
            for (let i = 0; i < metaFields.length; i++) {
                let field = {};
                let name = metaFields[i].querySelector(".settings .attribute.n");
                field['name'] = name.innerText.length > 0 && name.innerText !== 'Untitled Field' ? sn_helpers.slugify(name.innerText.trim()) : 'untitled_field_' + i;
                metas[field['name']] = {};
                sort.push(field['name']);
                if(metaFields[i].querySelector('.editor.text')){
                    metas[field['name']]['type'] = 'text';
                    metas[field['name']]['value'] = metaFields[i].querySelector('.editor.text').innerText;
                }
                else if(metaFields[i].querySelector('.editor.richtext')){
                    metas[field['name']]['type'] = 'richtext';
                    metas[field['name']]['value'] = contentFields[i].querySelector('.editor.richtext').innerHTML;
                }
                else if(metaFields[i].querySelector('.dropzone')){
                    metas[field['name']]['type'] = 'media';
                    let aft_container = metaFields[i].querySelector(".settings div.aft");
                    if(aft_container.isContentEditable) {
                        metas[field['name']]['aft'] = aft_container.innerText;
                    }
                    else {
                        let aft = [];
                        let types = aft_container.querySelectorAll('ol li');
                        if(types){
                            for (let t = 0; t < types.length; t++) {
                                aft.push(types[t].innerText);
                            }
                        }
                        metas[field['name']]['aft'] = aft.join(',');
                    }
                    let media_sort = [];
                    let media =  metaFields[i].querySelectorAll('.dz-preview');
                    if(media){
                        for (let m = 0; m < media.length; m++) {
                            media_sort.push(media[m].dataset.media_id);
                        }
                    }
                    metas[field['name']]['value'] = media_sort;
                }
            }
            metas['sn_fso'] = sort;
        }

        data['content'] = content;
        data['metas'] = metas;
        return data;
    },


    'validateTopicURL' : () => {
        console.log('validateTopicURL...');
        let topicURLInput = document.getElementById('topicURL');
        let url = sn_helpers.urlify(topicURLInput.value);
        topicURLInput.style.width = topicURLInput.value.length + "ch";




        /* history.pushState({},"",url); */
        topicURLInput.value = url;
        if(url.length > 0){
            sn_helpers.postData(
                    '/admin/topic/validatetopicurl',
                    'post',
                    {
                        'id': document.body.dataset.topic_id,
                        'url': url
                    })
                .then(response => {
                    console.log('validateTopicURL response: ', response);
                    document.body.dataset.url_status = response.result;
                        sn_topics.topicChanged();
                    return response;
                })
                .catch((error) => { console.error('!!! --> validateTopicURL error:', error); });
        }
        else {
            return 'empty';
        }

    },

    'listenValidateTopicURL': () => {
        let topicURLInput =  document.getElementById('topicURL');
        if(topicURLInput){
            topicURLInput.addEventListener('keyup', sn_topics.validateTopicURL, false);
        }
    },


    'initSortTopicContentOrMetaFields':  (target) => {
        Sortable.create(target, {
            draggable: ".snfw",
            handle: ".settings .h",
            group: {
                name: "fields",
                put: true,
                ghostClass: "sortable-ghost",
                animation: 150,
            },
            onStart: function (e) {
                console.log('before sort...');
                /* because content is often duplicated within activated tinyMCEs */
                let snfwis = document.querySelectorAll('.snfwi');
                if(snfwis){
                    for (let s = 0; s < snfwis.length; s++) {
                        snfwis[s].classList.add('sn_moving_tiny_mces');
                    }
                }
            },

            onEnd: function (e) {
                let snfwis = document.querySelectorAll('.snfwi');
                if(snfwis){
                    for (let s = 0; s < snfwis.length; s++) {
                        snfwis[s].classList.remove('sn_moving_tiny_mces');
                    }
                }
                sn_topics.topicChanged();
                setTimeout(() => {
                    console.log('target is sorted...');
                }, 1500);
            },
        });

        let fieldSource = document.getElementById('fieldSource');
        if(fieldSource){

            Sortable.create(fieldSource, {
                draggable: ".snfw",
                sort: false,
                group: {
                    name: "fields",
                    pull: 'clone',
                    put: false,
                    ghostClass: 'dragging',
                    animation: 150,
                },
                onMove: function (e) {},
                onClone: function (e) {},
                onEnd: function (e) {
                    if((e.item.dataset.type === 'richtext') && e.to.classList.contains('metas')) {
                        e.item.remove();
                        return false;
                    }
                    else {
                        sn_topics.initDroppedField(e.item);
                        setTimeout(() => {
                            console.log('target is sorted...');
                        }, 500);
                    }

                },
            });

        }

    },

    'initDroppedField': (field) => {
        let type = field.dataset.type;
        let new_field_id = Math.random().toString(20).substring(2, 15);
        // field.querySelector('.n').innerText = 'untitled-field';
        field.querySelector('.snfwi').id = 'untitled-field-' + new_field_id;
        if(type === 'richtext'){
            field.querySelector('.editor.richtext').id = 't_' + document.body.dataset.topic_id + '_' + new_field_id;
        }
        sn_helpers.initContentEditables();
        sn_topics.listenDestroyContentOrMetaField();
        sn_media.initMediaManager();
        sn_topics.topicChanged();

    },

    'urlerize': (e) => {
        let topicURLInput= document.getElementById('topicURL');
        if(topicURLInput){
            let url_prefix;
            document.body.dataset.url_prefix.length > 0 ? url_prefix = document.body.dataset.url_prefix + '/' : url_prefix = '';
            topicURLInput.value = url_prefix + sn_helpers.urlify(document.getElementById('topicTitle').innerText);
            sn_topics.validateTopicURL(e);
        }
    },

    'listenURLerize': (e) => {
        let pageTitle = document.getElementById('topicTitle');
        if(pageTitle){
            pageTitle.removeEventListener('input', sn_topics.urlerize, null);
            pageTitle.addEventListener('input', sn_topics.urlerize, null);
        }
    },

    'goToURL': (e) => {
        window.open('/' + document.getElementById('topicURL').value, "_blank");
    },

    'listentGoToURL': (e) => {
        let goToURLButton = document.getElementById('gotourl');
        if(goToURLButton){
            goToURLButton.removeEventListener('click', sn_topics.goToURL, null);
            goToURLButton.addEventListener('click', sn_topics.goToURL, null);
        }
    },

    'destroyContentOrMetaField': (e) => {
        let target = e.target.closest('.snfw');
        if(target.classList.contains('warn')){
            target.remove();
            sn_topics.topicChanged();
        }
        else {
            target.classList.add('warn');
            target.addEventListener('mouseleave', function(b) {
                target.classList.remove('warn');
            });
        }
    },

    'listenDestroyContentOrMetaField': (e) => {
        let destroyContentOrMetaFields = document.querySelectorAll('.settings div:last-child i.x');
        if(destroyContentOrMetaFields){
            for (let b = 0; b < destroyContentOrMetaFields.length; b++) {
                destroyContentOrMetaFields[b].removeEventListener('click', sn_topics.destroyContentOrMetaField, null);
                destroyContentOrMetaFields[b].addEventListener('click', sn_topics.destroyContentOrMetaField, null);
            }
        }
    },

    'listenTopicChanges': () => {
        let updateInputs = document.querySelectorAll(".editor, .n, .aft, .sn_css, .sn_layout");
        if(updateInputs){
            for (let i = 0; i < updateInputs.length; i++) {
                updateInputs[i].removeEventListener('input', sn_topics.topicChanged);
                updateInputs[i].addEventListener('input', sn_topics.topicChanged, null);
            }
        }

        let fieldNameInputs = document.querySelectorAll("body#be-topic-edit select");
        if(fieldNameInputs){
            for (let i = 0; i < fieldNameInputs.length; i++) {
                fieldNameInputs[i].removeEventListener('change', sn_topics.topicChanged);
                fieldNameInputs[i].addEventListener('change', sn_topics.topicChanged, null);
            }
        }
    },

    'listenSaveTopic': () => {
        let topicSaveButton = document.querySelector("#editorFormW .snSaveButton");
        if(topicSaveButton){
            topicSaveButton.removeEventListener('click', sn_topics.saveTopic);
            topicSaveButton.addEventListener('click', sn_topics.saveTopic, null);
        }
    },

    'init': () => {
        sn_topics.listenTopicActions();
        sn_topics.listenTopicChanges();
        sn_topics.listenSaveTopic();
        sn_topics.listenDeleteTopic();
        sn_topics.listentGoToURL();

        sn_topics.listenDestroyContentOrMetaField();
        sn_topics.listenValidateTopicURL();
        sn_topics.toggleTopicMetaDataListener();

        if(sn_topics.topicContentAndMetaFieldSorts){
            for (let t = 0; t < sn_topics.topicContentAndMetaFieldSorts.length; t++) {
                sn_topics.initSortTopicContentOrMetaFields(sn_topics.topicContentAndMetaFieldSorts[t]);
            }
        }

    }

}

sn_topics.init();

document.body.dataset.topic_id ? sn_topics.activeTopic.id = document.body.dataset.topic_id : sn_topics.activeTopic.id = null
document.body.dataset.topic_status ? sn_topics.activeTopic.status = document.body.dataset.topic_status : sn_topics.activeTopic.status = null



/* ~~~~~~~~~~~~~~~~~~~~ topic updates ~~~~~~~~~~~~~~~~~~~~ */



if(typeof sn_topics !== "undefined"){
    if(sn_topics.topicTagsW) {
        let topicTagsInput = new TagsInput({
            selector: 'topicTagsInput',
            duplicate: false,
            max: 10
        });
        topicTagsInput.addData(sn_topics.topicTagsW.dataset.tags.split(','));
    }
}

/* ~~~~~~~~~~~~~~~~~~~~ init ~~~~~~~~~~~~~~~~~~~~ */






