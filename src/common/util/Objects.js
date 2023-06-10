
/**
 * 把对象所有属性复制给另一个对象
 * @param {Map} fromMap 被复制对象
 * @param {Map} destMap 目标对象
 * @param {Set} [excludeKeys] 被排除的属性
 * @return {Map} 返回目标对象
 */
export function objCopyTo(fromMap, destMap, excludeKeys=null) {
  if (!destMap || !fromMap) return destMap;
  for (let key in fromMap) {
    if (excludeKeys && excludeKeys.has(key)) continue;
    destMap[key] = fromMap[key];
  }
  return destMap;
}

/**
 * 把对象复制一份
 * @param {Map} map 被复制对象
 * @param {Set} [excludeKeys] 被排除的属性
 * @return {Map} 复制对象
 */
export function objClone(map, excludeKeys=null) {
  if (!map) return map;
  let destMap = {};
  for (let key in map) {
    if (excludeKeys && excludeKeys.has(key)) continue;
    destMap[key] = map[key];
  }
  return destMap;
}

/**
 * 把数组每个对象复制一份
 * @param {Array} array 被复制对象
 * @param {Set} [excludeKeys] 被排除的属性
 * @return {Array} 复制数组对象
 */
export function objsClone(array, excludeKeys=null) {
  if (!array || array.length == 0) return array;
  let _array = [];
  for (let i=0,len=array.length; i<len; i++) {
    _array.push(objClone(array[i], excludeKeys));
  }
  return _array;
}

/**
 * 判断对象是否为空
 * @param {Map} map MAP对象
 * @param {Boolean} [allowBlank] 是否允许值为空
 * @param {Set} [excludeKeys] 被排除的属性
 * @return {Boolean}
 */
export function objIsEmpty(map, allowBlank=false, excludeKeys=null) {
  if (!map) return true;
  let value;
  for (let key in map) {
    if (excludeKeys && excludeKeys.has(key)) continue;
    if (allowBlank) return false;
    value = map[key];
    if (value !== null && value !== '' && value != undefined) {
      return false;
    }
  }
  return true;
}
