/**
 * 将通用数据做为全局
 */

import './main.js';
import './domain.js';
import './http.js';
import './theme.js';
import './L.js';
// import './cache.js';


export default {
  data() {
    return {
      theme: window.$_theme
    }
  },
  computed: {
    $_L: () => window.$_L,
    $_domain:()=>window.$_domain,
    $_http:()=>window.$_http,
    $_cache: () => window.$_cache,
  }
};
