window.sn_site_env = {


    'mainDomain': document.getElementById('domain'),


    /* ~~~~~~~~~~~~~~~~~~~ switch environment from top menu ~~~~~~~~~~~~~~~~~~~~~ */

    /* environment switcher menu in adminNav at top of admin pages */
    'switchEnvironmentButtons': document.querySelectorAll("#switchEnvironment li"),
    'switchEnvironment': (e) => {
        window.location = e.target.dataset.url;
    },
    'listenSwitchEnvironment': (e) => {
        if(sn_site_env.switchEnvironmentButtons){
            for (let i = 0; i < sn_site_env.switchEnvironmentButtons.length; i++) {
                sn_site_env.switchEnvironmentButtons[i].removeEventListener('click', sn_site_env.switchEnvironment, null);
                sn_site_env.switchEnvironmentButtons[i].addEventListener('click', sn_site_env.switchEnvironment, null);
            }
        }

    },

    'cancelAllActions' : () => {

        let actionForms = document.querySelectorAll('.actionForm');
        let dataTs = document.querySelectorAll("li[data-t='t']");
        if(actionForms){

            /* main form */
            document.body.removeAttribute('data-displaynewsiteform');
            sn_site_env.resetDomainInput();
            sn_site_env.mainDomain.value = '';

            /* dataTs */
            for (let t = 0; t < dataTs.length; t++) {
                dataTs[t].classList.remove('action');
            }

            /* actionForms */
            for (let a = 0; a < actionForms.length; a++) {
                actionForms[a].innerText = '';
            }
        }

    },

    'listenCancelAllActions': () => {
        let cancelAllActionsButtons = document.querySelectorAll(".actionform [data-a='cancel']");
        for (let i = 0; i < cancelAllActionsButtons.length; i++) {
            cancelAllActionsButtons[i].removeEventListener('click', sn_site_env.cancelAllActions, null);
            cancelAllActionsButtons[i].addEventListener('click', sn_site_env.cancelAllActions, null);
        }
    },

    /* ~~~~~~~~~~~~~~~~~~~ create new site form ~~~~~~~~~~~~~~~~~~~~~ */

    'toggleNewSiteForm': () => {
        if(!document.body.hasAttribute('data-displaynewsiteform')) {
            document.body.setAttribute('data-displaynewsiteform', '1');
            document.getElementById('domain').focus();
        }
        else {
            sn_site_env.cancelAllActions();
        }
    },

    'listenToggleNewSiteForm': () => {
        let toggleNewSiteFormButtons = document.querySelectorAll("[data-a='toggleNewSiteForm']");
        if(toggleNewSiteFormButtons){
            for (let i = 0; i < toggleNewSiteFormButtons.length; i++) {
                if(toggleNewSiteFormButtons[i]){
                    toggleNewSiteFormButtons[i].removeEventListener('click', sn_site_env.toggleNewSiteForm, null);
                    toggleNewSiteFormButtons[i].addEventListener('click', sn_site_env.toggleNewSiteForm, null);
                }
            }
        }
    },





    /* ~~~~~~~~~~~~~~~~~~~ sites index actions ~~~~~~~~~~~~~~~~~~~~~ */

    'siteActionButtons': document.querySelectorAll("#be-sites-index [data-a]") ? document.querySelectorAll("#be-sites-index [data-a]") : null,

    'listenFormActions': (e) => {
        sn_site_env.listenCloneSite();
        sn_site_env.listenConfirmUniqueDomain();
        sn_site_env.listenConfirmUniqueEnvironmentSlug();
        sn_site_env.listenCreateOrCloneEnvironment();
        sn_site_env.listenDeployEnvironment();
        sn_site_env.listenDestroyEnvironment();
    },

    'toggleForm': (e) => {

        sn_site_env.cancelAllActions();

        let target = e.target.closest("li[data-t]");
        let action = e.target.dataset.a;
        let actionForm = target.querySelector('.actionForm.' + target.dataset.t);


        target.classList.add('action');

        if(target.classList.contains('action')){

            let form = action;
            if(action === 'initcreateenvironment' || action === 'initcloneenvironment') { form = 'createorcloneenvironmentform'; }
            actionForm.append(document.querySelector('#siteActionTemplates .' + form).cloneNode(true));
            if(action === 'initcreateenvironment') { actionForm.querySelector("input[name='action']").value = 'create'; }
            else if(action === 'initcloneenvironment') { actionForm.querySelector("input[name='action']").value = 'clone'; }

            /* import live site data */
            if(e.target.dataset.a === 'importlivesitedata'){
                target.classList.add('warning');
            }


            /* destroy site warning */
            if(e.target.dataset.a === 'warndestroysite'){
                target.classList.add('warning');
            }

            /* destroy environment warning */
            if(e.target.dataset.a === 'warndestroyenvironment'){
                target.classList.add('warning');
            }

            /* clone environment */
            if(e.target.dataset.a === 'initcloneenvironment'){
                sn_site_env.initCloneEnvironment(actionForm);
            }

            /* create environment */
            if(e.target.dataset.a === 'initcreateenvironment'){
                sn_site_env.initCreateEnvironment(actionForm);
            }

            sn_site_env.listenFormActions();
        }
        else { actionForm.innerText = ''; }
    },


    /* action site in /admin/site/site  */
    'actionSite': (e) => {

        if(
            e.target.dataset.a === 'initclonesite' ||
            e.target.dataset.a === 'warndestroysite' ||
            e.target.dataset.a === 'initcreateenvironment' ||
            e.target.dataset.a === 'initcloneenvironment' ||
            e.target.dataset.a === 'initdeployenvironment' ||
            e.target.dataset.a === 'warndestroyenvironment'
        ){
            sn_site_env.toggleForm(e);
        }

        if(e.target.dataset.a === 'warndestroysite'){
            console.log('getting ready...');
            sn_site_env.listenDestroySite(e);
        }

        if(e.target.dataset.a === 'actuallydestroysite'){
            console.log('tryna destroy site...');
            sn_site_env.actuallyDestroySite(e);
        }

        if(e.target.dataset.a === 'importsite' || e.target.dataset.a === 'dashboard'){
            let domain = e.target.closest("li[data-t='site']").dataset.domain;
            let environment = e.target.closest("li[data-t='environment']").dataset.slug;
            sn_site_env.redirectTo(domain, environment, e.target.dataset.a);
        }

        if(e.target.dataset.a === 'actuallyclonesite'){
            sn_site_env.actuallyCloneSite(e);
        }

        if(e.target.dataset.a === 'downloadsite'){
            sn_site_env.exportSiteZIP(e);
        }

        if(e.target.dataset.a === 'actuallycreateorcloneenvironment'){
            sn_site_env.actuallyCreateOrCloneEnvironment(e);
        }

        if(e.target.dataset.a === 'actuallydeployenvironment'){
            sn_site_env.actuallyDeployEnvironment(e);
        }

        if(e.target.dataset.a === 'actuallydestroyenvironment'){
            sn_site_env.actuallyDestroyEnvironment(e);
        }

        if(e.target.dataset.a === 'downloadenvironment'){
            sn_site_env.downloadEnvironment(e);
        }

        if(e.target.dataset.a === 'destroyenvironment'){
            sn_site_env.actuallyDestroyEnvironment(e);
        }

        /* likely deprecated ...

        if(e.target.dataset.a === 'viewenvironment' || e.target.dataset.a === 'manageenvironment'){
            sn_site_env.toggleViewEnvironment.dataset.environment = e.target.dataset.value;
            console.log('changing to the ' + e.target.dataset.value + ' environment...') ;
            let data = { 'environment': e.target.closest("[data-environment]").dataset.environment };
            sn_helpers.postData('/admin/site/environments/change', 'post', data)
                .then(response => {
                    if(response.result === 'ok'){
                        if(e.target.dataset.a === 'manage'){ window.location.href = '/admin'; }
                        else if(e.target.dataset.a === 'view'){ window.location.href = '/'; }
                    }
                })
                .catch((error) => { console.error('!!! --> actionSite view/manage change environment error:', error); });
        }

         */

        if(e.target.dataset.a === 'viewsite' || e.target.dataset.a === 'managesite'){
            console.log('changing to the ' + e.target.dataset.value + ' site...') ;
            if(e.target.dataset.a === 'manage'){ window.location.href = 'https://' + e.target.closest('.site').dataset.domain + '/admin/site/environments'; }
            else if(e.target.dataset.a === 'view'){ window.location.href = 'https://' + e.target.closest('.site').dataset.domain + '/'; }
        }

    },

    'listenActionSite': () => {
        for (let i = 0; i < sn_site_env.siteActionButtons.length; i++) {
            sn_site_env.siteActionButtons[i].removeEventListener('click', sn_site_env.actionSite, null);
            sn_site_env.siteActionButtons[i].addEventListener('click', sn_site_env.actionSite, null);
        }
    },

    'confirmUniqueDomain' : (e) => {
        if((e.target.innerText && e.target.innerText.length > 0) || (e.target.value && e.target.value.length > 0)){
            let value = null
            if(e.target.innerText && e.target.innerText.length > 0){ value = e.target.innerText; }
            else if(e.target.value && e.target.value.length > 0){ value = e.target.value; }
            sn_helpers.postData('/admin/site/confirmuniquedomain', 'post', { 'domain': value })
                .then(response => {
                    console.log('confirmUniqueDomain response: ', response);
                    e.target.closest('.actionform').dataset.status = response.result;
                    e.target.closest('.fw').dataset.status = response.result;
                    e.target.closest('.fw').dataset.message = response.message;
                })
                .catch((error) => { console.error('!!! --> confirmUniqueDomain error:', error); });
        }
        else {
            e.closest('.fw').dataset.status = 'ng';
        }
    },

    'listenConfirmUniqueDomain' : () => {
        let siteDomainSlugInputs = document.querySelectorAll(".initclonesite [contenteditable]");
        if(siteDomainSlugInputs){
            for (let i = 0; i < siteDomainSlugInputs.length; i++) {
                if(siteDomainSlugInputs[i]){
                    siteDomainSlugInputs[i].removeEventListener('keyup', sn_site_env.confirmUniqueDomain, null);
                    siteDomainSlugInputs[i].addEventListener('keyup', sn_site_env.confirmUniqueDomain, null);
                }
            }
        }
    },

    'actuallyCloneSite': (e) => {
        e.preventDefault();
        sn_helpers.postData('/admin/site/createorclone', 'post', {
            'action': 'clone',
                'domain': e.target.closest('.initclonesite').querySelector("[contenteditable]").innerText.trim(),
                'source_site_id': e.target.closest("[data-site_id]").dataset.site_id
            })
            .then(data => {
                if(data.result === 'ok'){
                    console.log('!!! ::::::: --> sn_site_env.actuallyCloneSite response: ', data);
                    location.reload();
                }
            })
            .catch((error) => { console.error('!!! --> sn_site_env.actuallyCloneSite error:', error); });
    },

    'listenCloneSite' : () => {
        let cloneSiteButtons = document.querySelectorAll("[data-a='actuallyclonesite']");
        if(cloneSiteButtons){
            for (let i = 0; i < cloneSiteButtons.length; i++) {
                if(cloneSiteButtons[i]){
                    cloneSiteButtons[i].removeEventListener('click', sn_site_env.actuallyCloneSite, null);
                    cloneSiteButtons[i].addEventListener('click', sn_site_env.actuallyCloneSite, null);
                }
            }
        }
        sn_site_env.listenCancelAllActions();
    },

    'exportSiteZIP': (e) => {
        e.preventDefault();
        window.location.href = '/admin/site/export/zip/' + e.target.closest("[data-site_id]").dataset.site_id;
    },

    'actuallyDestroySite': (e) => {
        e.preventDefault();
        sn_helpers.postData('/admin/site/destroy', 'post', {
                'site_id': e.target.closest("[data-site_id]").dataset.site_id
            })
            .then(data => {
                console.log('!!! ::::::: --> sn_site_env.actuallyDestroySite response: ', data);
                location.reload();
            })
            .catch((error) => { console.error('!!! --> sn_site_env.actuallyDestroySite error:', error); });
    },

    'listenDestroySite' : (e) => {
        let destroySiteButton = e.target.closest("[data-t='site']").querySelector("[data-a='actuallydestroysite']");
        if(destroySiteButton){
            destroySiteButton.classList.add('active');
            destroySiteButton.addEventListener('click', sn_site_env.actuallyDestroySite, null);
        }
        sn_site_env.listenCancelAllActions();
    },

    'confirmUniqueEnvironmentSlug' : (e) => {

        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/, '-');
        console.log('confirmUniqueEnvironmentSlug added the hyphen...');

        let slug = '';
        if(e.target.classList.contains("environment")) {
            slug = sn_helpers.slugify(e.target.value);
        }
        else {
            slug = sn_helpers.slugify(e.target.innerText);
        }

        if(slug.length > 1){
            console.log('slug: ', slug);
            sn_helpers.postData('/admin/site/environments/confirmuniqueenvironmentslug', 'post', { 'slug': slug })
                .then(response => {
                    console.log('confirmUniqueEnvironmentSlug response: ', response);
                    e.target.closest('form').dataset.status = response.result;
                    e.target.closest('div').dataset.status = response.result;
                    e.target.closest('div').dataset.message = response.message;
                })
                .catch((error) => { console.error('!!! --> confirmUniqueEnvironmentSlug error:', error); });
        }
        else {
            e.target.closest('div').dataset.status = 'ng';
        }
    },

    'listenConfirmUniqueEnvironmentSlug' : () => {
        let environmentSlugInputs = document.querySelectorAll(".cloneenvironmentform [contenteditable], .environmentmessage .environment");
        if(environmentSlugInputs){
            for (let i = 0; i < environmentSlugInputs.length; i++) {
                if(environmentSlugInputs[i]){
                    environmentSlugInputs[i].removeEventListener('keyup', sn_site_env.confirmUniqueEnvironmentSlug, null);
                    environmentSlugInputs[i].addEventListener('keyup', sn_site_env.confirmUniqueEnvironmentSlug, null);
                }
            }
        }
    },

    'actuallyCreateOrCloneEnvironment': (e) => {
        e.preventDefault();
        sn_helpers.postData('/admin/site/environments/createorclone', 'post', {
                'action': e.target.closest('.actionform').querySelector("input[name='action']").value,
                'new_environment_slug': e.target.closest('.actionform').querySelector("input[name='environment']").value.trim(),
                'source_environment_id': e.target.closest("[data-environment_id]").dataset.environment_id,
                'site_id': e.target.closest("[data-site_id]").dataset.site_id
            })
            .then(data => {
                console.log('!!! ::::::: --> sn_sites.actuallyCreateOrCloneEnvironment response: ', data);
                location.reload();
            })
            .catch((error) => { console.error('!!! --> sn_sites.actuallyCreateOrCloneEnvironment error:', error); });
    },

    'listenCreateOrCloneEnvironment' : () => {
        let cloneEnvironmentButtons = document.querySelectorAll("[data-a='actuallycreateorcloneenvironment']");
        if(cloneEnvironmentButtons){
            for (let i = 0; i < cloneEnvironmentButtons.length; i++) {
                if(cloneEnvironmentButtons[i]){
                    cloneEnvironmentButtons[i].removeEventListener('click', sn_site_env.actuallyCreateOrCloneEnvironment, null);
                    cloneEnvironmentButtons[i].addEventListener('click', sn_site_env.actuallyCreateOrCloneEnvironment, null);
                }
            }
        }
    },

    'redirectTo': (domain, environment, redirect) => {
        window.location.href = 'https://' + domain + '/sn/switch/' + domain + '/'  + environment + '/' + redirect;
    },

    'actuallyDeployEnvironment': (e) => {
        let environment_id = e.target.closest("li.environment").dataset.environment_id;
        console.log('actuallyDeployEnvironment -- environment_id: ' + environment_id) ;
        let data = { 'environment_id': environment_id };
        sn_helpers.postData('/admin/site/environments/deploy', 'post', data)
            .then(data => {
                if(data.result === 'ok'){
                    location.reload();
                }
                else {
                    document.body.dataset.deployment_status = 'error';
                    console.error('!!! --> runDeployment error:', error);
                }
            })
            .catch((error) => {
                document.body.dataset.deployment_status = 'error';
                console.error('!!! --> actuallyDeployEnvironment error:', error);
            });

    },


    'listenDeployEnvironment' : () => {
        let deployEnvironmentButtons = document.querySelectorAll("[data-a='actuallydeployenvironment']");
        if(deployEnvironmentButtons){
            for (let i = 0; i < deployEnvironmentButtons.length; i++) {
                if(deployEnvironmentButtons[i]){
                    deployEnvironmentButtons[i].removeEventListener('click', sn_site_env.actuallyDeployEnvironment, null);
                    deployEnvironmentButtons[i].addEventListener('click', sn_site_env.actuallyDeployEnvironment, null);
                }
            }
        }
    },

    'downloadEnvironment': (e) => {
        e.preventDefault();
        window.location.href = '/admin/site/environments/download/' + e.target.closest("[data-environment_id]").dataset.environment_id;
    },

    'actuallyDestroyEnvironment': (e) => {
        e.preventDefault();
        sn_helpers.postData('/admin/site/environments/destroy', 'post', {
                'environment_id': e.target.closest("[data-environment_id]").dataset.environment_id
            })
            .then(data => {
                console.log('!!! ::::::: --> sn_sites.actuallyDestroyEnvironment response: ', data);
                location.reload();
            })
            .catch((error) => { console.error('!!! --> sn_sites.actuallyDestroyEnvironment error:', error); });
    },

    'listenDestroyEnvironment' : () => {
        let destroyEnvironmentButtons = document.querySelectorAll("[data-a='actuallydestroyenvironment']");
        if(destroyEnvironmentButtons){
            for (let i = 0; i < destroyEnvironmentButtons.length; i++) {
                if(destroyEnvironmentButtons[i]){
                    destroyEnvironmentButtons[i].removeEventListener('click', sn_site_env.actuallyDestroyEnvironment, null);
                    destroyEnvironmentButtons[i].addEventListener('click', sn_site_env.actuallyDestroyEnvironment, null);
                }
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

    'initSiteImport': () => {

        let siteZipDrop = document.querySelector('#createSiteForm .zipdrop');
        if(siteZipDrop){

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
                siteZipDrop.addEventListener(e, sn_site_env.preventDefaults, false);
                document.body.addEventListener(e, sn_site_env.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(e => {
                siteZipDrop.addEventListener(e, sn_site_env.highlight, false);
            });

            ['dragleave', 'drop'].forEach(e => {
                siteZipDrop.addEventListener(e, sn_site_env.unhighlight, false);
            });

            siteZipDrop.addEventListener('drop', (e) => {
                siteZipDrop.querySelector("input[type='file']").files = e.dataTransfer.files;
                siteZipDrop.querySelector('span').innerText = e.dataTransfer.files[0].name;
                siteZipDrop.closest('.toz').classList.add('zip');
                console.log('dropped');
                e.preventDefault()
            });

        }

    },

    'resetDomainInput' : (e) => {
        let domainMessages = document.querySelectorAll(".domainmessage");
        if(domainMessages){
            for(let i = 0; i < domainMessages.length; i++) {
                domainMessages[i].removeAttribute('data-message');
            }
        }
        let checkDomainForm = document.querySelectorAll(".checkdomainform");
        if(checkDomainForm){
            for(let i = 0; i < checkDomainForm.length; i++) {
                checkDomainForm[i].removeAttribute('data-status');
            }
        }

    },

    'listenValidateDomain': () => {
        let domain = document.querySelector('body#be-sites-index input#domain');
        if(domain){
            domain.addEventListener('keyup', sn_site_env.confirmUniqueDomain, null);
            // domain.addEventListener('blur', sn_site_env.resetDomainInput, null);
        }
    },

    'initCreateEnvironment': (actionForm) => {

        let envZipDrop = actionForm.querySelector('.zipdrop');
        if(envZipDrop){

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
                envZipDrop.addEventListener(e, sn_site_env.preventDefaults, false);
                document.body.addEventListener(e, sn_site_env.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(e => {
                envZipDrop.addEventListener(e, sn_site_env.highlight, false);
            });

            ['dragleave', 'drop'].forEach(e => {
                envZipDrop.addEventListener(e, sn_site_env.unhighlight, false);
            });

            envZipDrop.addEventListener('drop', (e) => {
                envZipDrop.querySelector("input[type='file']").files = e.dataTransfer.files;
                envZipDrop.querySelector('span').innerText = e.dataTransfer.files[0].name;
                envZipDrop.closest('.toz').classList.add('zip');
                console.log('dropped');
                e.preventDefault()
            });

        }
        actionForm.querySelector('form').classList.add('create');
        sn_site_env.listenValidateEnvironment(actionForm);
        sn_site_env.listenCancelAllActions();

    },

    'initCloneEnvironment': (actionForm) => {
        actionForm.querySelector('form').classList.add('clone');
        sn_site_env.listenValidateEnvironment(actionForm);
        sn_site_env.listenCancelAllActions();
    },

    'resetEnvironmentInput' : (actionForm) => {
        let environmentMessages = document.querySelectorAll(".environmentmessage");
        if(environmentMessages){
            for(let i = 0; i < environmentMessages.length; i++) {
                environmentMessages[i].removeAttribute('data-message');
            }
        }
        let checkEnvironmentForm = document.querySelectorAll(".checkenvironmentform");
        if(checkEnvironmentForm){
            for(let i = 0; i < checkEnvironmentForm.length; i++) {
                checkEnvironmentForm[i].removeAttribute('data-status');
            }
        }

    },

    'listenValidateEnvironment': (actionForm) => {
        let environment = actionForm.querySelector('input.environment');
        if(environment){
            environment.addEventListener('keyup', sn_site_env.confirmUniqueEnvironmentSlug, null);
            // domain.addEventListener('blur', sn_site_env.resetDomainInput, null);
        }
    },

    /* initialize all */
    'init': () => {

        sn_site_env.listenActionSite();
        sn_site_env.initSiteImport();
        sn_site_env.listenToggleNewSiteForm();
        sn_site_env.listenValidateDomain();
        if(sn_site_env.switchEnvironmentButtons) {
            sn_site_env.listenSwitchEnvironment();
        }
    }

}

sn_site_env.init();





