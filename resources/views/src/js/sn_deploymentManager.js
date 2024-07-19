/* ~~~~~~~~~~~~~~~~~~~~ deployment management ~~~~~~~~~~~~~~~~~~~~ */

let deployEnvironmentMenuW = document.querySelector("#deployEnvironmentMenuW");
let deployEnvironmentMenu = document.querySelector("#deployEnvironmentMenu");

const toggleDeployEnvironmentModal = (e) => {
    if(!document.body.hasAttribute('data-deployment_status')){
        document.body.dataset.deployment_status = 'init'
    }
    else {
        document.body.removeAttribute('data-deployment_status');
        setTimeout(() => {
            deployEnvironmentMenu.dataset.environment = 'Please select...';
        }, 250);
    }
}

const toggleDeployEnvironmentModalListener = () => {
    let toggleDeployEnvironmentModalButtons = document.querySelectorAll(".toggleDeployEnvironmentModal");
    for (let i = 0; i < toggleDeployEnvironmentModalButtons.length; i++) {
        toggleDeployEnvironmentModalButtons[i].removeEventListener('click', toggleDeployEnvironmentModal, null);
        toggleDeployEnvironmentModalButtons[i].addEventListener('click', toggleDeployEnvironmentModal, null);
    }
}

const toggleDeployEnvironmentMenu = (e) => {
    deployEnvironmentMenuW.classList.toggle('active');
}

const closeDeploymentEnvironmentMenu = (e) => {
    deployEnvironmentMenuW.classList.remove('active');
}

const toggleDeployEnvironmentMenuListener = () => {
    deployEnvironmentMenu.removeEventListener('click', toggleDeployEnvironmentMenu, null);
    deployEnvironmentMenu.addEventListener('click', toggleDeployEnvironmentMenu, null);
}

const leaveDeployEnvironmentListener = () => {
    deployEnvironmentMenuW.removeEventListener('mouseleave', closeDeploymentEnvironmentMenu, null);
    deployEnvironmentMenuW.addEventListener('mouseleave', closeDeploymentEnvironmentMenu, null);
}

const runDeployment = (e) => {
    let data = { 'environment': deployEnvironmentMenu.dataset.environment };
    sn_helpers.postData('/admin/environment/deploy', 'post', data)
        .then(data => {
            deployEnvironmentMenu.dataset.environment = 'Please select...';
            if(data.result === 'ok'){
                document.body.dataset.deployment_status = 'deployed';
            }
            else {
                document.body.dataset.deployment_status = 'error';
            }
        })
        .catch((error) => {
            deployEnvironmentMenu.dataset.environment = 'Please select...';
            document.body.dataset.deployment_status = 'error';
            // console.error('!!! --> runDeployment error:', error);
        });

}

const runDeploymentListener = () => {
    let runDeploymentButton = document.querySelector("#runDeployment");
    runDeploymentButton.addEventListener('click', runDeployment, null);
}

const doneDeployment = () => {
    deployEnvironmentMenu.dataset.environment = 'Please select...';
    document.body.removeAttribute('data-deployment_status');
    window.open(sn_globals.app_url);
    location.reload();
}

const doneDeploymentListener = () => {
    let doneDeploymentButtons = document.querySelectorAll(".doneDeployment");
    if(doneDeploymentButtons){
        for (let i = 0; i < doneDeploymentButtons.length; i++) {
            doneDeploymentButtons[i].addEventListener('click', doneDeployment, null);
        }
    }
}

const selectDeploymentEnvironment = (e) => {
    document.body.dataset.deployment_status = 'selected';
    deployEnvironmentMenu.dataset.environment = e.target.dataset.value;
    closeDeploymentEnvironmentMenu();
}

const selectDeploymentEnvironmentListener = () => {
    let selectDeploymentEnvironmentButtons = document.querySelectorAll("#deployEnvironmentMenuW ul li");
    for (let i = 0; i < selectDeploymentEnvironmentButtons.length; i++) {
        selectDeploymentEnvironmentButtons[i].removeEventListener('click', selectDeploymentEnvironment, null);
        selectDeploymentEnvironmentButtons[i].addEventListener('click', selectDeploymentEnvironment, null);
    }
    runDeploymentListener();
}

if(deployEnvironmentMenu) {
    toggleDeployEnvironmentModalListener();
    toggleDeployEnvironmentMenuListener();
    selectDeploymentEnvironmentListener();
    doneDeploymentListener();
}

if(deployEnvironmentMenuW){ leaveDeployEnvironmentListener(); }
















/* ~~~~~~~~~~~~~~~~~~~~ toggle site - these elements do not exist yet. and might not ever... ~~~~~~~~~~~~~~~~~~~~ */
let toggleViewSiteW = document.querySelector("#toggleViewSiteW");
let toggleViewSite = document.querySelector("#toggleViewSite");

const toggleViewSiteMenu = (e) => {
    toggleViewSiteW.classList.toggle('active');
}

const closeViewSiteMenu = (e) => {
    toggleViewSiteW.classList.remove('active');
}

const toggleViewSiteListener = () => {
    toggleViewSite.removeEventListener('click', toggleViewSiteMenu, null);
    toggleViewSite.addEventListener('click', toggleViewSiteMenu, null);
}

const leaveViewSiteListener = () => {
    toggleViewSiteW.removeEventListener('mouseleave', closeViewSiteMenu, null);
    toggleViewSiteW.addEventListener('mouseleave', closeViewSiteMenu, null);
}

const changeViewSite = (e) => {
    window.open('https://' + e.target.dataset.value, '_self');
}

const changeViewSiteListener = () => {
    let changeViewSiteButtons = document.querySelectorAll("#manageSiteTogglesW ul li");
    for (let i = 0; i < changeViewSiteButtons.length; i++) {
        changeViewSiteButtons[i].removeEventListener('click', changeViewSite, null);
        changeViewSiteButtons[i].addEventListener('click', changeViewSite, null);
    }
}

if(toggleViewSite) {
    toggleViewSiteListener();
    changeViewSiteListener();
}
if(toggleViewSiteW){
    leaveViewSiteListener();
}


