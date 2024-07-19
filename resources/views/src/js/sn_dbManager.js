import Dropzone from "dropzone";


window.sn_db = {

    'dbTabs': document.querySelectorAll('#dbManager .tabs li') ? document.querySelectorAll('#dbManager .tabs li') : null,
    'dbPanes': document.querySelectorAll('#dbManager .panes li') ? document.querySelectorAll('#dbManager .pane') : null,

    'toggleDBTab': (e) => {
        if(sn_db.dbTabs && sn_db.dbPanes){
            for (let i = 0; i < sn_db.dbTabs.length; i++) {
                sn_db.dbTabs[i].classList.remove('active');
            }
            for (let i = 0; i < sn_db.dbPanes.length; i++) {
                sn_db.dbPanes[i].classList.remove('active');
            }
        }
        document.querySelector("#dbManager .tabs li[data-table=" + e.target.dataset.table + "]").classList.add('active');
        document.querySelector("#dbManager .pane[data-table=" + e.target.dataset.table + "]").classList.add('active');
    },

    'listenToggleDBTab': () => {
        if(sn_db.dbTabs){
            for (let i = 0; i < sn_db.dbTabs.length; i++) {
                sn_db.dbTabs[i].removeEventListener('click', sn_db.toggleDBTab, null);
                sn_db.dbTabs[i].addEventListener('click', sn_db.toggleDBTab, null);
            }
        }
    },


    'createSpreadsheetTopic': () => {

        sn_helpers.postData('/admin/topic/' + sn_topics.activeTopic.parent_slug + '/db/new/ajax', 'post', {})
        .then(function (data) {
            let row = document.querySelector('#spreadsheetTopicTemplate tr.child').cloneNode(true);
            row.dataset.topic_id = data.child.id;

            row.querySelector("td[data-name='id']").innerText = data.child.id;
            row.querySelector("td[data-name='created_at']").innerText = data.child.created_at;
            row.querySelector("td[data-name='updated_at']").innerText = data.child.updated_at;
            row.querySelector("td[data-name='last_updated_by']").innerText = data.child.last_updated_by;

            document.querySelector('.spreadsheet.children tbody').prepend(row);

            document.getElementById('noSpreadsheetChildren') ? document.getElementById('noSpreadsheetChildren').classList.remove('active') : null;
            setTimeout(() => {
                /* ------ initTopicTools(); ------- */
                document.querySelector(".spreadsheet.children tr[data-topic_id='" + data.child.id + "']").classList.remove('new');
            }, 2000);
        })
        .catch((error) => { console.error('!!! --> assignMediaToTopic error:', error); });

    },

    'createSpreadsheetTopicListener': () => {
        let createSpreadsheetTopicButton = document.getElementById("newSpreadsheetTopicButton");
        if(createSpreadsheetTopicButton){
            createSpreadsheetTopicButton.removeEventListener('click', sn_db.createSpreadsheetTopic, null);
            createSpreadsheetTopicButton.addEventListener('click', sn_db.createSpreadsheetTopic, null);
        }
    },

    'deleteSpreadsheetTopic': (e) => {
        let topicW = e.target.closest("[data-topic_id]");
        let topic_id = topicW.dataset.topic_id;
        topicW.remove();
        sn_helpers.postData('/admin/topic/destroy/' + topic_id + '/ajax', 'delete', {})
            .then(data => {
                if(!document.querySelectorAll(".spreadsheet.children tr.child").length > 0){
                    document.getElementById('noSpreadsheetChildren').classList.add('active');
                }
            })
            .catch((error) => { console.error('!!! --> deleteSpreadsheetTopic error:', error); });
    },

    'deleteSpreadsheetTopicListener': () => {
        let deleteSpreadsheetRowButtons = document.querySelectorAll(".spreadsheet.children td.x");
        if(deleteSpreadsheetRowButtons){
            for (let i = 0; i < deleteSpreadsheetRowButtons.length; i++) {
                deleteSpreadsheetRowButtons[i].removeEventListener('click', sn_db.deleteSpreadsheetTopic, null);
                deleteSpreadsheetRowButtons[i].addEventListener('click', sn_db.deleteSpreadsheetTopic, null);
            }
        }
    },

    "preventDefaults": (e) => {
        e.preventDefault();
        e.stopPropagation();
    },

    "highlight": (e) => {
        e.target.classList.add('dragover');
    },

    "unhighlight": (e) => {
        e.target.classList.remove('dragover');
    },

    'initCSVUpload': () => {

        let dz = document.getElementById('csvDropzone');
        if(dz){

            let csvDataRows = document.querySelectorAll('#csvDataRows tr');
            let topicData = document.getElementById('topicData');
            let finalizeCSVImport = document.getElementById('finalizeCSVImport');

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
                dz.addEventListener(e, sn_db.preventDefaults, false);
                document.body.addEventListener(e, sn_db.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(e => {
                dz.addEventListener(e, sn_db.highlight, false);
            });

            ['dragleave', 'drop'].forEach(e => {
                dz.addEventListener(e, sn_db.unhighlight, false);
            });

            dz.addEventListener('drop', (e) => {
                document.getElementById('csv_file').files = e.dataTransfer.files;
                e.target.submit();
                console.log('dropped');
                e.preventDefault()
            });

            if(finalizeCSVImport){

                finalizeCSVImport.addEventListener('click', (e) => {
                    e.preventDefault();
                    if(csvDataRows){
                        let rows = [];
                        for (let r = 0; r < csvDataRows.length; r++) {
                            let fields = csvDataRows[r].querySelectorAll('td[contenteditable]');
                            if (fields) {
                                let data = {};
                                for (let i = 0; i < fields.length; i++) {
                                    data[fields[i].dataset.name] = fields[i].innerText;
                                }
                                rows.push(data);
                            }
                        }
                        console.log(rows);
                        topicData.value = JSON.stringify(rows);
                    }
                    dz.submit();
                });

            }

        }

    }

}


/* init db tools */
const initDBTools = () => {
    sn_db.listenToggleDBTab();
    sn_db.initCSVUpload();
    // sn_db.listenPrettifyJson();
    // sn_db.createSpreadsheetTopicListener();
    // sn_db.deleteSpreadsheetTopicListener();
}
initDBTools();


/*
'prettifyJson' : (e) => {
    e.target.classList.add('font-mono');
    e.target.innerText = JSON.stringify(e.target.innerText, null, 2);
},

'listenPrettifyJson' : () => {
    let jsonFields = document.querySelectorAll("[data-name=content]");
    if(jsonFields){
        for (let i = 0; i < jsonFields.length; i++) {
            jsonFields[i].removeEventListener('focus', sn_db.prettifyJson, null);
            jsonFields[i].addEventListener('focus', sn_db.prettifyJson, null);
        }
    }
},

*/

// var str = JSON.stringify(obj, null, 2); // spacing level = 2
