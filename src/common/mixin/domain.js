/**
 * 当前应用域名地址模块
 */
let WEB_HTTP = 'http';
let WEB_NAME = 'gps-web';
let WEB_HOST = location.host;

if (location.protocol == 'https:') {
  WEB_HTTP = 'https';
}
if (WEB_HOST == 'localhost:8080'||WEB_HOST == 'localhost:8081'||WEB_HOST == '192.168.2.110:8080'||WEB_HOST == '192.168.2.110:8081') {//本地开发指向
  WEB_HOST = '192.168.2.91:8085';
}
if (location.pathname && location.pathname != '/') {
  let name = location.pathname.split('?')[0];
  name = name.split('/')[1];
  if (name.indexOf('.') == -1) {
    WEB_NAME = name;
  }
}
export default window.$_domain = {
  WEB_HTTP: WEB_HTTP,
  WEB_HOST: WEB_HOST,                                           // ip:port
  WEB_ROOT: WEB_HTTP + '://' + WEB_HOST + '/',                  // http://ip:port/
  WEB_PATH: WEB_HTTP + '://' + WEB_HOST + '/' + 'gps-web' + '/', // http://ip:port/gps-xxx/
  WEB_NAME: 'gps-web',                                           // gps-xxx
};
