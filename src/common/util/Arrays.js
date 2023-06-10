
/**
 * 将数组转成 MAP 结构体
 * @param {Array} array 元素数组
 * @param {String} [key] 组成map的key值是从元素的哪个字段取(默认值:id)
 * @param {Object} [map] 基于存在的map对象(默认值:{})
 * @returns {Object} 返回MAP结构体
 */
export function arrayToMap (array, key='id', map={}) {
  if (!array || array.length == 0) return map;
  for (let i=0,len=array.length,item; i<len; i++) {
    item = array[i];
    map[item[key]] = item;
  }
  return map;
};

/**
 * 在数组中查找索引号
 * @param {Array} array 
 * @param {String} field 
 * @param {*} value 
 * @returns {Number} 返回索引号
 */
export function arrayIndexOf (array, field, value) {
  for (let i=0, len=array.length; i<len; i++) {
    if (array[i][field] === value) return i;
  }
  return -1;
}

/**
 * 从数组中删除元素
 * @param {Array} array 
 * @param {Object} item 
 * @returns {Number} 返回剩余数
 */
export function arrayRemoveItem (array, item) {
  if (!array) return -1;
  let i = array.indexOf(item);
  i != -1 && array.splice(i, 1);
  return array.length;
};

/**
 * 从数组中删除元素
 * @param {Array} array 
 * @param {String} field 
 * @param {*} value 
 */
export function arrayRemoveValue (array, field, value) {
  if (!array) return null;
  for (let i=0, len=array.length, item; i<len; i++) {
    item = array[i];
    if (item[field] === value) {
      array.splice(i, 1);
      return item;
    }
  }
  return null;
};

/**
 * 按过滤条件将数组中元素删除
 * @param {Array} array 
 * @param {Function} filter (item, index, array) 返回true删除,false保留
 * @returns {Number} 返回剩余数
 */
export function arrayRemoveFilter (array, filter) {
  if (!array || array.length == 0) return 0;
  for (let i=array.length-1; i>=0; i--) {
    filter(array[i], i, array) === true && array.splice(i,1);
  }
  return array.length;
};

/**
 * 从数组中查询元素
 * @param {Array} array 
 * @param {String} field 
 * @param {*} value 
 * @returns {*} 返回符合条件的第一个元素
 */
export function arrayFindItem (array, field, value) {
  if (!array) return null;
  for (let i=0, len=array.length; i<len; i++) {
    if (array[i][field] === value) {
      return array[i];
    }
  }
  return null;
};

/**
 * 从数组中查询元素
 * @param {Array} array 
 * @param {String} field 
 * @param {*} value 
 * @returns {Array} 返回符合条件的所有元素
 */
export function arrayFindItems (array, field, value) {
  if (!array) return [];
  let result = [];
  for (let i=0, len=array.length; i<len; i++) {
    if (array[i][field] === value) {
      result.push(array[i]);
    }
  }
  return result;
};

/**
 * 获取数组每个元素字段的值
 * @param {Array} array 
 * @param {String} field 
 * @returns {Array} 返回数组每个元素字段的值
 */
export function arrayGetValue (array, field) {
  if (!array) return [];
  let result = [];
  for (let i=0, len=array.length; i<len; i++) {
    result.push(array[i][field]);
  }
  return result;
};

export function arraySort(array, field=null, asc=true) {
  if (!array || array.length == 0) return array;
  return array.sort((a,b) => {
    return (asc ? 1 : -1) * compare(a, b, field);
  });
}


let CHINA = {'零':10,'一':11,'二':12,'三':13,'四':14,'五':15,'六':16,'七':17,'八':18,'九':19,'十':20};
export function compare(v1, v2, field=null) {
  if (v1 === null || v1 == undefined) return -1;
  if (v2 === null || v2 == undefined) return 1;
  
  v1 = field ? v1[field] : v1; 
  v2 = field ? v2[field] : v2;
  
  if (v1 == v2) return 0;
  if (v1 === null || v1 == undefined) return -1;
  if (v2 === null || v2 == undefined) return 1;
  
  let i1=!isNaN(v1), i2=!isNaN(v2);
  v1 = String(v1);
  v2 = String(v2);
  if (i1 || i2) {
    return (i1 && i2) ? (v1.length>v2.length ? 1 : v1.length<v2.length ? -1 : Number(v1) > Number(v2) ? 1 : -1) : (i1 ? -1 : 1);
  }
  for (let i=0, len = Math.min(v1.length, v2.length), o1, o2, n1, n2; i<len; i++) {
    o1 = v1.charAt(i); o2 = v2.charAt(i);
    if(o1 == o2) continue;
    n1 = CHINA[o1]||Number(o1); n2 = CHINA[o2]||Number(o2); 
    if (!isNaN(n1) && !isNaN(n2)) {
      return n1 > n2 ? 1 : -1;
    }
    return o1.localeCompare(o2,"zh");
  }
  let len = v1.length - v2.length;
  return len == 0 ? 0 : (len > 0 ? 1 : -1);
}