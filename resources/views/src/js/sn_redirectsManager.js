

window.sn_redirects = {

    'redirectsW': document.querySelector('#redirectsW') ? document.querySelector('#redirectsW') : null,
    'redirectsCES': document.querySelectorAll('#redirectsW [contenteditable]') ? document.querySelectorAll('#redirectsW [contenteditable]') : null,
    'redirectSelects': document.querySelectorAll('#redirectsW select') ? document.querySelectorAll('#redirectsW select') : null,
    'redirectActives': document.querySelectorAll("#redirectsW input[name='active']") ? document.querySelectorAll("#redirectsW input[name='active']") : null,
    'redirectsDestroyers': document.querySelectorAll('#redirectsW span') ? document.querySelectorAll('#redirectsW span') : null,
    'toggleNewRedirectFormButtons' : document.querySelectorAll('.toggleNewRedirectForm') ? document.querySelectorAll('.toggleNewRedirectForm') : null,

    'getRedirectSettings': (target) => {
        let data = {};
        data['redirect_id'] = target.dataset.redirect_id;
        data['old_url'] = target.querySelector("ul li:nth-child(1)").innerText;
        data['new_url'] = target.querySelector("ul li:nth-child(2)").innerText;
        data['type'] = target.querySelector("select[name='type']").value;
        if(target.querySelector("input[name='active']").checked){
            target.classList.add('active');
            data['active'] = 'y';
        }
        else {
            target.classList.remove('active');
        }
        return data;
    },

    'focusRedirect': (e) => {
        e.target.dataset.current = e.target.innerText;
    },

    'saveRedirect': (e) => {
        console.log('e.target.innerText: ', e.target.innerText);
        console.log('e.target.dataset.cv: ', e.target.dataset.current);
        if(e.target.innerText !== e.target.dataset.current){
            let target = e.target.closest("[data-redirect_id]");
            let data = sn_redirects.getRedirectSettings(target);
            sn_helpers.postData('/admin/redirects/save', 'post', data)
                .then(response => {
                    document.body.classList.add('updated');
                    target.dataset.redirect_id = response.redirect_id;
                    setTimeout(() => {
                        document.body.classList.remove('updated');
                    }, 2000);
                })
                .catch((error) => {
                    console.error('!!! --> saveRedirect error:', error);
                });
        }
    },

    'listenSaveRedirect': () => {
        if (sn_redirects.redirectsCES) {
            for (let r = 0; r < sn_redirects.redirectsCES.length; r++) {
                sn_redirects.redirectsCES[r].removeEventListener('focus', sn_redirects.focusRedirect);
                sn_redirects.redirectsCES[r].addEventListener('focus', sn_redirects.focusRedirect, null);
            }
        }
        if (sn_redirects.redirectsCES) {
            for (let r = 0; r < sn_redirects.redirectsCES.length; r++) {
                sn_redirects.redirectsCES[r].removeEventListener('blur', sn_redirects.saveRedirect);
                sn_redirects.redirectsCES[r].addEventListener('blur', sn_redirects.saveRedirect, null);
            }
        }
        if (sn_redirects.redirectActives) {
            for (let a = 0; a < sn_redirects.redirectActives.length; a++) {
                sn_redirects.redirectActives[a].removeEventListener('click', sn_redirects.saveRedirect);
                sn_redirects.redirectActives[a].addEventListener('click', sn_redirects.saveRedirect, null);
            }
        }

        if (sn_redirects.redirectSelects) {
            for (let a = 0; a < sn_redirects.redirectSelects.length; a++) {
                sn_redirects.redirectSelects[a].removeEventListener('change', sn_redirects.saveRedirect);
                sn_redirects.redirectSelects[a].addEventListener('change', sn_redirects.saveRedirect, null);
            }
        }
    },

    'destroyRedirect': (e) => {
        let target = e.target.closest("[data-redirect_id]")
        let data = sn_redirects.getRedirectSettings(target);
        sn_helpers.postData('/admin/redirects/destroy', 'post', data)
            .then(response => {
                document.body.classList.add('updated');
                target.remove();
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);
            })
            .catch((error) => {
                console.error('!!! --> destroyRedirect error:', error);
            });
    },

    'toggleNewRedirectForm': () => {
        document.body.toggleAttribute('data-create');
    },

    'listenToggleRedirectForm': () => {
        if (sn_redirects.toggleNewRedirectFormButtons) {
            for (let x = 0; x < sn_redirects.toggleNewRedirectFormButtons.length; x++) {
                sn_redirects.toggleNewRedirectFormButtons[x].removeEventListener('click', sn_redirects.toggleNewRedirectForm);
                sn_redirects.toggleNewRedirectFormButtons[x].addEventListener('click', sn_redirects.toggleNewRedirectForm, null);
            }
        }
    },

    'listenDestroyRedirect': () => {
        if (sn_redirects.redirectsDestroyers) {
            for (let x = 0; x < sn_redirects.redirectsDestroyers.length; x++) {
                sn_redirects.redirectsDestroyers[x].removeEventListener('click', sn_redirects.destroyRedirect);
                sn_redirects.redirectsDestroyers[x].addEventListener('click', sn_redirects.destroyRedirect, null);
            }
        }
    },


}


/* ~~~~~~~~~~~~~~~~~~~~ init ~~~~~~~~~~~~~~~~~~~~ */

window.addEventListener('load', function () {
    sn_redirects.listenSaveRedirect();
    sn_redirects.listenDestroyRedirect();
    sn_redirects.listenToggleRedirectForm();
});
