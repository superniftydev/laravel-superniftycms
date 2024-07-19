'use strict';

/* todo: add error checking linter - https://discuss.codemirror.net/t/showing-syntax-errors/3111/5 */
/* todo: automatic language detection: https://codemirror.net/examples/config/ */
/* todo: https://discuss.codemirror.net/t/cm6-linting-and-error-notifications-highlighting/3425/6 */












import Sortable from "sortablejs";




import { keymap, EditorView, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor, rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState, Compartment} from "@codemirror/state";
import { language, defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { linter, lintKeymap, lintGutter } from "@codemirror/lint";
import { ayuLight, tomorrow, dracula } from 'thememirror';

import { javascript, esLint } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { markdown } from "@codemirror/lang-markdown";
import { css } from "@codemirror/lang-css";
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html";



import { parser as htmlParser } from "@lezer/html"
import { parser as jsParser } from "@lezer/javascript"

import {parseMixed} from "@lezer/common"
import {LRLanguage, foldNodeProp, foldInside, indentNodeProp} from "@codemirror/language"

const tabSize = new Compartment;



const languageConf = new Compartment
const autoLanguage = EditorState.transactionExtender.of(tr => {
    if(sn_files.activeCMFile.id.includes('-js')){
        return {
            effects: languageConf.reconfigure(javascript())
        }
    }

    if(sn_files.activeCMFile.id.includes('-php')){
        return {
            effects: languageConf.reconfigure(php())
        }
    }

    if(sn_files.activeCMFile.id.includes('css')){
        return {
            effects: languageConf.reconfigure(css())
        }
    }


});


let sn_ideStartState = (type = 'js') => {
    if(type === 'php') { type = php(); }
    if(type === 'css' || type === 'pcss') { type = css(); }
    // if(type === 'html') { type = html(); }
    if(type === 'js') { type = javascript(); }
    let state = EditorState.create({
        doc: '',
        parent: document.body,
        extensions: [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            languageConf.of(php()),
            autoLanguage,
            // php(),
            // css(),
            // json(),
            // html(),
            // javascript(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            tabSize.of(EditorState.tabSize.of(8)),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            /* lintGutter, */
            /* linterExtension, */
            lintGutter(),
            tomorrow,
            highlightSelectionMatches(),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap,
                indentWithTab,
            ]),
            EditorView.updateListener.of(function(e) {
                sn_files.updatedCMFileValue = e.state.doc.toString();
                // sn_helpers.debounce(sn_files.saveCodeMirrorValue, 2000);


            }),
            EditorView.domEventHandlers({
                keyup(e, view) {
                    sn_files.highlightChangedCodeMirrors();
                },
            })

        ]
    });

    console.log(state);

    // state.extensions = state.extensions.push(type);
    return state;

}

