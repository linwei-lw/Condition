/**
 * 将通用数据做为全局
 */

// import md5 from 'js-md5'
import crypto from 'crypto';
let seed = 0;
window.$_uuid = name => name + (seed++);

//==============================================================================================================

window.$_main = {
  userId: null,
  sessionId: uuid(),
  page: null,
  root: null,
  oldSessionId:null,
  init: (gps_web_url, gps_xxx_url) => {
    domain(gps_web_url);
    let params = {};
    gps_xxx_url.split(/[?&#/]/).forEach(kv => {
      kv = kv.split('=');
      kv.length > 1 && (params[kv[0]] = kv[1]);
    });
    if (!params.userId) return alert($_L.get('没有账号参数！'));
    if (!params.page) return alert($_L.get('没有页面参数！'));

    window.$_main.userId = params.userId;
    window.$_main.page = params.page;
    window.$_main.password = params.password;
    params.password&&(window.$_main.mdPassword = crypto.createHash('md5').update(params.password).digest('hex'));
    window.$_main.oldSessionId = params.sessionId;
    window.$_main.root && (window.$_main.sessionId = params.sessionId || window.$_main.sessionId);
    params.sessionId && (window.$_main.sessionId = params.sessionId || window.$_main.sessionId);
    //   $_main.mdPassword=crypto.createHash('md5').update('passwordszsg').digest('hex')
    //   window.$_main.sessionId= 'cXyBr5ZeStOdndJ97Mi4qw';
    window.$_main.http.authorization(params.sessionId);
  },

  exit: () => {
    // window.$_main.http.get('/exit', {sessionId:window.$_main.sessionId}, true);
  }
};

function uuid() {
  let S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

//==============================================================================================================


function domain(url) {
  let WEB_HOST, WEB_NAME='gps-web', WEB_HTTP = location.protocol == 'https:' ? 'https' : "http";
  // 原来
  if (location.host != 'localhost:8081' && document.referrer) {
    let array = document.referrer.split('/');
    array.length > 2 && (WEB_HOST = array[2] || WEB_HOST);
    array.length > 3 && (WEB_NAME = array[3] || WEB_NAME);
    WEB_NAME='gps-web'
  } else {
    WEB_HOST = url.split('/')[2];
    WEB_NAME = url.split('/')[3];
    // WEB_HOST = "192.168.2.75:6779";
  // WEB_NAME = "gps-web";
  }


  let ip=WEB_HOST.split(':')[0]
  window.$_main.domain = {
    WEB_HTTP: WEB_HTTP,
    WEB_HOST: WEB_HOST,                                             // ip:port
    WEB_ROOT: WEB_HTTP + '://' + WEB_HOST + '/',                    // http://ip:port/
    WEB_NewROOT: WEB_HTTP + '://' + ip + ':8085/',                    // http://ip:port/
    WEB_PATH: WEB_HTTP + '://' + WEB_HOST + '/' + WEB_NAME + '/',   // http://ip:port/gps-xxx/
    WEB_NAME: WEB_NAME,                                             // gps-xxx
  };

  if (WEB_HOST == window.$_domain.WEB_HOST) {
    try {
      let i = 0, main = window.parent;
      while (main && i++ < 10) {
        if (main.$_cache) {
          window.$_main.root = main;
          break;
        }
        main = main.parent;
      }
    } catch (e) {}
  }
}


//==============================================================================================================


/**
 * http请求后台服务模块
 */
import axios from 'axios';
import qs from 'qs';

let headers = {'Content-Type': 'application/json;charset=UTF-8'};
let isTimeout = false;

window.$_main.http = {
  authorization: (token) => {
    headers.Authorization = token;
  },

  get: (url, params, quiet=false,header=headers) => {
    // console.log(`${window.$_main.domain.WEB_PATH}${url}`);
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + (params ? (qs.stringify(params) + '&') : '') + new Date().getTime();
    if(url.indexOf('http://')==-1){
      url= `${window.$_main.domain.WEB_NewROOT}${url}`
    }
    return axios({
      withCredentials: true,
      headers: header,
      method: 'get',
      url: url
    })
    .then(r => r.data)
    // .then(r => r.data)
    .then(r => {
      if (r.status == 1) {
        return r.result;
      } else if (r.status == -1) {
        isTimeout = true;
        $_alert.error($_L.get('您未登录或会话超时，请重新登录!'), null, null, true);
      } else {
        !quiet && $_alert.error(r.result);
      }
      throw r;
    });
  },

  post: (url, params, quiet=false,header=headers) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + new Date().getTime();
    return axios({
      withCredentials: true,
      headers: header,
      method: 'post',
      url: `${window.$_main.domain.WEB_NewROOT}${url}`,
      data: params
    })
    .then(r => r.data)
    .then(r => {
      if (r.status == 1) {
        return r.result;
      } else if (r.status == -1) {
        isTimeout = true;
        $_alert.error($_L.get('您未登录或会话超时，请重新登录!'), null, null, true);
      } else {
        !quiet && $_alert.error(r.result);
      }
      throw r;
    });
  },

  syncGet: (url, params, quiet=false) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + (params ? (qs.stringify(params) + '&') : '') + new Date().getTime();
    return sync('GET', url, null, quiet);
  },

  syncPost: (url, params, quiet=false) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + new Date().getTime();
    return sync('POST', url, JSON.stringify(params), quiet);
  },
}

function sync(method, url, params, quiet) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, `${window.$_main.domain.WEB_NewROOT}${url}`, false);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', headers.Authorization);
  xhr.send(params);

  let r = JSON.parse(xhr.responseText);
  if (r.status == 1) {
    return r.result;
  } else if (r.status == -1) {
    isTimeout = true;
    $_alert.error($_L.get('您未登录或会话超时，请返回登录界面!'), null, null, true);
  } else {
    !quiet && $_alert.error(r.result);
  }
  throw r;
}

