'use strict';


/* ~~~~~~~~~~~~~~~~~~~~~~~~ codemirror ~~~~~~~~~~~~~~~~~~~~~~~~ */
import {EditorState, Compartment} from "@codemirror/state"
import {htmlLanguage, html} from "@codemirror/lang-html"
import {language} from "@codemirror/language"
import {javascript} from "@codemirror/lang-javascript"

const languageConf = new Compartment

const autoLanguage = EditorState.transactionExtender.of(tr => {
    if (!tr.docChanged) return null
    let docIsHTML = /^\s*</.test(tr.newDoc.sliceString(0, 100))
    let stateIsHTML = tr.startState.facet(language) == htmlLanguage
    if (docIsHTML === stateIsHTML) return null
    return {
        effects: languageConf.reconfigure(docIsHTML ? html() : javascript())
    }
})
import {EditorView, basicSetup} from "codemirror";

window.sn_globals = {
    'language': document.querySelector('meta[name="language"]').content,
    'sn_pusher_key': document.querySelector('meta[name="sn_pusher_key"]').content,
    'sn_pusher_channel': document.querySelector('meta[name="sn_pusher_channel"]').content,
    'host': document.querySelector('meta[name="host"]').content,
    'app_url': document.querySelector('meta[name="app_url"]').content,
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~ codemirror ~~~~~~~~~~~~~~~~~~~~~~~~ */

window.sn_helpers = {

    'csrfToken': document.querySelector('meta[name="csrf-token"]').content,
    'site_id': document.querySelector('meta[name="site_id"]').content,
    'environment_id': document.querySelector('meta[name="environment_id"]').content,
    'domain': document.querySelector('meta[name="domain"]').content,
    'environment': document.querySelector('meta[name="environment"]').content,

    "openDDMenu": (e) => {
        e.target.closest('.sn_ddmenu').classList.add('active');
    },
    "closeDDMenu": (e) => {
        e.target.closest('.sn_ddmenu').classList.remove('active');
    },
    "listenDDMenus": () => {
        let sn_ddmenus = document.querySelectorAll(".sn_ddmenu");
        if (sn_ddmenus) {
            for (let m = 0; m < sn_ddmenus.length; m++) {
                sn_ddmenus[m].removeEventListener('mouseup', sn_helpers.openDDMenu);
                sn_ddmenus[m].addEventListener('mouseup', sn_helpers.openDDMenu, null);
            }
            for (let m = 0; m < sn_ddmenus.length; m++) {
                let ul = sn_ddmenus[m].querySelector('ul');
                if (ul) {
                    "click mouseleave".split(" ").forEach(function (e) {
                        ul.removeEventListener(e, sn_helpers.closeDDMenu);
                        ul.addEventListener(e, sn_helpers.closeDDMenu, null);
                    });
                }
            }
        }

    },

    'toggleAdminMenu': () => { document.body.toggleAttribute('data-snadminmenu'); },
    'listenToggleAdminMenu': () => {
        let adminMenuToggles = document.querySelectorAll('.adminMenuToggle');
        if(adminMenuToggles){
            for (let m = 0; m < adminMenuToggles.length; m++) {
                adminMenuToggles[m].addEventListener('click', sn_helpers.toggleAdminMenu, null);
            }
        }
    },


    'sn_globalLOF': document.getElementById('sn_globalLOF'),
    'logout': () => { sn_helpers.sn_globalLOF.submit(); },
    'listenLogout': () => {
        let globalLOB = document.getElementById('globalLOB');
        if(globalLOB){
            globalLOB.addEventListener('click', sn_helpers.logout, null);
        }
    },
    'contextMenu': false,
    'contextMenuTarget': false,

    "openContextMenu": (e, requestedContextMenu) => {

        console.log('sn_helpers.requestedContextMenu:::::', requestedContextMenu);


        sn_helpers.contextMenuTarget = e.target;

        /* files */
        if (requestedContextMenu === 'files') {

            sn_helpers.contextMenuTarget = e.target;
            sn_helpers.contextMenuTarget.classList.add('rclick');

            sn_helpers.contextMenu = document.querySelector("#sn_contextMenus ul#sn_CMFiles");
            console.log('sn_helpers.contextMenu:', sn_helpers.contextMenu);
            sn_helpers.contextMenu.setAttribute('data-locked', sn_helpers.contextMenuTarget.dataset.locked);
            sn_helpers.contextMenu.setAttribute('data-target_name', sn_helpers.contextMenuTarget.dataset.name);
            sn_helpers.contextMenu.setAttribute('data-target_type', sn_helpers.contextMenuTarget.dataset.type);

            if (sn_helpers.contextMenuTarget.closest("[data-parent_path]")) {
                sn_helpers.contextMenu.setAttribute('data-parent', sn_helpers.contextMenuTarget.closest("[data-parent_path]").dataset.parent_path);
            }


            /* * * * * * * * if the below causes a problem with files, perhaps reference data-type, not data-cm       * * * * * * * * *
             * * * * * * * * BUT remember that data-type will not be 'file' for files, it will be png, gif, css, etc. * * * * * * * * */
            // sn_helpers.contextMenu.setAttribute('data-cm', sn_helpers.contextMenuTarget.dataset.cm);


            /*
            if (
                sn_helpers.contextMenuTarget.dataset.type === 'directory' &&
                sn_helpers.contextMenuTarget.dataset.parent_path.includes('media/public/uploads/') &&
                sn_helpers.isGUID(sn_helpers.contextMenuTarget.dataset.name)
            ) {
                sn_helpers.contextMenu.setAttribute('data-media_id', sn_helpers.contextMenuTarget.dataset.name);
            }

             */

        }



        /* front end */
        else if (requestedContextMenu === 'fe') {
            sn_helpers.contextMenu = document.querySelector("#sn_contextMenus ul#sn_CMFe");
            sn_helpers.contextMenuTarget = e.target.closest("[data-sn*='field|']");
            sn_helpers.contextMenu.classList.add('active');
        }

        // media
        else if (requestedContextMenu === 'DZmedia') {
            sn_helpers.contextMenu = document.querySelector("#sn_contextMenus ul#sn_CMDZMedia");
            sn_helpers.contextMenu.setAttribute('data-media_id', sn_helpers.contextMenuTarget.closest("[data-media_id]").dataset.media_id);
            sn_media.setActiveMediaData(sn_helpers.contextMenuTarget);

            /* toggle media inclusion with topic - global media that has already been selected for a target */
            if (sn_helpers.contextMenuTarget.closest('.dz-preview.selected')) {
                sn_helpers.contextMenu.setAttribute('data-selected', 'y');
            }

        }

        // db
        else if (e.target.closest('#dbManager table tbody tr td')) {
            sn_helpers.contextMenu = document.querySelector("#sn_contextMenus ul#sn_CMDb");
        }

        sn_helpers.positionContextMenu(e, sn_helpers.contextMenu);
        sn_helpers.contextMenu.classList.add('active');

        // sn_helpers.contextMenuTarget.removeEventListener('mouseleave', sn_helpers.closeContextMenu, null);
        // sn_helpers.contextMenuTarget.addEventListener('mouseleave', sn_helpers.closeContextMenu, null);

    },

    /*
    <li class="directory" data-cm="directory" data-level="4" data-type="directory" data-name="9a62c5b2-c8bb-44d2-8e47-9e54e72c6527" data-extension="" data-size="128" data-last_modified="1697490143" data-path="media/public/uploads/9a62c5b2-c8bb-44d2-8e47-9e54e72c6527/.." data-parent_path="media/public/uploads/9a62c5b2-c8bb-44d2-8e47-9e54e72c6527"><div class="filename directory">9a62c5b2-c8bb-44d2-8e47-9e54e72c6527</div>
        <ul class="df">
           <li id="file-media-public-uploads-9a62c5b2-c8bb-44d2-8e47-9e54e72c6527-original-jpg" class="file" data-cm="file" data-level="5" data-type="jpg" data-name="original.jpg" data-extension="jpg" data-size="2616374" data-last_modified="1697490143" data-path="media/public/uploads/9a62c5b2-c8bb-44d2-8e47-9e54e72c6527/original.jpg" data-parent_path="media/public/uploads/9a62c5b2-c8bb-44d2-8e47-9e54e72c6527"><div class="filename jpg">original.jpg</div></li>
           <li id="file-media-public-uploads-9a62c5b2-c8bb-44d2-8e47-9e54e72c6527-thumbnail-jpg" class="file" data-cm="file" data-level="5" data-type="jpg" data-name="thumbnail.jpg" data-extension="jpg" data-size="27694" data-last_modified="1697490144" data-path="media/public/uploads/9a62c5b2-c8bb-44d2-8e47-9e54e72c6527/thumbnail.jpg" data-parent_path="media/public/uploads/9a62c5b2-c8bb-44d2-8e47-9e54e72c6527"><div class="filename jpg">thumbnail.jpg</div></li>
        </ul>
    </li>
    */



    "closeContextMenu": () => {

        if (sn_helpers.contextMenu) {

            sn_helpers.contextMenuTarget = false;
            sn_helpers.contextMenu.classList.remove('active', 'topic');
            sn_helpers.contextMenu.removeAttribute('data-selected');
            if (sn_helpers.contextMenu.querySelector('.delete')) {
                sn_helpers.contextMenu.querySelector('.delete').classList.remove('warn');
                let codeFiles = document.querySelectorAll('#environmentFilesW li');
                if(codeFiles){
                    for (let n = 0; n < codeFiles.length; n++) {
                        codeFiles[n].classList.remove('warn', 'duplicate');
                    }
                }

            }

            if (sn_helpers.contextMenu.querySelector('.delete-db-record')) {
                sn_helpers.contextMenu.querySelector('.delete-db-record').classList.remove('warn');
            }

            setTimeout(() => {
                sn_helpers.contextMenu.removeAttribute('data-media_id');
                sn_helpers.contextMenu.removeAttribute('style');
                sn_helpers.contextMenu.removeAttribute('data-locked');
                if (window.hasOwnProperty("sn_files") && !Object.is(sn_files.mediaDeleteLI, null)) {
                    sn_files.mediaDeleteLI.classList.remove('warn');
                }

                let news = sn_helpers.contextMenu.querySelectorAll('.new');
                for (let n = 0; n < news.length; n++) {
                    news[n].classList.remove('active');
                    news[n].querySelector('i').removeAttribute('contenteditable');
                    news[n].querySelector('i').innerText = '';
                }
                if (window.hasOwnProperty("sn_files") && !Object.is(sn_files.mediaDeleteLI, null)) {
                    sn_files.mediaDeleteLI.classList.remove('active', 'warn');
                }

                sn_helpers.contextMenu = false;


            }, 250);

        }

    },

    "getCursorPosition": (e) => {
        let x = 0;
        let y = 0;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else if (e.clientX || e.clientY) {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        return {x: x, y: y};
    },

    "positionContextMenu": (e, contextMenu) => {
        let clickCoords = sn_helpers.getCursorPosition(e);
        let clickCoordsX = clickCoords.x;
        let clickCoordsY = clickCoords.y;
        contextMenu.style.left = clickCoordsX + "px";
        contextMenu.style.top = clickCoordsY + "px";
    },

    'tinyMce': null,
    'tinyMces': {},
    'tinyMceTopicID': null,
    'tinyMceField': null,
    'tinyMceCurrent': null,
    'tinymceEditorFieldContent': '',

    'initContentEditable': (target) => {

        target.setAttribute('contenteditable', true);
        target.focus();

        target.removeEventListener('focus', sn_helpers.contenteditableFocus);
        target.addEventListener('focus', sn_helpers.contenteditableFocus);

        target.removeEventListener('keyup', sn_helpers.contenteditableKeyUp);
        target.addEventListener('keyup', sn_helpers.contenteditableKeyUp);

        target.removeEventListener('keydown', sn_helpers.contenteditableKeyDown);
        target.addEventListener('keydown', sn_helpers.contenteditableKeyDown); // save any changes

        target.removeEventListener('blur', sn_helpers.contenteditableBlur);
        target.addEventListener('blur', sn_helpers.contenteditableBlur);

        target.removeEventListener('change', sn_helpers.contenteditableChange);
        target.addEventListener('change', sn_helpers.contenteditableChange);

    },

    /* deprecated for tinyMCE */
    'triggerEditorChange': (e) => {
        if (!Object.is(sn_helpers.tinyMceCurrent, null)) {
            let data = sn_helpers.getTextFieldSettings(sn_helpers.tinyMceCurrent);
            data['field_value'] = sn_helpers.tinymceEditorFieldContent;
            sn_helpers.saveTextFieldValue(data);
        }
    },

    'getTextFieldSettings': (field) => {
        let field_data = {};
        field_data['topic_id'] = field.closest("[data-topic_id]").dataset.topic_id;
        field_data['field_type'] = field.dataset.field_type;
        field_data['field_format'] = field.dataset.field_format;
        field_data['field_name'] = field.dataset.name;
        if(field.classList.contains('richtext')){ field_data['field_value'] = field.innerHTML; }
        else { field_data['field_value'] = field.innerText; }
        return field_data;

    },

    'contenteditables': null,
    'debounceTimer': null,
    'debounce': function (f, d) {
        clearTimeout(sn_helpers.debounceTimer);
        sn_helpers.debounceTimer = setTimeout(f, d);
    },
    'postData': async (url = '', method, data = {}) => {
        const response = await fetch(url, {
            method: method, // GET, POST, PUT, DELETE, etc.
            mode: 'cors', // cors, no-cors, same-origin
            cache: 'no-cache', // default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // same-origin, include, omit
            headers: {
                'X-CSRF-TOKEN': sn_helpers.csrfToken,
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // follow, manual, error
            referrerPolicy: 'no-referrer', // no-referrer-when-downgrade, no-referrer, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    },
    'slugify': (str) => {
        return String(str)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '-')
            // .trim() // this removes all spaces before they have a chance to become hyphens
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '-')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    },

    'urlify': (str) => {
        let v = String(str)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '-')
            .toLowerCase()
            .replace(/[^a-z0-9\/ -]/g, '-')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        if(v.charAt(0) === '-') v = v.slice(1);
        return v;

    },
    'isHEX': (ch) => "0123456789abcdef".includes(ch.toLowerCase()),
    'isGUID': (x) => {
        x = x.replaceAll("-", "");
        return x.length === 32 && [...x].every(sn_helpers.isHEX);
    },
    'appHeight': () => {
        const doc = document.documentElement
        let half = window.innerHeight / 2;
        doc.style.setProperty(' --app-height', '${window.innerHeight}px');
        doc.style.setProperty(' --app-height-half', '${half}px');
    },
    'fileSize': (size) => {
        let selectedSize = 0;
        let selectedUnit = "b";
        let fileSizeBase = 1000;
        let fileSizeUnits = {tb: "TB", gb: "GB", mb: "MB", kb: "KB", b: "b"};
        if (size > 0) {
            let units = ["tb", "gb", "mb", "kb", "b"];
            for (let i = 0; i < units.length; i++) {
                let unit = units[i];
                let cutoff = Math.pow(fileSizeBase, 4 - i) / 10;
                if (size >= cutoff) {
                    selectedSize = size / Math.pow(fileSizeBase, 4 - i);
                    selectedUnit = unit;
                    break;
                }
            }
            selectedSize = Math.round(10 * selectedSize) / 10; // Cutting of digits
        }
        return `${selectedSize} ${fileSizeUnits[selectedUnit]}`;
    },
    'toBase64': file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    }),

    'detectBrowser': () => {
        return (function (agent) {
            switch (true) {
                case agent.indexOf("edge") > -1:
                    return "edge_html";
                case agent.indexOf("edg") > -1:
                    return "edge_chromium";
                case agent.indexOf("opr") > -1 && !!window.opr:
                    return "opera";
                case agent.indexOf("chrome") > -1 && !!window.chrome:
                    return "chrome";
                case agent.indexOf("trident") > -1:
                    return "ie";
                case agent.indexOf("firefox") > -1:
                    return "firefox";
                case agent.indexOf("safari") > -1:
                    return "safari";
                default:
                    return "other";
            }
        })(window.navigator.userAgent.toLowerCase());

    },

    'detectOS': () => {
        let os = "UnknownOS";
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            os = "ios";
        } else if (/android/i.test(navigator.userAgent)) {
            os = "android";
        } else if (navigator.appVersion.indexOf("Win") !== -1) {
            os = "windows";
        } else if (navigator.appVersion.indexOf("Mac") !== -1) {
            os = "macos";
        } else if (navigator.appVersion.indexOf("X11") !== -1) {
            os = "unix";
        } else if (navigator.appVersion.indexOf("Linux") !== -1) {
            os = "linux";
        }
        return os;
    },

    'setBrowserAndOS': () => {
        document.body.dataset.browser = sn_helpers.detectBrowser();
        document.body.dataset.os = sn_helpers.detectOS();
    },

    'isEmpty': (obj) => {
        return Object.keys(obj).length === 0;
    },

    'setCECounter': (target) => {
        if (target.closest('.snfwi')) {
            target.dataset.cc = target.innerText.length;
        }
    },

    'contenteditableFocus': (e) => {
        e.target.dataset.cv = e.target.innerText;
    },

    'contenteditableKeyDown': (e) => {

        if (e.target.closest('.nospecialcharacters')) {
            // e.target.value = e.target.value.replace(/[^0-9]/, '');
        }

        /* prevent multiple lines and tabs */
        if (
            e.keyCode === 13 &&
            (
                e.target.classList.contains('nobr') ||
                (!e.target.closest('.editor') &&  /* enter */
                    !e.target.classList.contains('content') &&  /* enter */
                    !e.target.classList.contains('cm-content')
                )
            )
        ) {
            e.preventDefault();
            e.stopPropagation();
            e.target.blur();
        }

        if (
            e.keyCode === 9 && /* tab */
            !e.target.closest('.spreadsheet') &&
            !e.target.classList.contains('cm-content')
        ) {
            e.preventDefault();
            e.stopPropagation();
            e.target.blur();
        }

        /* enforce maxlength */
        if (
            e.target.classList.contains('textarea') &&
            (parseInt(e.target.dataset.maxlength) < e.target.innerText.length) &&
            (e.keyCode !== 8 && e.keyCode !== 46)) {
            e.preventDefault();
            e.stopPropagation();
        }

        /* escape */
        if (e.keyCode === 27) {

        }

    },

    'contenteditableKeyUp': (e) => {

        /* likely deprecated */
        if(e.target.dataset.cv !== e.target.innerText) {
            if(e.target.closest('.editor')) {
                // e.target.classList.add('sn_ce_changed');
                // document.body.setAttribute('data-sn_unsaved_ces', 'y');
            }
        }

        /* media title update from modal */
        if (e.target.id === 'media-title-contenteditable') {
            sn_media.activeMedia.title = e.target.innerText;

            let ces = document.querySelectorAll("[data-media_id='" + sn_media.activeMedia.media_id + "']");
            for (let c = 0; c < ces.length; c++) {
                ces[c].dataset.title = e.target.innerText;
                let dzfnce = ces[c].querySelector('.dz-filename');
                if (dzfnce) {
                    dzfnce.dataset.title = e.target.innerText;
                    dzfnce.innerText = e.target.innerText;
                }
                // if(e.target.innerText.length > 1){
                //     ces[c].querySelector(".dz-abbr").innerText = e.target.innerText[0].toUpperCase() + e.target.innerText[1].toLowerCase();
                // }
            }

        }

        /* media description update - currently can only occur in the modal */
        if (e.target.id === 'media-description-contenteditable') {
            sn_media.activeMedia.description = e.target.innerText;
            let ces = document.querySelectorAll("[data-media_id='" + sn_media.activeMedia.media_id + "']");
            for (let c = 0; c < ces.length; c++) {
                ces[c].dataset.description = e.target.innerText;
            }
        }

        sn_helpers.setCECounter(e.target);
    },

    'contenteditableChange': (e) => {

        /* media tags update - currently can only occur in the modal */
        if (e.target.id === 'mediaTagsInput') {
            sn_media.activeMedia.tags = e.target.value;
            let ces = document.querySelectorAll("[data-media_id='" + sn_media.activeMedia.media_id + "']");
            for (let c = 0; c < ces.length; c++) {
                ces[c].dataset.tags = e.target.value;
            }
        }



    },

    'contenteditableBlur': (e) => {

        /* todo: this might be causing an error */

        if (!e.target.classList.contains('cm-content')) {

            e.preventDefault();
            e.preventDefault();
            e.stopPropagation();

            /* contenteditables have hidden textareas as the next sibling which are triggered to post the form when changed */
            if (e.target.isContentEditable) {

                /* dbManager row update */
                if (e.target.closest('#dbManager') && e.target.dataset.cv !== e.target.innerText) {
                    sn_helpers.saveDBRow(e.target);
                }

                /* if outside vendor video and there is no vendor video id */
                else if (
                    (sn_media.activeMedia && sn_media.activeMedia.type) &&
                    (sn_media.activeMedia.type === 'vimeo' || sn_media.activeMedia.type === 'youtube') &&
                    (sn_media.outsideVendorVideoID.innerText === 'new' || sn_media.outsideVendorVideoID.innerText === '')
                ) {
                    return true;
                }

                /* vendor video id blur - youtube or vimeo to start */
                else if (
                    e.target.id === 'outsideVendorVideoID' &&
                    sn_media.outsideVendorVideoID.innerText !== 'new' &&
                    sn_media.outsideVendorVideoID.innerText !== ''
                ) {

                    /* 1. update sn_media.activeMedia */
                    sn_media.activeMedia.vendor_media_id = e.target.innerText;

                    /* 2. update target dataset with vendor media id */
                    e.target.dataset.vendor_media_id = e.target.innerText;

                    /* 3. get vimeo poster - async and promise ignored */
                    if (sn_media.activeMedia.type === 'vimeo') {

                        /* contenteditable --> #outsideVendorVideoID, img -> #snDocumentImageViewer img */
                        sn_media.setVimeoPosterURL(e.target.innerText, document.querySelector("#snDocumentImageViewer img"));
                    }

                    /* 3. get youtube poster - sync */
                    else if (sn_media.activeMedia.type === 'youtube') {

                        /* contenteditable --> #outsideVendorVideoID, img -> #snDocumentImageViewer img */
                        sn_media.setYouTubePosterURL(e.target.innerText, document.querySelector("#snDocumentImageViewer img"));

                    }

                    /* 4. populate the iframe src url in the modal */
                    sn_media.setOutsideVendorVideoURL();

                    /* 5. create new preview element if new video */
                    if (sn_media.activeMedia.media_id === 'new') {
                        let mockFile = {
                            media_id: 'new',
                            // meta: {},
                            type: sn_media.activeMedia.type,
                            vendor_media_id: sn_media.outsideVendorVideoID.innerText,
                        };

                        /* xhr response will have this data:
                        media_id : "98c98c7d-d525-460a-b989-d84828c1bf0c"
                        created_at : "2023.03.27 @ 06:48:49"
                        created_by : "989c2170-269a-4cfb-b6f4-25bb8906359c"
                        ext : "vimeo"
                        location : "vimeo"
                        new_topic : false
                        original_mime_type : "N/A"
                        topic_id : "98c98670-1d75-4eb5-8772-7f28e2d0c31f"
                        status : 200
                        updated_at : "2023.03.27 @ 06:48:49"
                        urls : null
                         */

                        sn_media.createMediaPreviewElementNotDZFile(mockFile, e.target);
                    }

                    /* 6. save media changes to the server */
                    sn_media.saveMedia();

                }

                /* media meta */
                else if (e.target.closest('.media-input')) {
                    if (Object.is(sn_media.activeMedia['metas'], undefined)) {
                        sn_media.activeMedia['metas'] = {};
                    }
                    sn_media.activeMedia['metas'][e.target.dataset.meta] = e.target.innerText;
                    sn_media.saveMedia();
                }





                    /* deprecated...
                    front end field settings - also remove contenteditable if front end
                    if (e.target.closest("[data-sn*='field|']")) {
                        if (e.target.dataset.cv !== e.target.innerText) {
                            let data = sn_helpers.getTextFieldSettings(e.target);
                            data['field_value'] = e.target.innerText;
                            sn_helpers.saveTextFieldValue(data);
                        }

                        e.target.removeAttribute('contenteditable');
                    } */


                    /* this is very likely deprecated
                    let nextSibling = e.target.nextElementSibling;
                    if (nextSibling) {
                        let nextSiblingType = nextSibling.tagName.toLowerCase();

                        /* standard field with a contenteditable and hidden textarea
                        if (nextSiblingType === 'textarea' && nextSibling.classList.contains('update')) {
                            nextSibling.value = e.target.innerText;
                            nextSibling.dispatchEvent(new Event('change'));
                        }

                        /* special cases such as media titles and descriptions
                        else {
                            console.log('special cases to come...');
                        }
                    }*/


                e.target.dataset.cv = '';
            }
        }
    },

    'initContentEditables': () => {
        sn_helpers.contenteditables = document.querySelectorAll("[contenteditable], input[type='text']");

        for (let i = 0; i < sn_helpers.contenteditables.length; i++) {
            sn_helpers.contenteditables[i].removeEventListener('focus', sn_helpers.contenteditableFocus);
            sn_helpers.contenteditables[i].addEventListener('focus', sn_helpers.contenteditableFocus);

            sn_helpers.contenteditables[i].removeEventListener('keyup', sn_helpers.contenteditableKeyUp);
            sn_helpers.contenteditables[i].addEventListener('keyup', sn_helpers.contenteditableKeyUp);

            sn_helpers.contenteditables[i].removeEventListener('keydown', sn_helpers.contenteditableKeyDown);
            sn_helpers.contenteditables[i].addEventListener('keydown', sn_helpers.contenteditableKeyDown); // save any changes

            sn_helpers.contenteditables[i].removeEventListener('blur', sn_helpers.contenteditableBlur);
            sn_helpers.contenteditables[i].addEventListener('blur', sn_helpers.contenteditableBlur);

            sn_helpers.contenteditables[i].removeEventListener('change', sn_helpers.contenteditableChange);
            sn_helpers.contenteditables[i].addEventListener('change', sn_helpers.contenteditableChange);
        }
    },


    'initCodeMirrors': () => {
        sn_helpers.codeMirrors = document.querySelectorAll("[data-field_format='rawHTMLCode']");
        for (let i = 0; i < sn_helpers.codeMirrors.length; i++) {
            new EditorView({
                doc: sn_helpers.codeMirrors[i].innerHTML,
                domEventHandlers: {
                    blur() {
                    }

                },
                extensions: [
                    basicSetup,
                    languageConf.of(html()),
                    autoLanguage,

                    EditorView.updateListener.of(function(e) {
                        sn_helpers.codeMirrors[i].closest('.w').querySelector('.preview').innerHTML = e.state.doc.toString();
                        let data = sn_helpers.getTextFieldSettings(sn_helpers.codeMirrors[i]);
                        data['field_value'] = e.state.doc.toString();
                        sn_helpers.debounce(sn_helpers.saveTextFieldValue(data), 2000);

                        // sn_helpers.debounce(sn_files.saveCodeMirrorValue, 2000);
                        // sn_helpers.codeMirrors[i].innerHTML = '';
                        // sn_files.updatedCMFileValue = e.state.doc.toString();
                        // sn_helpers.debounce(sn_helpers.saveTextFieldValue(data), 2000);
                    })



                ],
                parent: sn_helpers.codeMirrors[i]
            })



            // sn_helpers.tinymceEditorFieldContent = richtext;
            // sn_helpers.debounce(sn_helpers.triggerEditorChange, 2000);
            // console.log('sn_helpers.tinymceEditorFieldContent: ', sn_helpers.tinymceEditorFieldContent);


        }

    },

    'saveDBRow': (target) => {
        let row = target.closest('tr');
        let data = {};
        data['table'] = row.closest('table').dataset.table;
        data['id'] = row.dataset.id;
        let fields = row.querySelectorAll('td[contenteditable]');
        if (fields) {
            for (let i = 0; i < fields.length; i++) {
                data[fields[i].dataset.name] = JSON.stringify(fields[i].innerText); /* added JSON.stringify() for HTML */
            }
        }
        sn_helpers.postData('/admin/db/save', 'post', data)
            .then(data => {
                document.body.classList.add('updated');
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);
            })
            .catch((error) => {
                console.error('!!! --> saveDBRow error:', error);
            });

    },

    'sn_destroyDBRow': (target) => {
        let row = target.closest('tr');
        console.log('row: ', row);
        let data = {};
        data['table'] = row.closest('table').dataset.table;
        data['id'] = row.dataset.id;
        console.log('data: ', data);

        sn_helpers.postData('/admin/db/destroy', 'post', data)
            .then(data => {
                console.log('!!! --> sn_destroyDBRow: ', data);
                document.body.classList.add('updated');
                row.remove();
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);
            })
            .catch((error) => {
                console.error('!!! --> sn_destroyDBRow error:', error);
            });

    },

    'getFieldName': (field) => {
        let attributes_array = field.dataset.sn.split(' ');
        for (let i = 0, len = attributes_array.length; i < len; i++) {
            if (attributes_array[i].includes('field|')) {
                return attributes_array[i].split('|')[1];
            }
        }
        return null;
    },

    'getFieldSettingsAndValue': (field) => {

        console.log('!!!!!!!!! field: ', field);
        let field_data = {};
        let attributes_array = field.dataset.sn.split(' ');
        for (let i = 0, len = attributes_array.length; i < len; i++) {

            /* get topic field */
            field_data['field'] = sn_helpers.getFieldName(field);

            /* get field type */
            if (attributes_array[i].includes('type|')) {
                field_data['type'] = attributes_array[i].split('|')[1];
            }

            /* get field maxlength */
            if (attributes_array[i].includes('maxlength|')) {
                field_data['maxlength'] = attributes_array[i].split('|')[1];
            }

            /* get format */
            if (attributes_array[i].includes('format|')) {
                field_data['format'] = attributes_array[i].split('|')[1];
            }

            /* get value */
            if (field_data['type'] === 'text') {
                if (field_data['format'] === 'text') {
                    field_data['value'] = field.innerText;
                } else if (
                    field_data['format'] === 'richtext' ||
                    field_data['format'] === 'rawHTMLCode'
                ) {
                    field_data['value'] = field.innerHTML;
                }
            }
        }
        return field_data;

    },

    'destroyTopicField': (e) => {
        let data = {
            'topic_id': document.body.dataset.topic_id,
            'field_to_destroy': e.target.dataset.field,
        };
        console.log('destroyTopicField data to be sent to server: ', data);
        sn_helpers.postData('/admin/topic/destroy/field', 'post', data)
            .then(data => {
                console.log('!!! --> destroyTopicField: ', data);
                if (data.result === 'ok') {
                    document.body.classList.add('updated');
                    e.target.closest('.snfw.deprecated').remove();
                    setTimeout(() => {
                        document.body.classList.remove('updated');
                    }, 2000);
                }
            })
            .catch((error) => {
                console.error('!!! --> destroyTopicField error:', error);
            });
    },

    'destroyTopicFieldListener': () => {
        let destroyTopicFieldButtons = document.querySelectorAll(".snfw.deprecated .df");
        if (destroyTopicFieldButtons) {
            for (let f = 0; f < destroyTopicFieldButtons.length; f++) {
                destroyTopicFieldButtons[f].addEventListener('click', sn_helpers.destroyTopicField);
            }
        }
    },


    'listenSaveAllChangedCEsButton': () => {
        let saveAllChangedCEsButton = document.querySelector(".saveAllChangedCEsButton");
        if(saveAllChangedCEsButton) {
            saveAllChangedCEsButton.addEventListener('click', sn_helpers.saveAllChangedCEs);
        }
    },

    'saveAllChangedCEs': () => {

        let changedTextFields = document.querySelectorAll('.sn_ce_changed');
        if(changedTextFields){
            let changedFieldsArray = [];
            for (let f = 0; f < changedTextFields.length; f++) {
                let changedFieldObject = {};
                changedFieldObject = sn_helpers.getTextFieldSettings(changedTextFields[f]);
                changedFieldsArray.push(changedFieldObject);
            }

            sn_helpers.postData('/admin/satfv', 'post', changedFieldsArray)
                .then(response => {
                    console.log('!!! --> saveTextFieldValue: ', response);
                    document.body.removeAttribute('data-sn_unsaved_ces');
                })
                .catch((error) => {
                    console.error('!!! --> saveTextFieldValue error:', error);
                });

        }

    },

    'saveTextFieldValue': (data) => {
        console.log('saveTextFieldValue data to be sent to server: ', data);
        sn_helpers.postData('/admin/stfv', 'post', data)
            .then(data => {
                console.log('!!! --> saveTextFieldValue: ', data);
                document.body.classList.add('updated');
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);
            })
            .catch((error) => {
                console.error('!!! --> saveTextFieldValue error:', error);
            });
    },

    /*

    'initFieldEditor': (e) => {
        console.log('actual e.target: ', e.target);
        console.log('closest field to e.target: ', e.target.closest("[data-sn*='field|']"));
        if (e.target.closest("[data-sn*='field|']").dataset.sn.includes('format|richtext')) {
            sn_helpers.initTinyMCE(e.target.closest("[data-sn*='field|']"));
        } else {
            sn_helpers.initContentEditable(e.target.closest("[data-sn*='field|']"));
        }
    },

     */

    'initFieldEditorListener': () => {
        let fields = document.querySelectorAll("[data-sn*='type|text']");
        if (fields) {
            for (let f = 0; f < fields.length; f++) {
                fields[f].addEventListener('click', sn_helpers.initFieldEditor);
            }
        }
    },

    /* ~~~~~~~~~~~~~~~~~~~~ tinyMCE ~~~~~~~~~~~~~~~~~~~~ */
    'initTinyMCE': (target) => {

        console.log('target: ', target);


        target.closest('.snfw').classList.add('active');
        sn_helpers.tinyMceCurrent = target;
        console.log('sn_helpers.tinyMceCurrent: ', sn_helpers.tinyMceCurrent);

        sn_helpers.tinyMces[sn_helpers.tinyMceCurrent.id] = tinymce.init({
            selector: "#" + sn_helpers.tinyMceCurrent.id,
            inline: true,
            menubar: false,
            skin: "oxide",
            target_list: false,
            toolbar_location: 'bottom',
            object_resizing: false,
            entity_encoding: "named",
            paste_data_images: false,
            plugins: [
                'lists', 'link', 'searchreplace', 'visualblocks', 'code',
            ],
            toolbar: 'blocks bold italic forecolor backcolor link alignleft aligncenter ' +
                'alignright alignjustify bullist numlist ' +
                'removeformat code',
            /*

            plugins: "link lists emoticons code",
            toolbar: "styleselect | bold italic underline | link image emoticons | align bullist numlist | code removeformat",
            inline: true,
            menubar: false,
            skin: "oxide",
            target_list: false,
            toolbar_sticky: true,
            object_resizing: false,
            entity_encoding: "named",
            paste_data_images: false,
            paste_filter_drop: false,

             */



            setup: function (editor) {

                editor.on('init', function (e) {
                    console.log('The editor has initialized.');
                });

                editor.on('Change', function (e) {

                    sn_topics.topicChanged();


                    /*
                    console.log('The editor has changed.');
                    let richtext = tinymce.get(sn_helpers.tinyMceCurrent.id).getContent();


                    /* welcome back! did tinymce break the json again?
                    richtext = richtext.replace(/"/g, "'"); /* double quotes are a no-no
                    console.log('richtext content: ', richtext);

                    // front end
                    if (target.closest("[data-i]")) {
                        sn_helpers.tinyMceTopicID = target.closest("[data-topic_id]").dataset.topic_id;
                        sn_helpers.tinyMceField = target.dataset.f;
                    }

                    // admin area
                    else {
                        sn_helpers.tinyMceTopicID = document.body.dataset.topic_id;
                        sn_helpers.tinyMceField = target.dataset.name;
                    }

                    // front and admin
                    sn_helpers.tinymceEditorFieldContent = richtext;


                    target.classList.add('sn_ce_changed');
                    document.body.setAttribute('data-sn_unsaved_ces', 'y');


                    // sn_helpers.debounce(sn_helpers.triggerEditorChange, 2000); /* deprecated
                    console.log('sn_helpers.tinymceEditorFieldContent: ', sn_helpers.tinymceEditorFieldContent);

                     */

                });

            }

        });

    },

    'toggleModal': (e) => {
        console.log('hello?');
        if (document.body.hasAttribute('data-modal')) {
            document.body.removeAttribute('data-modal');
            setTimeout(() => {
                document.body.removeAttribute('data-action');
            }, 500);
        } else {
            document.body.dataset.modal = e.target.dataset.modal;
            document.body.dataset.modalaction = e.target.dataset.action;
        }
    },

    'toggleModalListeners': () => {
        let modalTriggers = document.querySelectorAll(".toggleModal");
        if (modalTriggers) {
            for (let m = 0; m < modalTriggers.length; m++) {
                modalTriggers[m].removeEventListener('click', sn_helpers.toggleModal);
                modalTriggers[m].addEventListener('click', sn_helpers.toggleModal, null);
            }
        }
    },

    'toggleTabPanel': (e) => {
        let targetPanelID = e.target.dataset.p;
        let tabs = e.target.closest('.tabs').querySelectorAll('li');
        let panels = e.target.closest('.tabPanels').querySelectorAll('.panel');
        for (let t = 0; t < tabs.length; t++) {
            tabs[t].classList.remove('active');
        }
        for (let p = 0; p < panels.length; p++) {
            if (panels[p].id === targetPanelID) {
                panels[p].classList.add('active');
            } else {
                panels[p].classList.remove('active');
            }
        }
        e.target.classList.add('active');
    },

    'toggleTabPanelListeners': () => {
        let tabs = document.querySelectorAll('.tabPanels .tabs li');
        if (tabs) {
            for (let t = 0; t < tabs.length; t++) {
                tabs[t].removeEventListener('click', sn_helpers.toggleTabPanel);
                tabs[t].addEventListener('click', sn_helpers.toggleTabPanel, null);
            }
        }
    },


    'unloadHandler': (e) => {

        // are there unsaved changes?
        if(
            document.body.hasAttribute('data-form_changed') ||
            document.body.hasAttribute('data-display_topic_save_button') ||
            document.body.hasAttribute('data-sn_unsaved_ces')
        ) {
            e.preventDefault();
        }

    },

    'updateTopicTitleDisplays' : (e) => {
        let topicTitleDisplays= document.querySelectorAll('.topicTitleDisplay');
        if(topicTitleDisplays){
            for (let t = 0; t < topicTitleDisplays.length; t++) {
                topicTitleDisplays[t].innerText = e.target.hasAttribute('contenteditable') ? e.target.innerText : e.target.value;
            }
        }
    },

    'listenTopicTitleInputs': () => {
        let topicTitleInputs =  document.querySelectorAll('.topicTitleInput');
        if(topicTitleInputs){
            if(topicTitleInputs){
                for (let t = 0; t < topicTitleInputs.length; t++) {
                    topicTitleInputs[t].removeEventListener('keyup', sn_helpers.updateTopicTitleDisplays);
                    topicTitleInputs[t].addEventListener('keyup', sn_helpers.updateTopicTitleDisplays, null);
                }
            }
        }
    },



}