window.sn_files = {

    /* file tree */

    "mediaDeleteLI": document.querySelector("#sn_contextMenus ul#sn_CMDZMedia li.delete"),
    "mediaDuplicateLI": document.querySelector("#sn_contextMenus ul#sn_CMDZMedia li.duplicate"),
    "mediaMediaIDLI": document.querySelector("#sn_contextMenus ul#sn_CMDZMedia li.copy-media-id"),
    "mediaToggleSelectionLI": document.querySelector("#sn_contextMenus ul#sn_CMDZMedia li.add-to-topic-field"), /* deprecate */

    "editorFilesW": document.querySelector('#filesW'),
    "editorFiles": document.querySelectorAll("#filesW li i[data-cm='file']"),
    "editorDirectories": null,

    "environmentFilesW": document.querySelector('#environmentFilesW'),
    "storageFilesW": document.querySelector('#storageFilesW'),

    "editorDirectoriesAndFiles": document.querySelectorAll('#filesW ul'),
    "editorDirectoriesAndFilesSortables": {},
    "targetDestinationPath": false,
    "targetDirectoryOrFilePath": false,

    "uploadProgress": [],
    "progressBar": document.getElementById('progressBar'),

    'openfiles':  () => {
        let openFiles = document.getElementById('openFiles');
        if(openFiles && openFiles.innerText.length > 0){
            return JSON.parse(openFiles.innerText);
        }
        return null;
    },

    /* codemirror editor */

    'saveCodeMirrorValueButton': document.getElementById('saveCodeMirrorValueButton'),


    "editorTabs": document.querySelector('#editorW ul.tabs'),
    "editorPanesW": document.querySelector('#editorW ul.panes'),
    "editorViews": {}, /* CodeMirror Objects */
    "activeCMFile": {
        "id": null,
        "path": null,
        "value": null,
    },
    "updatedCMFileValue": null,

    "initEditorDirectoriesActions": () => {
        if(sn_files.editorDirectories) {

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
                for (let d = 0; d < sn_files.editorDirectories.length; d++) {
                    sn_files.editorDirectories[d].addEventListener(e, sn_files.preventDefaults, false);
                }
                document.body.addEventListener(e, sn_files.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(e => {
                for (let d = 0; d < sn_files.editorDirectories.length; d++) {
                    sn_files.editorDirectories[d].addEventListener(e, sn_files.highlight, false);
                }
            });

            ['dragleave', 'drop'].forEach(e => {
                for (let d = 0; d < sn_files.editorDirectories.length; d++) {
                    sn_files.editorDirectories[d].addEventListener(e, sn_files.unhighlight, false);
                }
            });

            for (let d = 0; d < sn_files.editorDirectories.length; d++) {
                sn_files.editorDirectories[d].addEventListener('drop', sn_files.handleDrop, false);
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

    "handleDrop": (e) => {
        let destinationTarget;
        e.target.dataset.type === 'directory' ? destinationTarget = e.target : destinationTarget = e.target.closest("[data-type='directory']");
        sn_files.targetDestinationPath = destinationTarget.dataset.path.replace('/..', '');

        let files = [];
        if (e.dataTransfer.items) {

            /* try DataTransferItemList interface to access the file(s) */
            [...e.dataTransfer.items].forEach((item, i) => {

                /* if dropped item is a file, add to files */
                if (item.kind === "file") {
                    let file = item.getAsFile();
                    files.push(file);
                    console.log(`… file[${i}].name = ${file.name}`);
                }
            });
        } else {

            /* or use DataTransfer interface to access the file(s) */
            [...e.dataTransfer.files].forEach((file, i) => {
                files.push(file);
                console.log(`… file[${i}].name = ${file.name}`);
            });
        }
        sn_files.handleFiles(files);
    },

    "initializeProgress": (numFiles) => {
        sn_files.progressBar.style.width = "0";
        sn_files.uploadProgress = [];
        for(let i = numFiles; i > 0; i--) {
            sn_files.uploadProgress.push(0);
        }
    },

    "updateProgress": (fileNumber, percent) => {
        sn_files.uploadProgress[fileNumber] = percent;
        sn_files.progressBar.style.width = sn_files.uploadProgress.reduce((tot, curr) => tot + curr, 0) / sn_files.uploadProgress.length + '%';
    },

    "handleFiles": (files) => {
        files = [...files];
        sn_files.initializeProgress(files.length);
        files.forEach(sn_files.uploadFile);
        files.forEach(sn_files.previewFile);
    },

    "previewFile": (file) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
            // console.log('reader.result: ', reader.result);
        }
    },

    "uploadFile": (file, i) => {
        let url = '/admin/code/files/upload';
        let xhr = new XMLHttpRequest();
        let formData = new FormData();
        xhr.open('post', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('X-CSRF-TOKEN', sn_helpers.csrfToken);
        xhr.responseType = 'json';

        xhr.upload.addEventListener("progress", function(e) {
            sn_files.updateProgress(i, (e.loaded * 100.0 / e.total) || 100);
        });

        xhr.addEventListener('readystatechange', function() {

            // working
            if (xhr.readyState === 4 && xhr.status === 200) {
                sn_files.updateProgress(i, 100);
            }

            // complete
            else if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 400)) {
                console.log('upload complete...');
            }

            // error
            else {
                console.log('upload error: ', xhr);
            }

        });

        xhr.upload.addEventListener("load", function() {
            setTimeout(() => {
                sn_files.progressBar.style.opacity = "0";
                setTimeout(() => {
                    sn_files.progressBar.style.width = "0%";
                    sn_files.progressBar.style.opacity = "1";
                }, 1000);
            }, 2500);
        });

        xhr.onload = function() {
            if (this.status === 200) {
                console.log('response', this.response);
                sn_files.resetFilereset(this.response);
            }
        };

        formData.append('path', sn_files.targetDestinationPath);
        formData.append('file', file);
        xhr.send(formData);
    },

    "initFileRename":  () => {

        console.log('initFileRename: ', sn_helpers.contextMenuTarget);


        /*
        <li data-name="ass.log" data-cm="file" data-type="file" class="active"><i data-name="ass.log" data-type="file" data-path="logs/ass.log" id="file-logs-ass-log" data-extension="log" data-size="12" data-last_modified="1718037670" data-target_file_id="logs-ass-log" data-parent_path="logs" class="active">ass.log</i></li>
<li class="tab CodeMirror cm-s-nord ͼ3k code active" data-target_file_id="logs-ass-log" data-target_file_path="logs/ass.log" id="tab-logs-ass-log"><i></i>ass.log</li>
<li class="pane CodeMirror cm-s-nord ͼ3k code active" data-target_file_id="logs-ass-log" id="pane-logs-ass-log"><div class="cm-editor ͼ1 ͼ2 ͼ4 ͼ5k"><div class="cm-announced" aria-live="polite"></div><div tabindex="-1" class="cm-scroller"><div class="cm-gutters" aria-hidden="true" style="min-height: 26.1875px; position: sticky;"><div class="cm-gutter cm-lineNumbers"><div class="cm-gutterElement" style="height: 0px; visibility: hidden; pointer-events: none;">9</div><div class="cm-gutterElement cm-activeLineGutter" style="height: 18.1875px; margin-top: 4px;">1</div></div><div class="cm-gutter cm-foldGutter"><div class="cm-gutterElement" style="height: 0px; visibility: hidden; pointer-events: none;"><span title="Unfold line">›</span></div><div class="cm-gutterElement cm-activeLineGutter" style="height: 18.1875px; margin-top: 4px;"></div></div><div class="cm-gutter cm-gutter-lint"><div class="cm-gutterElement cm-activeLineGutter" style="height: 18.1875px; margin-top: 4px;"></div></div></div><div style="tab-size: 8;" spellcheck="false" autocorrect="off" autocapitalize="off" translate="no" contenteditable="true" class="cm-content" role="textbox" aria-multiline="true" aria-autocomplete="list" data-language="php"><div class="cm-activeLine cm-line">this is ass.</div></div><div class="cm-layer cm-layer-above cm-cursorLayer" aria-hidden="true" style="z-index: 150; animation-duration: 1200ms; animation-name: cm-blink;"><div class="cm-cursor cm-cursor-primary" style="left: 148.938px; top: 5px; height: 15px;"></div></div><div class="cm-layer cm-selectionLayer" aria-hidden="true" style="z-index: -2;"><div class="cm-selectionBackground" style="left: 141.094px; top: 4.99px; width: 7.84375px; height: 15.01px;"></div></div></div></div></li>


         */

        let target = sn_helpers.contextMenuTarget.closest("li").querySelector('[data-name]');
        if(target){

            let targetID = target.id;
            let openTab = document.getElementById(targetID.replace('file-', 'tab-'));
            let openPane = document.getElementById(targetID.replace('file-', 'pane-'));
            if(openTab) openTab.remove();
            if(openPane) openPane.remove();
            sn_files.setOpenFiles();

            console.log('renaming : ', target);
            target.dataset.cv = target.textContent;
            target.setAttribute('contenteditable', true);
            target.focus();
            sn_helpers.closeContextMenu();

            /* select all */
            let range, selection;
            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(target);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(target);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            /* disable special characters and blur on enter */
            target.addEventListener('keydown',function(e) {
                if (!/[0-9a-zA-Z\-_.]/i.test(e.key)) { e.preventDefault(); }
                if (e.keyCode === 13) {
                    target.blur();
                    return false;
                }
            }, true);

            /* save any changes */
            target.removeEventListener('blur', sn_files.saveRenamedFile);
            target.addEventListener('blur', sn_files.saveRenamedFile);
            console.log('target again: ', target);

        }

    },


    /* save renamed file */
    "saveRenamedFile": (e) => {
        e.target.removeAttribute('contenteditable');
        e.target.closest('li').classList.remove('rename');
        if(e.target.dataset.cv !== e.target.innerText){
            let data = {
                'original_entity_path': e.target.closest('i').dataset.path,
                'new_entity_name' : e.target.innerText,
            };
            sn_helpers.postData('/admin/code/files/rename', 'post', data)
                .then(data => {
                    document.body.classList.add('updated');
                    document.getElementById('environmentFilesData').innerText = data.environment_files;
                    document.getElementById('openFiles').innerText = data.open_files;
                    sn_files.initTree();
                    sn_files.reopenFiles(); /* this was causing an error */
                    setTimeout(() => {
                        document.body.classList.remove('updated');
                    }, 2000);
                })
                .catch((error) => { console.error('!!! --> sn_files.initFileRename error:', error); });
        }
    },

    /* create directory or file */
    "createDirectoryOrFile": (e) => {
        let type = e.target.dataset.cm;
        let new_entity_name = sn_helpers.contextMenu.querySelector(".new[data-cm='" + type + "'] i").innerText;
        sn_helpers.contextMenu.querySelector(".new[data-cm='" + type + "'] i").blur();
        if(new_entity_name.length > 0){
            let parent_path = sn_helpers.contextMenuTarget.dataset.parent_path;
            console.log('!!! --> sn_helpers.contextMenuTarget: ', sn_helpers.contextMenuTarget);
            console.log('!!! --> type: ', type);
            console.log('!!! --> parent_path: ', parent_path);
            console.log('!!! --> df_name: ', new_entity_name);
            sn_helpers.closeContextMenu();
            let contextMenu = document.getElementById('sn_CMFiles');
            contextMenu.querySelector("li.new[data-cm='file']").classList.remove('active');
            contextMenu.querySelector("li.new[data-cm='directory']").classList.remove('active');
            contextMenu.querySelector('li.new i').innerText = '';

            let data = {
                'type': type,
                'parent_path': parent_path,
                'new_name' : new_entity_name,
            };
            sn_helpers.postData('/admin/code/files/create', 'post', data)
                .then(data => {
                    document.body.classList.add('updated');
                    document.getElementById('environmentFilesData').innerText = data.environment_files;
                    document.getElementById('openFiles').innerText = data.open_files;
                    sn_files.initTree();
                    sn_files.reopenFiles(); /* this was causing an error */

                    setTimeout(() => {
                        document.body.classList.remove('updated');
                    }, 2000);

                })
                .catch((error) => { console.error('!!! --> sn_files.createDirectoryOrFile error:', error); });
        }
        else {
            /* temp fix - once checking for duplicates, this will need to display an error message  */
            /* temp fix - also, there will need to be a way to cancel  */
            sn_helpers.closeContextMenu();
        }

    },

    /* init create directory or file */
    "initCreateDirectoryOrFile": (type) => {
        let nameEntry = sn_helpers.contextMenu.querySelector(".new[data-cm='" + type + "'] i");
        nameEntry.setAttribute('contenteditable', true);
        nameEntry.dataset.cm = type;
        nameEntry.focus();

        /* disable special characters and blur on enter */
        nameEntry.addEventListener('keydown',function(e) {
            if (!/[0-9a-zA-Z\-_.]/i.test(e.key)) { e.preventDefault(); }
            if (e.keyCode === 13) {
                nameEntry.blur();
                return false;
            }
        }, true);

        /* now save to server */
        nameEntry.removeEventListener('blur', sn_files.createDirectoryOrFile);
        nameEntry.addEventListener('blur', sn_files.createDirectoryOrFile);

    },

    /* deprecated
    "resetFileTree": (data) => {

        let actives = [];
        let current_actives = sn_files.environmentFilesW.querySelectorAll('li.active');
        let targetW = sn_files.environmentFilesW;

        for(let ca = 0; ca < current_actives.length; ca++) {
            actives.push(current_actives[ca].id);
        }
        targetW.innerHTML = data.html;
        for(let a = 0; a < actives.length; a++) {
            if(!Object.is(document.getElementById(actives[a]), null)){
                document.getElementById(actives[a]).classList.add('active');
            }
        }
        let targetFiles = targetW.querySelectorAll("ul li[data-type='file'] i");
        for (let f = 0; f < targetFiles.length; f++) {
            targetFiles[f].removeEventListener('click', sn_files.fileTreeActions, null);
            targetFiles[f].addEventListener('click', sn_files.fileTreeActions, null);
        }

        sn_files.editorDirectories = targetW.querySelectorAll("ul li[data-type='directory'] i");
        sn_files.editorDirectoriesAndFiles = targetW.querySelectorAll('ul li i');

        sn_files.initMoveDirectoryOrFile();
        sn_files.initEditorDirectoriesActions();

    },  */

    /* duplicate directory or file */
    "duplicateDirectoryOrFile": () => {
        let new_entity_name = sn_helpers.contextMenu.querySelector(".duplicate i").innerText;
        let data = {
            'original_entity_path': sn_helpers.contextMenuTarget.dataset.path,
            'new_entity_name' : new_entity_name,
        };
        sn_helpers.postData('/admin/code/files/duplicate', 'post', data)
            .then(data => {
                document.body.classList.add('updated');
                document.getElementById('environmentFilesData').innerText = data.environment_files;
                document.getElementById('openFiles').innerText = data.open_files;
                sn_files.initTree();
                sn_files.reopenFiles(); /* this was causing an error */
                sn_helpers.closeContextMenu();
                let contextMenu = document.getElementById('sn_CMFiles');
                contextMenu.querySelector('li.duplicate').classList.remove('active');
                contextMenu.querySelector('li.duplicate i[contenteditable]').innerText = '';
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);

            })
            .catch((error) => { console.error('!!! --> sn_files.duplicateDirectoryOrFile error:', error); });

    },

    /*

    "duplicateDirectoryOrFileLI": (sn_helpers.contextMenuTarget, new_entity_name) => {
        let path = sn_helpers.contextMenuTarget.dataset.path.replace('..', '') +  new_entity_name;
        let new_li = document.createElement('li');
        new_li.setAttribute('id', sn_helpers.contextMenuTarget.dataset.cm + '-' + sn_helpers.slugify(path));
        new_li.setAttribute('data-cm', sn_helpers.contextMenuTarget.dataset.cm);
        new_li.setAttribute('data-level', (parseInt(sn_helpers.contextMenuTarget.dataset.level) + 1).toString());
        new_li.setAttribute('data-type', sn_helpers.contextMenuTarget.dataset.type);
        new_li.setAttribute('data-name', new_entity_name);
        new_li.setAttribute('data-extension', new_entity_name.split('.').pop());
        new_li.setAttribute('data-size', '128');
        new_li.setAttribute('data-last_modified', Math.floor(Date.now() / 1000).toString());
        new_li.setAttribute('data-path', path);
        new_li.setAttribute('data-parent_path', sn_helpers.contextMenuTarget.dataset.path);
        new_li.classList.add(sn_helpers.contextMenuTarget.dataset.cm);

        let div =  document.createElement('div');
        div.classList.add('filename');
        div.classList.add(sn_helpers.contextMenuTarget.dataset.cm);
        div.textContent = new_entity_name;
        new_li.appendChild(div);

        let new_li_name = new_entity_name.charAt(0).toLowerCase() + new_entity_name.substring(1).toLowerCase();

        let childrenContainer;
        if(sn_helpers.contextMenuTarget.dataset.cm === 'directory'){ childrenContainer = sn_helpers.contextMenuTarget.querySelector('.df'); }
        else { childrenContainer = sn_helpers.contextMenuTarget.closest('.directory').querySelector('.df'); }

        let list = childrenContainer.querySelectorAll(":scope > li");
        if(list.length > 0){
            let i = 0;
            let inserted = false;
            while (i < list.length && !inserted) {
                console.log('--> list[' + i + ']:' +  list[i].innerText + ' | new_li_name: ' + new_li_name);
                if(list[i].innerText < new_li_name) { i++; }
                else { childrenContainer.insertBefore(new_li, list[i]); inserted = true; }
            }
            if(!inserted) {
                childrenContainer.appendChild(new_li);
            }
        }
        else {
            childrenContainer.appendChild(new_li);
        }

        sn_closeContextMenu();
        sn_fileActionsListener();

    },

    */

    /* init duplicate directory or file */
    "initDuplicateDirectoryOrFile": (type) => {
        console.log('duplicating type: ', type);
        let textEntry = sn_helpers.contextMenu.querySelector(".duplicate i");

        textEntry.setAttribute('contenteditable', true);
        textEntry.focus();

        /* disable special characters and blur on enter */
        textEntry.addEventListener('keydown',function(e) {
            if (!/[0-9a-zA-Z\-_.]/i.test(e.key)) { e.preventDefault(); }
            if (e.keyCode === 13) {
                textEntry.blur();
                return false;
            }
        }, true);

        /* now tell the server */
        textEntry.removeEventListener('blur', sn_files.duplicateDirectoryOrFile);
        textEntry.addEventListener('blur', sn_files.duplicateDirectoryOrFile);
        console.log('new_entity_name again: ', textEntry.innerText);

    },

    /* delete directory or file */
    "deleteDirectoryOrFile": (target) => {
        console.log('!!! --> target to be deleted: ', target);
        let data = {
            'type': target.dataset.cm,
            'path' : target.dataset.path,
        };
        sn_helpers.postData('/admin/code/files/destroy', 'post', data)
            .then(data => {
                console.log('!!! ::::::: --> sn_files.deleteDirectoryOrFile target: ', target);

                if(target.dataset.cm === 'file'){
                    let core_id = target.id.replace('file-', '');
                    sn_files.destroyCodeMirrorTabFromFileList('tab-' + core_id); /* this will exist soon... */
                }

                target.remove();
                console.log('!!! --> sn_files.postData response @ sn_files.deleteDirectoryOrFile: ', data);
            })
            .catch((error) => { console.error('!!! --> sn_files.deleteDirectoryOrFile error:', error); });
        console.log('!!! --> sn_files.postData @ sn_files.deleteDirectoryOrFile ran...');

    },

    "downloadSomething": (target) => {
        console.log('!!!!!!!!!!!!!!!!!! --> sn_files.downloadSomething target: ', target);
        if(target.dataset.cm === 'file' || target.dataset.cm === 'directory'){
            window.location = '/admin/code/files/download?path=' + target.dataset.path;
        }

    },

    "fileTreeActions": (e) => {

        console.log('fileTreeActions target: ', e.target);

        e.stopPropagation();
        if(typeof e.target.dataset.name !== "undefined"){
            console.log('tapped: ', e.target);

            if(e.target.dataset.type === 'directory'){
                e.target.closest('li').classList.toggle('active');
                /* e.target.querySelector('div.directory').classList.toggle('active'); */
            }
            else {
                if(!document.getElementById('pane-' + e.target.dataset.target_file_id)){
                    console.log('this is the target: ', e.target);
                    sn_files.getFileContent(e.target); /* later */
                }
                else {
                    sn_files.changeCodeMirrorTab(e.target); /* later */
                }

            }

        }

    },

    "fileActionsListener": () => {

        if(!Object.is(sn_files.editorFiles, null)){
            // console.log('fileActionsListener: ', sn_files.editorFiles);
            for (let f = 0; f < sn_files.editorFiles.length; f++) {
                /* general file actions */
                sn_files.editorFiles[f].removeEventListener('click', sn_files.fileTreeActions, null);
                sn_files.editorFiles[f].addEventListener('click', sn_files.fileTreeActions, null);
            }
        }

        if(!Object.is(sn_files.editorDirectories, null)){
            for (let f = 0; f < sn_files.editorDirectories.length; f++) {
                /* general file actions */
                sn_files.editorDirectories[f].removeEventListener('click', sn_files.fileTreeActions, null);
                sn_files.editorDirectories[f].addEventListener('click', sn_files.fileTreeActions, null);
            }
        }
    },


    /* move directory or file */
    "moveDirectoryOrFile": (e) => {
        sn_files.targetDirectoryOrFilePath = e.item.dataset.path;
        let targetID = e.item.id;
        console.log('targetDirectoryOrFilePath: ', sn_files.targetDirectoryOrFilePath); /* dragged element */
        console.log('targetDestinationPath: ', sn_files.targetDestinationPath); /* dragged element's destination */
        console.log('targetID: ', targetID); /* dragged element's id */

        /* if the file has an open tab, destroy it because the path is going to change */

        // tab-environments-prod-20231020135215-readme-txt
        // targetDirectoryOrFilePath: environments/PROD-20231020135215/readme.txt
        // targetDestinationPath: environments/PROD-20231020135215/config
        // targetID: file-environments-prod-20231020135215-config-readme-txt

        if(targetID.includes('file-')){
            let openTab = document.getElementById(targetID.replace('file-', 'tab-'));
            let movedFileNewID = '';
            let movedFileName = sn_files.targetDirectoryOrFilePath.split('/').pop();
            movedFileNewID = sn_helpers.slugify('file-' + sn_files.targetDestinationPath + '-' + movedFileName);
            console.log('slugified targetDestinationPath: ', sn_helpers.slugify(sn_files.targetDestinationPath)); /* dragged element's id */
            console.log('movedFileNewID: ', movedFileNewID); /* dragged element's id */

            if(openTab){
                console.log('openTab: ', openTab);
                sn_files.destroyCodeMirrorTab(openTab);
            }

            let data = {
                'original_entity_path': sn_files.targetDirectoryOrFilePath,
                'destination_parent_path' : sn_files.targetDestinationPath,
            };

            sn_helpers.postData('/admin/code/files/move', 'post', data)
                .then(data => {
                    console.log('!!! --> sn_files.postData response @ sn_files.moveDirectoryOrFile: ', data);
                    // document.body.classList.add('updated');
                    sn_files.resetFileTree(data);
                    if(openTab && movedFileNewID.length > 1){
                        let newFileTarget = document.getElementById(movedFileNewID); /* todo: confirm this fix (now sending entire element instead of just path) worked */
                        sn_files.getFileContent(newFileTarget);
                    }
                    setTimeout(() => {
                        sn_files.initMoveDirectoryOrFile();
                    }, 2000);
                })
                .catch((error) => { console.error('!!! --> sn_files.moveDirectoryOrFile error:', error); });
            console.log('!!! --> sn_files.postData @ sn_files.moveDirectoryOrFile ran...');
        }

    },

    /* init move directory or file */
    "initMoveDirectoryOrFile": () => {
        if(sn_files.editorDirectoriesAndFiles){
            sn_files.editorDirectoriesAndFilesSortables = {};
            for (let df = 0; df < sn_files.editorDirectoriesAndFiles.length; df++) {
                sn_files.editorDirectoriesAndFilesSortables[df] = Sortable.create(sn_files.editorDirectoriesAndFiles[df], {
                    draggable: '.move',
                    direction: 'vertical',
                    filter: "[data-locked='y']",
                    onEnd: function (e) {
                        sn_files.moveDirectoryOrFile(e);
                        setTimeout(() => {
                            console.log('!!! --> something sorted + half a second');
                        }, 500);
                    },
                });
            }
        }
    },
















    /* ~~~~~~~~~~~~~~~~~~ codemirror editor ~~~~~~~~~~~~~~~~~~ */

    "initEditorTabs": () => {
        let openEditorTabs = document.querySelectorAll('#editorW .tabs .tab');
        if(openEditorTabs){
            // console.log('openEditorTabs', openEditorTabs);
            for (let t = 0; t < openEditorTabs.length; t++) {
                openEditorTabs[t].addEventListener('click', sn_files.changeCodeMirrorTab, null);
                let x = openEditorTabs[t].querySelector('i');
                x.addEventListener('click', sn_files.destroyCodeMirrorTabFromTabX, null);
            }
        }
    },

    'setOpenFiles' : (sendactive = false) => {
        let openfiles = [];
        let opentabs = document.querySelectorAll('.tab');
        if(opentabs.length > 0){
            for (let t = 0; t < opentabs.length; t++) {
                openfiles.push(opentabs[t].id.replace('tab-', 'file-'));
            }
        }
        let data = {
            'site_id': sn_helpers.site_id,
            'environment_id': sn_helpers.environment_id,
            'openfiles': openfiles,
            'setactivefile': sendactive ? 'file-' + sn_files.activeCMFile.id : 'no'
        };
        sn_helpers.postData('/admin/uup', 'post', data)
            .then(data => {
                console.log('!!! --> update user preferences response: ', data);
            })
            .catch((error) => { console.error('!!! --> update user preferences response:', error); });
    },

    'reopenFiles': () => {
        let openfiles = sn_files.openfiles();

        console.log('openfiles: ', openfiles);

        if(!Object.is(openfiles, null) && !Object.is(openfiles.ids, null)) {
            try {
                if(openfiles.ids.length > 0){

                    for (const rememberedFileID of openfiles.ids) {
                        sn_files.getFileContent(document.getElementById(rememberedFileID));
                    }

                    setTimeout(() => {
                        for (const rememberedFileID of openfiles.ids) {
                            let file = document.getElementById(rememberedFileID);
                            file.classList.add('active');
                            let i = 0;
                            while (i < 20) {
                                let parent = file.parentNode;
                                if(parent !== document.body){
                                    parent.classList.add('active');
                                    file = parent;
                                }
                                i++;
                            }

                        }
                        sn_files.changeCodeMirrorTab(document.getElementById(sn_files.openfiles.active));
                    }, 500);

                }

            } catch (e) { console.log('!!! --> createMediaPreviewElementDZ error: ', e); }
        }

    },


    /* create codemirror editor tab */
    "createCodeMirrorTab": (target, content) => {

        // console.log('createCodeMirrorTab target: ', target);

        sn_files.activeCMFile.id = target.dataset.target_file_id;
        sn_files.activeCMFile.path = target.dataset.path;
        sn_files.activeCMFile.value = content;
        // console.log('target:::: ', target);
        // console.log('tab created:::: ', sn_files.activeCMFile);

        const editorTab = document.createElement("li");
        const editorTabX = document.createElement("i");
        editorTab.className = "tab CodeMirror cm-s-nord ͼ3k active code";
        editorTab.setAttribute('data-target_file_id', target.dataset.target_file_id);
        editorTab.setAttribute('data-target_file_path', target.dataset.path);
        editorTab.id = 'tab-' + target.dataset.target_file_id;
        editorTab.appendChild(editorTabX);
        editorTab.appendChild(document.createTextNode(target.dataset.name));

        sn_files.editorTabs.appendChild(editorTab);
        // let targetTab = document.querySelector('#editorW .tabs #tab-' + file_id);

        const editorPane = document.createElement("li");
        editorPane.className = "pane CodeMirror cm-s-nord ͼ3k active code";
        editorPane.setAttribute('data-target_file_id', target.dataset.target_file_id);
        editorPane.id = 'pane-' + target.dataset.target_file_id;
        sn_files.editorPanesW.appendChild(editorPane);
        let targetPane = document.querySelector('#editorW .panes #pane-' + target.dataset.target_file_id);

        sn_files.editorViews[target.dataset.target_file_id] = new EditorView({
            state: sn_ideStartState('php'),
            parent: targetPane
        });

        sn_files.setCodeMirrorTabContent(sn_files.editorViews[target.dataset.target_file_id], content);
        // console.log('sn_files.editorViews: ', sn_files.editorViews);

        sn_files.setOpenFiles();

    },

    "changeCodeMirrorTab": (target) => {

        document.body.removeAttribute('data-code_editor_status');


        if(!Object.is(target, undefined) && !Object.is(target, null)){

            if(target.target) { target = target.target; }

            // console.log('target ------ ', target);

            sn_files.activeCMFile.id = target.dataset.target_file_id;
            console.log('sn_files.activeCMFile.id: ', sn_files.activeCMFile.id);
            sn_files.activeCMFile.path = target.dataset.target_file_path;
            if(sn_files.editorViews[target.dataset.target_file_id]){
                sn_files.activeCMFile.value = sn_files.editorViews[target.dataset.target_file_id].state.doc.toString();
                // console.log('activeCMFile value: ', sn_files.activeCMFile.value);
            }

            let requested_file = document.querySelector('#filesW #file-' + target.dataset.target_file_id);
            let requested_tab = document.querySelector('#editorW .tabs #tab-' + target.dataset.target_file_id);
            let requested_pane = document.querySelector('#editorW .panes #pane-' + target.dataset.target_file_id);
            let openEditorFiles = sn_files.editorFilesW.querySelectorAll("li i[cm='file']");
            let openEditorTabs = document.querySelectorAll('#editorW .tabs .tab');
            if(openEditorFiles){
                for (let x = 0; x < openEditorFiles.length; x++) {
                    openEditorFiles[x].classList.remove('active');
                }
            }
            if(openEditorTabs){
                // console.log('openEditorTabs', openEditorTabs);
                for (let x = 0; x < openEditorTabs.length; x++) {
                    openEditorTabs[x].classList.remove('active');
                }
            }
            let openEditorPanes = document.querySelectorAll('#editorW .panes .pane');
            if(openEditorPanes){
                for (let x = 0; x < openEditorPanes.length; x++) {
                    openEditorPanes[x].classList.remove('active');
                }
            }

            if(requested_tab && requested_pane){
                console.log('again: ', requested_file);
                requested_file.classList.add('active');
                requested_tab.classList.add('active');
                requested_pane.classList.add('active');
                sn_files.setOpenFiles('sendactive');
                return true;
            }

            return false;

        }

    },

    "destroyCodeMirrorTab": (destroyedTab) => {

        document.body.removeAttribute('data-code_editor_status');

        console.log('destroyedTab: ', destroyedTab);

        if(!Object.is(destroyedTab, null)){

            let previousTab = destroyedTab.previousSibling;
            let nextTab = destroyedTab.nextSibling;
            let nextTabTarget = false;

            console.log('destroyedTab: ', destroyedTab);
            console.log('previousTab: ', previousTab);
            console.log('nextTab: ', nextTab);
            console.log('sn_files.activeCMFile: ', sn_files.activeCMFile);

            document.querySelector('#filesW #file-' + destroyedTab.dataset.target_file_id).classList.remove('active');
            if(destroyedTab.classList.contains('code')) { sn_files.editorViews[destroyedTab.dataset.target_file_id].destroy(); }
            document.querySelector('#tab-' + destroyedTab.dataset.target_file_id).remove();
            document.querySelector('#pane-' + destroyedTab.dataset.target_file_id).remove();

            sn_files.activeCMFile.id = null;
            if(previousTab){ sn_files.activeCMFile.id = previousTab.dataset.target_file_id;  nextTabTarget = previousTab; }
            else if(nextTab){ sn_files.activeCMFile.id = nextTab.dataset.target_file_id; nextTabTarget = nextTab; }
            if(sn_files.activeCMFile.id) {
                sn_files.changeCodeMirrorTab(nextTabTarget);
            }
            else {
                sn_files.activeCMFile.id = null;
                sn_files.activeCMFile.path = null;
                sn_files.activeCMFile.value = null;
                document.body.setAttribute('data-code_editor_status', 'no-file');
            }

            sn_files.setOpenFiles('sendactive');
            console.log('sn_files.destroyedTab.dataset.id: ', destroyedTab.dataset.target_file_id);
        }
    },

    "destroyCodeMirrorTabFromFileList": (id) => {
        console.log('!!!!!!!!!!--------> sn_files.destroyCodeMirrorTabFromFileList ID: ', id);
        sn_files.destroyCodeMirrorTab(document.getElementById(id));
    },

    "destroyCodeMirrorTabFromTabX": (e) => {
        e.stopPropagation();
        console.log('this is the close from the tab x');
        console.log('here is the e.target.closest(tab) bitch!: ', e.target.closest('.tab'));
        sn_files.destroyCodeMirrorTab(e.target.closest('.tab'));
    },

    "getFileContent": (target) => {

        console.log('!!!!!!!!!!-----> getFileContent -> target: ', target);

        document.body.removeAttribute('data-code_editor_status');

        if(typeof target !== "undefined"){

            // console.log('file_path: ', target.dataset.path);
            let code = ['php', 'html', 'js', 'json', 'css', 'pcss', 'txt', 'log'];
            let img = ['png', 'jpg', 'jpeg', 'gif', 'heic', 'svg'];
            let ext = target.dataset.path.split('.').pop();
            // console.log('ext: ', ext);
            // console.log('ext: ', ext.toLowerCase());

            if(sn_files.changeCodeMirrorTab(target)){ return true; }
            let data = { 'file_path': target.dataset.path };
            if(code.includes(ext.toLowerCase())){

                sn_helpers.postData('/admin/code/files/get', 'post', data)
                    .then(data => {
                        // console.log('!!! --> sn_files.postData response @ sn_files.getFileContent: ', data);
                        sn_files.createCodeMirrorTab(target, data.file_contents);
                        // console.log('target:', target);
                        sn_files.changeCodeMirrorTab(target);
                        sn_files.initEditorTabs();
                    })
                    .catch((error) => { console.error('!!! --> sn_files.getFileContent error:', error); });
            }

            else if(img.includes(ext.toLowerCase())){
                sn_helpers.postData('/admin/code/files/get', 'post', data)
                    .then(data => {
                        // console.log('!!! --> sn_files.postData response @ sn_files.getFileContent: ', data);
                        sn_files.createImageTab(target, data.file_contents);
                        sn_files.initEditorTabs();
                    })
                    .catch((error) => { console.error('!!! --> sn_files.getFileContent error:', error); });
                sn_files.initEditorTabs();
            }

            else {
                document.body.dataset.code_editor_status = 'cannot-open';
            }

            // console.log('!!! --> sn_files.postData @ sn_files.getFileContent ran...');

        }

        else {
            document.body.dataset.code_editor_status = 'cannot-open';
        }

    },

    "saveCodeMirrorValues": () => {
        let files_to_save = document.querySelectorAll('#filesW #environmentFilesW li i.changed');
        console.log('files_to_save: ', files_to_save);
        if(files_to_save.length > 0){
            for (let f = 0; f < files_to_save.length; f++) {
                sn_files.saveCodeMirrorValue(files_to_save[f].id);
            }
        }
    },

    /* set codemirror value */
    "saveCodeMirrorValue": (target_file_id) => {
        let file_to_be_saved = document.getElementById(target_file_id);
        let data = {
            'file_path': file_to_be_saved.dataset.path,
            'content': sn_files.editorViews[file_to_be_saved.id.replace('file-', '')].state.doc.toString()
        };
        console.log('data to be saved::::::: ', data);
        if(
            data['file_path'].length > 0
        ) {
            console.log('codemirror data being sent on update event: ', data);
            sn_helpers.postData('/admin/code/files/set', 'post', data)
                .then(data => {
                    document.body.classList.add('updated');

                    file_to_be_saved.classList.remove('changed');
                    document.getElementById(target_file_id.replace('file-', 'tab-')).classList.remove('changed');

                    setTimeout(() => {
                        document.body.removeAttribute('data-unsavedchanges');
                        document.getElementById(target_file_id.replace('file-', 'tab-')).classList.remove('changed');

                    }, 100);


                    setTimeout(() => {
                        document.body.classList.remove('updated');
                        document.body.removeAttribute('data-unsavedchanges');

                    }, 2000);


                    console.log('!!! --> sn_files.postData response @ sn_files.saveCodeMirrorValue: ', data);
                })
                .catch((error) => { console.error('!!! --> sn_files.saveCodeMirrorValue error:', error); });
            console.log('!!! --> sn_files.postData @ sn_files.saveCodeMirrorValue ran...');
        }
        else {
            console.log('!!! --> sn_files.postData @ sn_files.saveCodeMirrorValue did not run because either there were no changes or there was no active file...');
        }
        return true;
    },


    /*
    'listenCodeMirrorChanges' : () => {
        let editorPanes = document.querySelectorAll('#editorW ul.panes li.pane') ? document.querySelectorAll('#editorW ul.panes li.pane') : false;
        if(editorPanes){
            for (let ep = 0; ep < editorPanes.length; ep++) {
                editorPanes[ep].removeEventListener('keyup', sn_files.highlightChangedCodeMirrors);
                editorPanes[ep].addEventListener('keyup', sn_files.highlightChangedCodeMirrors);
            }
        }
    },

     */


    'highlightChangedCodeMirrors' : () => {
        document.body.setAttribute('data-unsavedchanges', 'y');
        let changed_tab = document.querySelector('ul.tabs li.tab.active');
        let changed_file = document.getElementById(changed_tab.id.replace('tab-', 'file-'));
        changed_tab.classList.add('changed');
        changed_file.classList.add('changed');
    },

    'listenSaveCodeMirrorValues' : () => {
        if(sn_files.saveCodeMirrorValueButton){
            sn_files.saveCodeMirrorValueButton.addEventListener('click', sn_files.saveCodeMirrorValues, false);
        }
    },

    /* replace codemirror editor selection */
    "replaceCodeMirrorSelection": (view) => {
        const transaction = view.state.replaceSelection('foobar');
        const update = view.state.update(transaction);
        view.update([update]);
    },

    /* set codemirror editor contents */
    "setCodeMirrorTabContent": (view, content) => {
        const transaction = {
            changes: {
                from: 0,
                to: view.state.doc.length,
                insert: content
            }
        };
        const update = view.state.update(transaction);
        view.update([update]);
    },

    /* create image tab */
    "createImageTab": (target, contents) => {

        console.log('target: ', target);

        const editorTab = document.createElement("li");

        let tabText = target.dataset.name;
        editorTab.appendChild(document.createTextNode(tabText));
        sn_files.editorTabs.appendChild(editorTab);

        const editorTabX = document.createElement("i");
        editorTab.className = "tab CodeMirror cm-s-nord ͼ3k active img bg-gray-900";
        editorTab.setAttribute('data-id', target.id);
        editorTab.setAttribute('data-target_file_id', target.dataset.target_file_id);
        editorTab.id = 'tab-' + target.id.replace('file-', '');
        editorTab.appendChild(editorTabX);


        const editorPane = document.createElement("li");
        editorPane.className = "pane CodeMirror cm-s-nord ͼ3k active img";
        editorPane.setAttribute('data-id', target.id);
        editorPane.id = 'pane-' + target.id.replace('file-', '');
        sn_files.editorPanesW.appendChild(editorPane);
        let targetPane = document.querySelector('#editorW .panes #pane-' + target.id.replace('file-', ''));

        // todo: consider exposing additional directories
        // https://supernifty.com/media/public/uploads/99c587bd-ef81-419a-8d54-31ddbffbaf43/2000.jpg (BAD)
        // https://supernifty.com/media/uploads/99c587bd-ef81-419a-8d54-31ddbffbaf43/2000.jpg (DEPRECATED)

        // data path : public/uploads/9aaa9615-d123-48e6-887c-26266b2e3065/thumbnail.png
        // https://supernifty.com/superniftycom/uploads/9aaa9398-6e28-4ea0-8ffa-37f93072f77d/1000.png (GOOD)

        let ext = target.dataset.path.split('.').pop();
        let img;
        if(ext === 'svg'){
            img = document.createElement('div');
            img.innerHTML = contents;
        }
        else {
            img = document.createElement('img');
            img.src = contents;
        }


        targetPane.appendChild(img);

        console.log('sn_files.editorViews: ', sn_files.editorViews);

    },

    'listenNPMAction': () => {
        let listenNPMActionButtons = document.querySelectorAll('#filesToolBar button[data-a]');
        if(listenNPMActionButtons) {
            for (let b = 0; b < listenNPMActionButtons.length; b++) {
                listenNPMActionButtons[b].removeEventListener('click', sn_files.npmAction, null);
                listenNPMActionButtons[b].addEventListener('click', sn_files.npmAction, null);
            }
        }
    },

    'npmAction': (action) => {

        if(action instanceof Event){
            action = action.target.dataset.a;
            if(action === 'dev'){
                if(!document.body.hasAttribute('data-npmrundev')) {
                    action = 'npm-run-dev';
                }
                else { action = 'npm-stop-dev'; }
            }
        }

        console.log('action: ', action);

        if(action === 'npm-run-dev'){

            document.body.setAttribute('data-npmrundev', 'y');

            /* enable pusher */
            let p = new Pusher(sn_globals.sn_pusher_key, { cluster: 'us2' });
            let c = p.subscribe('npm.' + sn_globals.sn_pusher_channel);
            console.log('subscribed to npm.' + sn_globals.sn_pusher_channel);

            /* vite watch started */
            c.bind('NPMWatching', function(data) {
                console.log('npm run dev process response: ', data);
            });

            /* vite process timed out */
            c.bind('NPMWatchingStopped', function(data) {
                console.log('npm run dev process response: ', data);
            });

        }

        else if(action === 'npm-stop-dev'){
            document.body.removeAttribute('data-npmrundev');
        }

        sn_helpers.postData('/admin/code/files/' + action, 'post', {})
            .then(data => {
                console.log('!!! --> sn_files.postData response @ sn_files.npmAction: ', data);
            })
            .catch((error) => { console.error('!!! --> sn_files.npmWatch error:', error); });
        console.log('!!! --> sn_files.postData @ sn_files.npmAction ran...');

    },


    'renderTree': (data, parentElement) => {
        const ul = document.createElement('ul');
        parentElement.appendChild(ul);
        data.forEach((item) => {
            const li = document.createElement('li');
            li.dataset.name = item.name;
            li.dataset.path = item.path;
            li.dataset.parent_path = item.parent_path;
            if(item.type === 'directory') {
                li.dataset.cm = 'directory'
                li.dataset.type = 'directory'
                li.dataset.drop = 'y'
            }
            else {
                li.dataset.cm = 'file';
                li.dataset.type = item.type;
            }
            if(
                item.name === 'parent'
            ){
                li.classList.add('active');
            }
            const i = document.createElement('i');
            i.textContent = item.name;
            i.dataset.name = item.name;
            i.dataset.type = item.type;
            i.dataset.path = item.path;
            i.dataset.parent_path = item.parent_path;
            i.dataset.last_modified = item.last_modified;
            if(item.type !== 'directory'){
                i.dataset.cm = 'file';
                i.id = 'file-' + item.target_file_id;
                i.dataset.extension = item.extension;
                i.dataset.size = item.size;
                i.dataset.target_file_id = item.target_file_id;
            }
            else {
                i.dataset.cm = 'directory';
                i.id = 'directory-' + item.target_directory_id;
            }
            li.appendChild(i);
            ul.appendChild(li);
            if (item.children && item.children.length > 0) {
                sn_files.renderTree(item.children, li);
            }

        });
    },

    'initTree': () => {
        const treeDataContainer = document.getElementById('environmentFilesData');
        const treeContainer = document.getElementById('environmentFilesW');
        if(treeDataContainer && treeContainer) {
            let treeData = JSON.parse(treeDataContainer.innerText);
            treeContainer.innerText = '';
            sn_files.renderTree([treeData], treeContainer);
            sn_files.editorDirectories = document.querySelectorAll("#filesW li[data-cm='directory'] i[data-cm='directory']");
            // console.log('DIRECTORIES: ', sn_files.editorDirectories);
            sn_files.editorFiles = document.querySelectorAll("#filesW li[data-cm='file'] i[data-cm='file']");
            // console.log('FILES: ', sn_files.editorFiles);
            sn_files.fileActionsListener();
        }
    },


}


