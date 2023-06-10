
/**
 * 当前登录用户保存的一些个性化设置
 */
export default {
  get: function(key, defaultValue=null) {
    let value = localStorage.getItem(window.$_main.userId + '_' + key);
    return (value === null) ? defaultValue : JSON.parse(value);
  },
  set: function(key, value) {
    localStorage.setItem(window.$_main.userId + '_' + key, JSON.stringify(value));
  },
  remove: function(key) {
    localStorage.removeItem(window.$_main.userId + '_' + key);
  }
};