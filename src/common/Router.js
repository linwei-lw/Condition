
import Vue from 'vue';
import VueRouter from 'vue-router';

const routes = [

    { path: '/CdRuleModule', name: 'CdRuleModule', component: resolve => require.ensure([], () => resolve(require('../modules/cdRule/CdRuleModule.vue')), 'CdRuleModule') },
    { path: '/CdInfoRModule', name: 'CdInfoRModule', component: resolve => require.ensure([], () => resolve(require('../modules/cdRule/CdInfoRModule.vue')), 'CdInfoRModule') },
    { path: '/CdParamsModule', name: 'CdParamsModule', component: resolve => require.ensure([], () => resolve(require('../modules/cdRule/CdParamsModule.vue')), 'CdParamsModule') },

];

Vue.use(VueRouter);

export default new VueRouter({
    mode: 'hash',
    base: __dirname,
    routes: routes
});