sn_helpers.setBrowserAndOS();

/* keydown specifics */
window.addEventListener(
    "keydown",
    (e) => {

        /* save code */
        if(e.key === 's' && e.metaKey && document.body.id === 'be-code-index'){
            e.preventDefault();
            sn_files.saveCodeMirrorValues();
            return false;
        }

    },
    true,
);

/* keyup specifics */
window.addEventListener(
    "keyup",
    (e) => {

        if (e.code === 'Escape') {

            if (document.body.hasAttribute('data-modal')) {
                document.body.removeAttribute('data-modal');
            }

            if (document.body.hasAttribute('data-media_modal_status')) {
                sn_media.toggleMediaModal(e);
            }

        }

        else  if (e.code === 'Escape') {
            sn_helpers.closeContextMenu();
        }

        else if(e.key === 's') {
            console.log('s');
        }

    },
    true,
);






/* ~~~~~~~~~~~~~~~~~~~~ init ~~~~~~~~~~~~~~~~~~~~ */

window.addEventListener('load', function () {

    sn_helpers.initFieldEditorListener();
    sn_helpers.destroyTopicFieldListener();
    sn_helpers.toggleModalListeners();
    sn_helpers.listenDDMenus();
    sn_helpers.toggleTabPanelListeners();
    // sn_helpers.initCodeMirrors(); /* deprecated and moved to sn_fileManager.js (?) */
    sn_helpers.listenLogout();
    sn_helpers.listenToggleAdminMenu();
    sn_helpers.listenSaveAllChangedCEsButton();
    sn_helpers.listenTopicTitleInputs();
    window.addEventListener("beforeunload", sn_helpers.unloadHandler);


});


