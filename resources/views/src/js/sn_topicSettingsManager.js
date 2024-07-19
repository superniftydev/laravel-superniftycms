'use strict';

import '../bootstrap';
import Alpine from 'alpinejs';
import Isotope from 'isotope-layout';
import Sortable from 'sortablejs';


window.scrollTo(0,1)



window.sn_topic_settings_manager = {

    'topicID': document.getElementById('topicID') ? document.getElementById('topicID') : null,
    'topicTitle': document.getElementById('topicTitle') ? document.getElementById('topicTitle') : null,
    'secondaryTopicID': document.getElementById('secondaryTopicID') ? document.getElementById('secondaryTopicID') : null,
    'topicDO': document.getElementById('topicDO') ? document.getElementById('topicDO') : null,
    'topicURL': document.getElementById('topicURL') ? document.getElementById('topicURL') : null,
    'topicURLPreview': document.getElementById('topicURLPreview') ? document.getElementById('topicURLPreview') : null,
    'newTopicToggleButtons': document.querySelectorAll('.newTopicToggleButton') ? document.querySelectorAll('.newTopicToggleButton') : null,
    'newTopicToggleOW': document.querySelector('#newTopicToggleOW') ? document.querySelector('#newTopicToggleOW') : null,
    'topicSettingsForm': document.getElementById("topicSettingsForm") ? document.getElementById("topicSettingsForm") : null,
    'topicSettingsFormW': document.querySelector('#topicSettingsFormW') ? document.querySelector('#topicSettingsFormW') : null,
    'updateTopicSettingsButton': document.querySelector('#updateTopicSettingsButton') ? document.querySelector('#updateTopicSettingsButton') : null,
    'topicParentOW': document.querySelector('#topicParentOW') ? document.querySelector('#topicParentOW') : null,
    'targetTopicW': document.querySelector('#targetTopicW') ? document.querySelector('#targetTopicW') : null,
    'topicTextInputs': document.querySelectorAll("#targetTopicW input[type='text']") ? document.querySelectorAll("#targetTopicW input[type='text']") : null,
    'topicFunctionalityRadios': document.querySelectorAll("#topicFunctionalityRadios input[type='radio']") ? document.querySelectorAll("#topicFunctionalityRadios input[type='radio']") : null,
    'topicSelectedFunctionality': document.querySelector("#topicFunctionalityRadios input[type='radio'][name='functionality']:checked") ? document.querySelector("#topicFunctionalityRadios input[type='radio'][name='functionality']:checked") : null,
    'topicIndexDisplay': document.querySelector("#topicIndexDisplay ul") ? document.querySelector("#topicIndexDisplay ul") : null,
    'secondaryTopicW': document.querySelector('#secondaryTopicW') ? document.querySelector('#secondaryTopicW') : null,
    'secondaryFieldSettings': document.querySelector('#secondaryFieldSettings') ? document.querySelector('#secondaryFieldSettings') : null,
    'topicSettingsFieldTemplates': document.querySelector('#topicSettingsFieldTemplates') ? document.querySelector('#topicSettingsFieldTemplates') : null,
    'warnDestroyTopicButtons': document.querySelectorAll(".toggleWarnDestroyTopic") ? document.querySelectorAll(".toggleWarnDestroyTopic") : null,
    'cancelDestroyTopicButton': document.getElementById("cancelDestroyTopic") ? document.getElementById("cancelDestroyTopic") : null,
    'actuallyDestroyTopicButton': document.getElementById("actuallyDestroyTopic") ? document.getElementById("actuallyDestroyTopic") : null,
    'topicContentAndMetaSortsW': document.querySelectorAll('.contentandmetas .sort') ? document.querySelectorAll('.contentandmetas .sort') : null,

    'topicSettingsActionButtons': document.querySelectorAll('body#be.topic.settings .topicActions [data-a]') ? document.querySelectorAll('body#be-topic-settings .topicActions [data-a]') : null,

    'validateTopicSettingsForm' : (e) => {

        console.log('validateTopicSettingsForm foozy1');

        document.body.setAttribute('data-form_changed', 'y');

        if(sn_topic_settings_manager.topicURL){
            sn_topic_settings_manager.topicURL.value = sn_helpers.slugify(sn_topic_settings_manager.topicURL.value);
        }

        if(document.body.dataset.do.includes('_parent')){
            console.log('you are parenting');

            let selectedFunctionality = document.querySelector("#topicFunctionalityRadios input[type='radio'][name='functionality']:checked");
            if(selectedFunctionality){
                document.body.setAttribute('data-topic_functionality', selectedFunctionality.value);
                console.log('functionality is selected');

            }

            if(
                sn_topic_settings_manager.topicURL &&
                sn_topic_settings_manager.topicURL.value.length > 0
            ){
                console.log('topicURL is good');

                sn_helpers.postData(
                    '/admin/topic/validatetopicurl',
                        'post',
                        {
                            'id': sn_topic_settings_manager.topicID.value,
                            'slug': sn_topic_settings_manager.topicURL.value
                        })
                    .then(response => {
                        console.log('confirmUniqueTopicSlug response foozy3: ', response);
                        sn_topic_settings_manager.topicSettingsForm.dataset.slug = response.result;
                        if(
                            sn_topic_settings_manager.topicSettingsForm.dataset.slug === 'stet' ||
                            sn_topic_settings_manager.topicSettingsForm.dataset.slug === 'ok'
                        ){
                            sn_topic_settings_manager.topicSettingsForm.setAttribute('data-valid_slug', 'y');
                        }
                        else {
                            sn_topic_settings_manager.topicSettingsForm.removeAttribute('data-valid_slug');
                        }

                        if(sn_topic_settings_manager.topicSettingsForm.hasAttribute('data-valid_slug')) {
                            document.body.setAttribute('data-sn_topic_settings_form_valid', 'y');
                        }
                        else {
                            document.body.removeAttribute('data-sn_topic_settings_form_valid');
                        }

                    })
                    .catch((error) => { console.error('!!! --> updateTopicManagerModalFormValue error:', error); });
            }
            else {
                sn_topic_settings_manager.topicSettingsForm.dataset.slug = 'empty';
            }
        }


        else {
            document.body.setAttribute('data-sn_topic_settings_form_valid', 'y');
        }




    },


    'populateTopicIndexDisplay': () =>{

        /* if creating a new parent topic, need to confirm that all non-media child fields are represented in the topic index for selection and sorting */
        /* also need to make a companion function for deletion of a field */

        let current_field_elements = sn_topic_settings_manager.secondaryTopicW.querySelectorAll("#secondaryFieldSettings .content.sort div[data-field]:not([data-type='media']) [data-s='name']");
        let current_field_names = [];
        if(current_field_elements){
            for (let i = 0; i < current_field_elements.length; i++) {
                current_field_names.push(current_field_elements[i].innerText);
            }
        }

        let current_index_elements = sn_topic_settings_manager.topicIndexDisplay.querySelectorAll("li");
        let current_index_names = [];
        if(current_index_elements){
            for (let i = 0; i < current_index_elements.length; i++) {
                current_index_names.push(current_index_elements[i].dataset.field);
            }
        }

        console.log('current_field_elements: ', current_field_elements);
        console.log('current_field_names: ', current_field_names);
        console.log('current_index_elements: ', current_index_elements);
        console.log('current_index_names: ', current_index_names);

        for (let f = 0; f < current_field_names.length; f++) {
            if(!current_index_names.includes(current_field_names[f])){
                let li = document.createElement('li');
                li.setAttribute('data-field', current_field_names[f]);
                let i = document.createElement('i');
                li.appendChild(i);
                let span = document.createElement('span');
                span.textContent = current_field_names[f];
                li.appendChild(span);
                sn_topic_settings_manager.topicIndexDisplay.appendChild(li);
            }
        }
    },

    'listenPopulateTopicIndexDisplay': () => {
        let current_field_elements = sn_topic_settings_manager.secondaryTopicW.querySelectorAll("#secondaryFieldSettings .content.sort div[data-field]:not([data-type='media']) [data-s='name']");
        if(current_field_elements){
            for (let i = 0; i < current_field_elements.length; i++) {

                console.log('listening....');
                current_field_elements[i].removeEventListener('blur', sn_topic_settings_manager.populateTopicIndexDisplay);
                current_field_elements[i].addEventListener('blur', sn_topic_settings_manager.populateTopicIndexDisplay);

            }
        }
    },

    'listenTopicSettingsChange': () => {
        if(sn_topic_settings_manager.topicSettingsForm){

            if(sn_topic_settings_manager.topicURL){
                sn_topic_settings_manager.topicURL.removeEventListener('keyup', sn_topic_settings_manager.validateTopicSettingsForm, null);
                sn_topic_settings_manager.topicURL.addEventListener('keyup', sn_topic_settings_manager.validateTopicSettingsForm, null);
            }

            sn_topic_settings_manager.topicSettingsForm.removeEventListener('change', sn_topic_settings_manager.validateTopicSettingsForm, null);
            sn_topic_settings_manager.topicSettingsForm.addEventListener('change', sn_topic_settings_manager.validateTopicSettingsForm, null);

            for (let t = 0; t < sn_topic_settings_manager.topicTextInputs.length; t++) {
                sn_topic_settings_manager.topicTextInputs[t].removeEventListener('keyup', sn_topic_settings_manager.validateTopicSettingsForm, null);
                sn_topic_settings_manager.topicTextInputs[t].addEventListener('keyup', sn_topic_settings_manager.validateTopicSettingsForm, null);
            }

            let topicTextCES = document.querySelectorAll("#targetTopicW [contenteditable]") ? document.querySelectorAll("#targetTopicW [contenteditable]") : null;
            if(topicTextCES){
                for (let ce = 0; ce < topicTextCES.length; ce++) {
                    topicTextCES[ce].removeEventListener('keyup', sn_topic_settings_manager.validateTopicSettingsForm, null);
                    topicTextCES[ce].addEventListener('keyup', sn_topic_settings_manager.validateTopicSettingsForm, null);
                }
            }
        }
    },


    'initSortTopicOrMetaFields':  (target) => {
        Sortable.create(target, {
            draggable: "[data-field]",
            onEnd: function (e) {
                sn_topic_settings_manager.validateTopicSettingsForm(e);
                console.log('topicOrMetaFields just sorted. now save it.');
                setTimeout(() => {
                    console.log('target is sorted...');
                }, 1500);
            },
        });
    },

    'initSortTopicIndexDisplay':  (target) => {
        Sortable.create(target, {
            draggable: "li",
            onEnd: function (e) {
                sn_topic_settings_manager.validateTopicSettingsForm(e);
                console.log('initSortTopicIndexDisplay just sorted.');
                setTimeout(() => {
                    console.log('initSortTopicIndexDisplay is sorted...');
                }, 1500);
            },
        });
    },

    'listenTopicFunctionalityChange': () => {
        if(sn_topic_settings_manager.topicFunctionalityRadios){
            for (let r = 0; r < sn_topic_settings_manager.topicFunctionalityRadios.length; r++) {
                sn_topic_settings_manager.topicFunctionalityRadios[r].removeEventListener('change', sn_topic_settings_manager.validateTopicSettingsForm, null);
                sn_topic_settings_manager.topicFunctionalityRadios[r].addEventListener('change', sn_topic_settings_manager.validateTopicSettingsForm, null);
            }
        }
    },

    'getContentOrMetaFieldData': (w) => {
        let data = {};
        let fields = {};
        let sorts = [];
        let fm = w.querySelectorAll("[data-field]");
        if(fm){
            for (let i = 0; i < fm.length; i++) {
                let field = {};
                let nameElement = fm[i].querySelector("[contenteditable]:nth-child(1)");
                if(nameElement.innerText.length > 0 || nameElement.dataset.cv.length > 0) {
                    if(nameElement.dataset.cv.length === 0) { field['old_name'] = 'old_name_was_empty'; }
                    else { field['old_name'] = nameElement.dataset.cv; }
                    if(nameElement.innerText.length === 0) {
                        field['new_name'] = 'untitled_field_' + (i + 1);
                        nameElement.classList.add('empty');
                    }
                    else {
                        field['new_name'] = nameElement.innerText;
                        nameElement.classList.remove('empty');
                    }
                    field['type'] = fm[i].dataset.type;
                    let attributeElement = fm[i].querySelector("[contenteditable]:nth-child(2)");
                    let attributeName = attributeElement.dataset.s;
                    field[attributeName] = attributeElement.innerText;
                    fields[field['new_name']] = field;
                    sorts.push(field['new_name']);
                }
            }
        }
        data['fields'] = fields;
        data['sorts'] = sorts;
        return data;
    },

    'toggleTopicIndexDisplayActive': (e) => {
        console.log('toggleTopicIndexDisplayActive worked...');

        e.target.closest('li').toggleAttribute('data-active');
        sn_topic_settings_manager.validateTopicSettingsForm(e);
    },

    'listenTopicIndexDisplayActives': () => {
        if(sn_topic_settings_manager.topicIndexDisplay){
            let lisi = sn_topic_settings_manager.topicIndexDisplay.querySelectorAll("li i");
            if(lisi){
                for (let i = 0; i < lisi.length; i++) {
                    lisi[i].removeEventListener('click', sn_topic_settings_manager.toggleTopicIndexDisplayActive, null);
                    lisi[i].addEventListener('click', sn_topic_settings_manager.toggleTopicIndexDisplayActive, null);
                }
            }
        }
    },

    'getTopicIndexDisplay': () => {
        let data = {};
        let active = [];
        let sort = [];
        if(sn_topic_settings_manager.topicIndexDisplay){
            let lis = sn_topic_settings_manager.topicIndexDisplay.querySelectorAll("li");
            if(lis){
                for (let i = 0; i < lis.length; i++) {
                    if(lis[i].dataset.field.replace(/[0-9]/g, '').length > 0){
                        if(lis[i].hasAttribute('data-active') ){
                            active.push(lis[i].dataset.field);
                        }
                        sort.push(lis[i].dataset.field);
                    }
                }
            }

            data['active'] = active;
            data['sn_fso'] = sort;
            return data;
        }
    },

    'updateTopicSettings': (destroyedField = false) => {

        /* core data */
        let data = {
            'topic_id': sn_topic_settings_manager.topicID.value,
            'title':  sn_topic_settings_manager.topicTitle ? sn_topic_settings_manager.topicTitle.value : null,
            'secondary_topic_id': sn_topic_settings_manager.secondaryTopicID ? sn_topic_settings_manager.secondaryTopicID.value : null,
            'slug': sn_topic_settings_manager.topicURL ? sn_topic_settings_manager.topicURL.value : null,
            'do': sn_topic_settings_manager.topicDO.value,
        };

        /* topic settings view */
        if(sn_topic_settings_manager.targetTopicW){

            /* basics */
            if(document.getElementById('topicSingularLabel')) { data['l'] = document.getElementById('topicSingularLabel').value; }
            if(document.getElementById('topicPluralLabel')) { data['p'] = document.getElementById('topicPluralLabel').value; }
            if(document.getElementById('topicDescription')) { data['d'] = document.getElementById('topicDescription').value; }
            if(document.getElementById('topicFunctionalityRadios')) {
                data['functionality'] = document.querySelector('input[type="radio"][name="functionality"]:checked').value;
            }

            /* target topic field data */
            let field_data = sn_topic_settings_manager.getContentOrMetaFieldData(sn_topic_settings_manager.targetTopicW.querySelector('.content.sort'));
            let meta_data = sn_topic_settings_manager.getContentOrMetaFieldData(sn_topic_settings_manager.targetTopicW.querySelector('.metas.sort'));
            data['fields'] = field_data.fields;
            data['fields_sort'] = field_data.sorts;
            data['metas'] = meta_data.fields;
            data['metas_sort'] = meta_data.sorts;

            /* if creating a new parent topic, we are also setting the initial child fields */
            if(document.body.dataset.do === 'edit_topic_settings_parent_new' && sn_topic_settings_manager.secondaryFieldSettings){

                let child_field_data = sn_topic_settings_manager.getContentOrMetaFieldData(sn_topic_settings_manager.secondaryTopicW.querySelector('.content.sort'));
                let child_meta_data = sn_topic_settings_manager.getContentOrMetaFieldData(sn_topic_settings_manager.secondaryTopicW.querySelector('.metas.sort'));
                data['child_fields'] = child_field_data.fields;
                data['child_fields_sort'] = child_field_data.sorts;
                data['child_metas'] = child_meta_data.fields;
                data['child_metas_sort'] = child_meta_data.sorts;

            }

        }

        data['indexdisplay'] = sn_topic_settings_manager.getTopicIndexDisplay();

        if(document.getElementById('topicFunctionality')){ data['functionality'] = document.getElementById('topicFunctionality').value; }

        if(!Object.is(destroyedField, null)){ data['destroyedField'] = destroyedField; }
        console.log('updateTopicSettings data being sent to the server: ', data);

        sn_helpers.postData('/admin/topic/settings/save', 'post', data)
            .then(response => {
                document.body.classList.add('updated');
                document.body.removeAttribute('data-form_changed');
                document.body.removeAttribute('data-sn_topic_settings_form_valid');
                sn_topic_settings_manager.topicSettingsForm.removeAttribute('data-valid_slug');
                sn_topic_settings_manager.topicSettingsForm.removeAttribute('data-slug');
                console.log('updateTopicSettings server response: ', response);
                if(response.child_topic_id && response.child_topic_id.length > 5) {
                    sn_topic_settings_manager.secondaryTopicID.value = response.child_topic_id;
                }
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);
        })
        .catch((error) => { console.error('!!! --> updateTopicSettings error:', error); });

    },

    'listenUpdateTopicSettingsButton': () => {
        if(sn_topic_settings_manager.updateTopicSettingsButton){
            sn_topic_settings_manager.updateTopicSettingsButton.removeEventListener('click', sn_topic_settings_manager.updateTopicSettings, null);
            sn_topic_settings_manager.updateTopicSettingsButton.addEventListener('click', sn_topic_settings_manager.updateTopicSettings, null);
        }
    }

}


