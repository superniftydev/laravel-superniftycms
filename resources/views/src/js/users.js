'use strict';

window.userData = null;

window.sn_users = {

    'token': document.querySelector('meta[name="csrf-token"]').content,

    'actions': document.querySelectorAll("[data-a]"),
    'uuasf': document.querySelector('form.uuasf'),

    'inviteNewUserForm': document.getElementById("inviteNewUserForm"),
    'nameInput': document.getElementById("nameInput"),
    'userNameInputs': document.querySelectorAll(".usernameinput"),
    'emailInput': document.querySelector("input[name='email']"),
    'userStatusBar': document.getElementById("userStatusBar"),
    'userStatusLabel': document.getElementById("userStatusLabel"),
    'userStatusMessage': document.getElementById("userStatusMessage"),
    'userForm': document.getElementById("userForm"),
    'inputs': document.querySelectorAll("input[type='text']"),
    'topic_access_radios': document.querySelectorAll("input[name='access_settings[]']"),

    'action': (e) => {

        if(e.target.dataset.a === 'copyinvitationlink'){
            e.target.classList.add('copied');
            navigator.clipboard.writeText(e.target.dataset.invitation_link);
            setTimeout(() => {
                e.target.classList.remove('copied');
            }, 1000);

        }

        if(e.target.dataset.a === 'toggleinvitenewuserform'){
            document.body.toggleAttribute('data-displayaddnewuserform');
        }

        if(e.target.classList.contains('usernameinput')){
            if(sn_users.nameInput.value.length > 0){
                document.body.setAttribute('data-validnewuserform', 'y');
            }
            else {
                document.body.removeAttribute('data-validnewuserform');
            }
        }

        if(e.target.dataset.a === 'suspenduser'){
            let user_status;
            document.body.dataset.user_status === 'suspended' ? user_status = 'reinstated' : user_status = 'suspended';
            document.body.dataset.user_status = user_status;
            sn_users.uuasf.querySelector("input[name='status']").value = user_status;
            sn_users.uuas();
        }

        if(e.target.dataset.a === 'destroyuser'){
            if(!e.target.classList.contains('destroy')) {
                e.target.classList.add('destroy');
                e.target.addEventListener('mouseleave', function() {
                    setTimeout(() => {
                        e.target.classList.remove('destroy');
                    }, 1000);
                })
            }
            else {
                document.getElementById('destroyUserForm').submit();
            }
        }

    },

    'listenActions': () => {
        if(sn_users.actions.length > 0){
            for (let a = 0; a < sn_users.actions.length; a++) {
                sn_users.actions[a].removeEventListener('click', sn_users.action, null);
                sn_users.actions[a].addEventListener('click', sn_users.action, null);
            }
        }

        if(sn_users.userNameInputs.length > 0){
            for (let i = 0; i < sn_users.userNameInputs.length; i++) {
                sn_users.userNameInputs[i].removeEventListener('keyup', sn_users.action, null);
                sn_users.userNameInputs[i].addEventListener('keyup', sn_users.action, null);
            }
        }

    },

    'uuas' : () => {
        /* set the role */
        document.body.setAttribute('data-user_role', sn_users.uuasf.querySelector('input[name="role"]:checked').value);

        /* send updates to server */
        let formData = new FormData(sn_users.uuasf);
        sn_helpers.postData('/admin/uuas', 'post', Object.fromEntries(formData))
            .then(data => {
                console.log('!!! ::::::: --> sn_users.uuas response: ', data);
            })
            .catch((error) => { console.error('!!! --> sn_users.uuas error:', error); });
    },

    'listenUUAS' : (e) => {
        if(sn_users.uuasf){
            sn_users.uuasf.addEventListener('change', sn_users.uuas, null);
        }
    },

}


document.addEventListener('DOMContentLoaded', function() {
    sn_users.listenActions();
    sn_users.listenUUAS();
});


/*











*/
