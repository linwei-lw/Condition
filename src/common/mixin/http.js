/**
 * http请求后台服务模块
 */
import axios from 'axios';
import qs from 'qs';

axios.defaults.withCredentials = true;

let headers = {'Content-Type': 'application/json;charset=UTF-8'};
let isTimeout = false;

const http = {
  authorization: (token) => {
    headers.Authorization = token;
  },

  get: (url, params, quiet=false) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + (params ? (qs.stringify(params) + '&') : '') + new Date().getTime();
    return axios({
      headers: headers,
      method: 'get',
      url: `${window.$_domain.WEB_PATH}h5${url}`
    })
    .then(r => r.data)
    .then(r => {
      if (r.status == 1) {
        return r.result;
      } else if (r.status == -1) {
        isTimeout = true;
        let page = r.result || 'index.html';
        $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
      } else {
        !quiet && $_alert.error(r.result);
      }
      throw r;
    });
  },

  post: (url, params, quiet=false) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + new Date().getTime();
    // console.log(`${window.$_domain.WEB_PATH}h5${url}`);
    return axios({
      headers: headers,
      method: 'post',
      url: `${window.$_domain.WEB_PATH}h5${url}`,
      data: params
    })
    .then(r => r.data)
    .then(r => {
      if (r.status == 1) {
        return r.result;
      } else if (r.status == -1) {
        isTimeout = true;
        let page = r.result || 'index.html';
        $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
      } else {
        !quiet && $_alert.error(r.result);
      }
      throw r;
    }).catch(err=>{
    });
  },

  postxhyc: (url, params, quiet=false) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + new Date().getTime();
    // console.log(`${window.$_domain.WEB_ROOT}${url}`);
    if(url.indexOf('http://')!=-1){
      return axios({
        headers: headers,
        method: 'post',
        url: url,
        data: params
      })
      .then(r => {
        // isTimeout = true;
        // console.log(r,"成功");
         return r.data
      }).then(r=>{
        if (r.status == 1) {
          if(r.result.hasOwnProperty(encry)){
           return result(r.result)
          }else{
            return r.result;
          }
        // } else if (r.status == -1) {
        //   isTimeout = true;
        //   let page = r.result || 'index.html';
        //   $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
        } else {
          $_alert.error($_L.get('请求错误'))
        //   !quiet && $_alert.error(r.result);
        }
      })

        .catch(err=>{
        // console.log(err,"返回错误");
      });
    }else{
      return axios({
        headers: headers,
        method: 'post',
        url: `${window.$_domain.WEB_ROOT}${url}`,
        data: params
      })
      .then(r => {
        // isTimeout = true;
        // console.log(r,"成功");
         return r.data
      }).then(r=>{
        return r
        // if (r.status == 1) {
        //   if(r.result.hasOwnProperty(encry)){
        //    return result(r.result)
        //   }else{
        //     return r.result;
        //   }
        // // } else if (r.status == -1) {
        //   // isTimeout = true;
        // //   let page = r.result || 'index.html';
        // //   $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
        // } else {
        // //   !quiet && $_alert.error(r.result);
        //   $_alert.error($_L.get('请求错误'))
        // }
      }).catch(err=>{
        // console.log(err,"返回错误");
      });
    }

  },
  getxhyc: (url, params, quiet=false) => {
    if (isTimeout) return;
    url += (url.indexOf('?') > 0 ? '&' : '?') + (params ? (qs.stringify(params) + '&') : '') + new Date().getTime();
    // console.log(`${window.$_domain.WEB_ROOT}${url}`);
    if(url.indexOf('http://')!=-1){
      return axios({
        headers: headers,
        method: 'get',
        url: url,
      })
      .then(r => {
        // isTimeout = true;
        // console.log(r,"成功");
         return r.data
      }).then(r=>{
        if (r.status == 1) {
          if(r.result.hasOwnProperty(encry)){
           return result(r.result)
          }else{
            return r.result;
          }
        // } else if (r.status == -1) {
          // isTimeout = true;
        //   let page = r.result || 'index.html';
        //   $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
        } else {
          $_alert.error($_L.get('请求错误'))
        //   !quiet && $_alert.error(r.result);
        }
      })

        .catch(err=>{
        // console.log(err,"返回错误");
      });
    }else{
      return axios({
        headers: headers,
        method: 'get',
        url: `${window.$_domain.WEB_ROOT}${url}`,
      })
      .then(r => {
        // isTimeout = true;
        // console.log(r,"成功");
         return r.data
      }).then(r=>{
        if (r.status == 1) {
          if(r.result.hasOwnProperty(encry)){
           return result(r.result)
          }else{
            return r.result;
          }
        // } else if (r.status == -1) {
          // isTimeout = true;
        //   let page = r.result || 'index.html';
        //   $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
        } else {
          $_alert.error($_L.get('请求错误'))
        //   !quiet && $_alert.error(r.result);
        }
      }).catch(err=>{
        // console.log(err,"返回错误");
      });
    }

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
  if(url.indexOf('http://')!=-1){
    xhr.open(method, `${url}`, false);
  }else{
    xhr.open(method, `${window.$_domain.WEB_PATH}h5${url}`, false);
  }
  xhr.withCredentials = true;
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', headers.Authorization);
  xhr.send(params);

  let r = JSON.parse(xhr.responseText);
  if (r.status == 1) {
    if(r.result.hasOwnProperty(encry)){
     return result(r.result)
    }else{
      return r.result;
    }
  } else if (r.status == -1) {
    isTimeout = true;
    let page = r.result || 'index.html';
    $_alert.error('您未登录或会话超时，请返回登录界面!', null, ()=>{location.href=page}, true);
  } else {
    !quiet && $_alert.error(r.result);
  }
  throw r;
}
function result({encry,result}) {
  if (!encry || !result) return result;
  let array = [];
  for (let i=0, len=result.length; i<len; i++) {
    array.push(result.charCodeAt(i));
  }
  return JSON.parse(pako.ungzip(new Uint8Array(array),{to:'string'}));
}


window.$_http = http;