const codeUnloadHandler = (e) => {

    // kill npm if it is running
    console.log('is npm dev running?');
    if(document.body.hasAttribute('data-npmrundev')) {
        console.log('yep. stopping it...');
        sn_files.npmAction('npm-stop-dev');
    }
    console.log('nope...');

    // are there unsaved changes?
    if(document.body.hasAttribute('data-unsavedchanges')) {
        e.preventDefault();
    }

};


window.addEventListener('load', function () {
    sn_files.initEditorDirectoriesActions();
    sn_files.initMoveDirectoryOrFile();
});


window.onkeyup = function (e) {
    if (e.code === 'Escape') {
        sn_helpers.closeContextMenu();
    }
}


if(sn_files.editorFiles){
    sn_files.fileActionsListener();
    sn_files.listenNPMAction();
    sn_files.listenSaveCodeMirrorValues();
    sn_files.initTree();
    sn_files.reopenFiles(); /* this was causing an error */
    window.addEventListener("beforeunload", codeUnloadHandler);

    // sn_files.duplicateDirectoryOrFileLI(a,b); /* possibly deprecated */
}


/* resizable div: https://jsfiddle.net/x9o7y561/

const getResizeableElement = () => { return document.getElementById("resizeable"); };
const getHandleElement = () => { return document.getElementById("handle"); };
const minPaneSize = 150;
const maxPaneSize = document.body.clientWidth * .5
getResizeableElement().style.setProperty('--max-width', `${maxPaneSize}px`);
getResizeableElement().style.setProperty('--min-width', `${minPaneSize}px`);



const setPaneWidth = (width) => {
    getResizeableElement().style
        .setProperty('--resizeable-width', `${width}px`);
};

const getPaneWidth = () => {
    const pxWidth = getComputedStyle(getResizeableElement())
        .getPropertyValue('--resizeable-width');
    return parseInt(pxWidth, 10);
};

const startDragging = (event) => {
    event.preventDefault();
    const host = getResizeableElement();
    const startingPaneWidth = getPaneWidth();
    const xOffset = event.pageX;

    const mouseDragHandler = (moveEvent) => {
        moveEvent.preventDefault();
        const primaryButtonPressed = moveEvent.buttons === 1;
        if (!primaryButtonPressed) {
            setPaneWidth(Math.min(Math.max(getPaneWidth(), minPaneSize), maxPaneSize));
            document.body.removeEventListener('pointermove', mouseDragHandler);
            return;
        }

        const paneOriginAdjustment = 'left' === 'right' ? 1 : -1;
        setPaneWidth((xOffset - moveEvent.pageX ) * paneOriginAdjustment + startingPaneWidth);
    };
    const remove = document.body.addEventListener('pointermove', mouseDragHandler);
};

getHandleElement().addEventListener('mousedown', startDragging);

/*

#resizeable {
  --resizeable-width: 300px;
  height: 100vh;
  width: var(--resizeable-width);
  min-width: var(--min-width);
  max-width: var(--max-width);
  background-color: grey;
}

#handle {
  float: right;
  height: 100%;
  width: 1px;
  background-color: blue;
  z-index: 1;
}

#handle::after {
  content: "";
  width: 9px;
  position: absolute;
  top: 0;
  bottom: 0;
  margin-left: -4px;
  background-color: transparent;
  cursor: ew-resize;
  z-index: 2;
}



body {
  margin: 0px;
}

* {
  box-sizing: border-box;
}





<div id="resizeable">
  <div id="handle"></div>
</div>




 */