/* ~~~~~~~~~~~~~~~~~~~~ init ~~~~~~~~~~~~~~~~~~~~
document.onreadystatechange = function() {
    if(document.readyState === "complete") {
        sn_topic_settings_manager.listenToggleWarnDestroyTopic();
        sn_topic_settings_manager.listenTopicFunctionalityChange();
        sn_topic_settings_manager.listenDestroyContentOrMetaField();
        sn_topic_settings_manager.listenTopicSettingsChange();
        sn_topic_settings_manager.listenUpdateTopicSettingsButton();

        if(document.body.dataset.do && document.body.dataset.do === 'edit_topic_settings_parent_new'){
            sn_topic_settings_manager.listenPopulateTopicIndexDisplay();
        }

        if(sn_topic_settings_manager.topicIndexDisplay){
            sn_topic_settings_manager.initSortTopicIndexDisplay(sn_topic_settings_manager.topicIndexDisplay);
            sn_topic_settings_manager.listenTopicIndexDisplayActives();
        }

        if(sn_topic_settings_manager.topicContentAndMetaSortsW){
            for (let t = 0; t < sn_topic_settings_manager.topicContentAndMetaSortsW.length; t++) {
                sn_topic_settings_manager.initSortTopicOrMetaFields(sn_topic_settings_manager.topicContentAndMetaSortsW[t]);
            }
        }
    }
};

 */