document.addEventListener("mouseup", (e) => {

    // console.log('hello');
    // console.log('sn_helpers: ', sn_helpers);

    if(sn_helpers.contextMenuTarget) {
        sn_helpers.contextMenuTarget.classList.remove('rclick');
    }

    switch (e.button) {

        // console.log("left button click");
        case 0:

            if (e.target.closest('.snfwi.drop')) {
                sn_media.activeDZ = e.target.closest('.snfwi.drop').querySelector('.dropzone');
            }

            if (typeof sn_topics !== "undefined") {
                if (!Object.is(sn_topics.warnDeleteChildTopicButton, null) && !e.target.closest('.warn')) {
                    sn_topics.warnDeleteChildTopicButton.classList.remove('warn');
                }
            }

            /* tinyMce blur - sn_helpers.tinyMceCurrent is the div element  */
            if (
                !Object.is(sn_helpers.tinyMceCurrent, null) // a tinyMce exists...
            ) {


                /* if not clicking within the current tiny mce element or associated menu */
                if(!e.target.closest('.tox') && !e.target.closest('.settings')){
                    sn_helpers.tinyMceCurrent.closest('.snfw').classList.remove('active');
                    console.log('remove active');
                }

            }

            /* destroy tinyMce on blur
            if (
                !Object.is(sn_helpers.tinyMces[sn_helpers.tinyMceCurrent.id], undefined)  // a tinyMce exists...
            ) {

                console.log('destroy tinyMce...');

                sn_helpers.tinyMces[sn_helpers.tinyMceCurrent.id].destroy();
                sn_helpers.tinyMce = null;
                sn_helpers.tinyMceTopicID = null;
                sn_helpers.tinyMceField = null;
                sn_helpers.tinyMceCurrent = null;
                sn_helpers.tinymceEditorFieldContent = '';

                console.log('sn_helpers.tinyMces: ', sn_helpers.tinyMces);
                console.log('sn_helpers.tinyMceTopicID: ', sn_helpers.tinyMceTopicID);
                console.log('sn_helpers.tinyMceField: ', sn_helpers.tinyMceField);
                console.log('sn_helpers.tinyMceCurrent: ', sn_helpers.tinyMceCurrent);
                console.log('sn_helpers.tinymceEditorFieldContent: ', sn_helpers.tinymceEditorFieldContent);


            }  */

            /* open media modal */
            else if (e.target.closest('.dz-preview') && !document.body.hasAttribute('data-mediaSorted')) {
                sn_media.toggleMediaModal(e);
            }

            /* copy file url */
            else if (e.target.classList.contains('copy-url')) {
                e.target.classList.add('copied');
                navigator.clipboard.writeText(sn_helpers.contextMenuTarget.dataset.url);
                setTimeout(() => {
                    sn_helpers.closeContextMenu();
                    e.target.classList.remove('copied');
                }, 1000);
            }

            /* copy media id */
            else if (e.target.classList.contains('copy-media-id')) {
                e.target.classList.add('copied');
                navigator.clipboard.writeText(e.target.closest('ul').dataset.media_id);
                setTimeout(() => {
                    sn_helpers.closeContextMenu();
                    e.target.classList.remove('copied');
                }, 1000);
            }

            /* delete directory or file - possibly media that has a database record */
            else if (e.target.classList.contains('delete')) {
                if (!e.target.classList.contains('warn')) {
                    e.target.classList.add('warn');
                    if (sn_helpers.contextMenuTarget.dataset.cm === 'directory' || sn_helpers.contextMenuTarget.dataset.cm === 'file') {
                        sn_helpers.contextMenuTarget.closest('li').classList.add('warn');
                    }
                }
                else {
                    console.log('what is being deleted: ', sn_helpers.contextMenuTarget);
                    if (sn_helpers.contextMenu.hasAttribute('data-media_id')) {
                        sn_media.deleteMedia(sn_helpers.contextMenuTarget);
                    } else if (sn_helpers.contextMenuTarget.dataset.cm === 'directory' || sn_helpers.contextMenuTarget.dataset.cm === 'file') {
                        sn_files.deleteDirectoryOrFile(sn_helpers.contextMenuTarget);
                    }
                    e.target.classList.remove('warn');
                    sn_helpers.closeContextMenu();
                }
            }

            /* download media, directory or file */
            else if (e.target.classList.contains('download')) {
                console.log('downloading ', sn_helpers.contextMenuTarget);

                if (e.target.closest("ul#sn_CMDZMedia")) {
                    window.location.href = '/admin/media/download/' + e.target.closest('ul').dataset.media_id;
                } else if (e.target.closest("ul#sn_CMFiles")) {
                    sn_files.downloadSomething(sn_helpers.contextMenuTarget);
                }
                sn_helpers.closeContextMenu();
            }

            /* rename directory or file */
            else if (e.target.classList.contains('rename')) {
                if (sn_helpers.contextMenuTarget.dataset.cm === 'directory' || sn_helpers.contextMenuTarget.dataset.cm === 'file') {
                    sn_helpers.contextMenuTarget.closest('li').classList.add('rename');
                }
                console.log('rename file...');
                sn_files.initFileRename(sn_helpers.contextMenuTarget);
            }

            /* duplicate directory or file */
            else if (e.target.classList.contains('duplicate')) {
                if (sn_helpers.contextMenuTarget.dataset.cm === 'directory' || sn_helpers.contextMenuTarget.dataset.cm === 'file') {
                    sn_helpers.contextMenuTarget.closest('li').classList.add('duplicate');
                }
                e.target.classList.add('active');
                console.log('duplicate file...');
                sn_files.initDuplicateDirectoryOrFile(sn_helpers.contextMenuTarget);
            }

            /* create directory or file */
            else if (e.target.classList.contains('new')) {
                if (sn_helpers.contextMenuTarget.dataset.cm === 'directory' || sn_helpers.contextMenuTarget.dataset.cm === 'file') {
                    sn_helpers.contextMenuTarget.closest('li').classList.add('new');
                }
                console.log('creating directory or file...');
                e.target.classList.add('active');
                sn_files.initCreateDirectoryOrFile(e.target.dataset.cm);
            }

            /* toggling media inclusion in topic field */
            else if (e.target.closest('.add-to-topic-field')) {
                console.log('!!!!! toggling media inclusion in topic');
                sn_media.toggleSelectedMedia(sn_helpers.contextMenuTarget.closest('.dz-preview'));
                sn_helpers.closeContextMenu();
            }

            /* copy db cell content */
            else if (e.target.classList.contains('copy-db-cell-content')) {
                e.target.classList.add('copied');
                navigator.clipboard.writeText(sn_helpers.contextMenuTarget.innerText);
                setTimeout(() => {
                    sn_helpers.closeContextMenu();
                    e.target.classList.remove('copied');
                }, 1000);
            }

            /* delete db record */

            else if (e.target.classList.contains('delete-db-record')) {
                if (!e.target.classList.contains('warn')) {
                    e.target.classList.add('warn');
                    sn_helpers.contextMenuTarget.focus();
                } else {
                    console.log('delete db record...');
                    sn_helpers.sn_destroyDBRow(sn_helpers.contextMenuTarget.closest('tr'));
                    sn_helpers.closeContextMenu();
                }
            } else {
                sn_helpers.closeContextMenu();
            }

            break;
        case 1:
            console.log("Middle button clicked.");
            break;
        case 2:
            // toggleContextMenu();
            console.log("Right button clicked.");
            break;
        default:
            console.log(`Unknown button code: ${e.button}`);
    }


});


