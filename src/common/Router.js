
import Vue from 'vue';
import VueRouter from 'vue-router';

const routes = [
    { path: '/PeopleModule', name: 'CdInfoRModule', component: resolve => require.ensure([], () => resolve(require('../modules/People/PeopleModule.vue')), 'PeopleModule') },

];

Vue.use(VueRouter);

export default new VueRouter({
    mode: 'hash',
    base: __dirname,
    routes: routes
});
