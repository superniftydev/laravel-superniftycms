'use strict';

import '../bootstrap';
import Alpine from 'alpinejs';
import Isotope from 'isotope-layout';
import Sortable from 'sortablejs';



window.sn_dashboard = {

    'sitePages': document.querySelectorAll('#pages ul') ? document.querySelectorAll('#pages ul') : null,
    'sorting': false,
    'doneSorting': document.getElementById('doneSorting'),





    'saveDashboardButtonSortOrder': () => {

            let so = [];
            let buttons = document.querySelectorAll('#pages ul li');
            if(buttons){
                for (let a = 0; a < buttons.length; a++) {
                    so.push(buttons[a].dataset.url);
                }
            }


        console.log('sort order: ', so);

            /*

        let buttonSortData = {
            'environment_id': document.body.dataset.environment_id,
            'button_sort_order': buttonSortOrder,
        };

        console.log('buttonSortData: ', buttonSortData);


        sn_helpers.postData('/admin/dashboard/sort', 'post', buttonSortData)
            .then(data => {
                document.body.classList.add('updated');
                setTimeout(() => {
                    document.body.classList.remove('updated');
                }, 2000);
            })
            .catch((error) => { console.error('!!! --> saveDashboardTopicSortOrder error:', error); });
        console.log('buttonSortOrder', buttonSortOrder);


             */

    },

    'closeSorting': () => {
        sn_dashboard.sorting = false;
        document.body.removeAttribute('data-sortingbuttons');
        console.log('!!! --> done sorting dashboard');
        sn_dashboard.doneSorting.removeEventListener('click', sn_dashboard.closeSorting, null);
    },

    'initSortDashboardDisplay': () => {
        if(sn_dashboard.sitePages){

            console.log('ass');



            sn_dashboard.sitePagesSortables = {};
            for (let dts = 0; dts < sn_dashboard.sitePages.length; dts++) {
                sn_dashboard.sitePagesSortables[dts] = Sortable.create(sn_dashboard.sitePages[dts], {
                    draggable: 'li',
                    group: {
                        name: "sortable-list-2",
                        pull: true,
                        put: true,
                    },
                    direction: 'vertical',
                    handle: ".handle",

                    /*

                    onStart: function (evt) {
                        document.body.dataset.sortingbuttons = 'init';
                        sn_dashboard.sorting = true;
                        sn_dashboard.doneSorting.addEventListener('click', sn_dashboard.closeSorting, null);
                    },

                    onMove: function (evt) {
                        // et.to will always be the list you are over but evt.related
                        // will be === only the very first time evt.to changes
                        if (evt.related === evt.to) {
                            // Sortable.utils.toggleClass(evt.to, 'highlight', true);
                        }
                    },

                     */


                    onEnd: function (e) {
                        sn_dashboard.saveDashboardButtonSortOrder();
                        setTimeout(() => {
                         }, 500);
                    },

                });
            }
        }
    },

}
sn_dashboard.initSortDashboardDisplay();
// sn_dashboard.listenDashboardActions();