document.body.addEventListener("click", function (e) {
    if (e.target.closest('.editor.richtext')) {
        sn_helpers.initTinyMCE(e.target.closest('.editor.richtext'));
    } else if (e.target.closest('.editor.text')) {
        e.target.closest('.editor.text').setAttribute('contenteditable', true);
        e.target.addEventListener('keyup', sn_helpers.contenteditableKeyUp);
    }
});

/* contextmenu (right) click */
document.addEventListener("contextmenu", function (e) {

    console.log('contextmenu (right) click');

    /* determine if contextmenu */
    if (e.target.closest("[data-cm]")) {
        console.log('a supernifty contextmenu is requested');
        e.preventDefault();
        let requestedContextMenu = false;


        /* now determine which contextMenu */

        /* sn_fileManager, dropzone. likely more to come later */
        if (e.target.closest("[data-cm]")) {
            console.log('some kinda file or whatever: ', e.target.closest("[data-cm]"));

            /* topic */
            if (e.target.dataset.cm === 'topic') {
                requestedContextMenu = 'topic';
            }

            /* files */
            if (e.target.dataset.cm === 'directory' || e.target.dataset.cm === 'file') {
                requestedContextMenu = 'files';
            }

            /* dropzone media */
            else if (e.target.closest("[data-cm]").dataset.cm === 'DZmedia') {
                requestedContextMenu = 'DZmedia';
            }


        }
        console.log('requestedContextMenu: ', requestedContextMenu);
        sn_helpers.openContextMenu(e, requestedContextMenu);

    }
});


