import Vue from 'vue';

import 'babel-polyfill';
import '@/assets/icon.css';

import mixin from '@/common/mixin';
Vue.mixin(mixin);

import install from '@/components';
Vue.use(install);

import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

import ElementUI from 'element-ui';
Vue.use(ElementUI);

import router from '@/common/Router.js';
import IndexApp from './IndexApp.vue';
import axios from 'axios'
Vue.prototype.$http= axios

new Vue({
  router,
  render: h => h(IndexApp),
}).$mount('#app');
