/**
 * 判断字符串是否为空
 * @param {String} str
 * @return {Boolean}
 */
export function stringIsBlank(str) {
  return str == undefined || str == null || str.trim() == '';
};
