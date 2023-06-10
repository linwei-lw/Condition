
import { arrayToMap } from '@/common/util/Arrays.js';

/**
 * 复制树结构体
 * @param {Array|Object} tree 树的根结点
 * @param {Boolean} [setParent] 是否需要设置父结点
 * @param {String} [parentField] 父结点字段
 * @param {String} [childrenField] 孩子结点字段
 * @returns {Array|Object} 返回复制后的树结构
 */
export function copyTree(tree, setParent=false, parentField='parent', childrenField='children', parent=null) {
  let copys = [], isarray = Array.isArray(tree);
  tree = isarray ? tree : [tree];
  for (let i=0,len=tree.length,node,copy; i<len; i++) {
    node = tree[i]; copy = {};
    for (let key in node) {
      if (key != parentField && key != childrenField) {
        copy[key] = node[key];
      }
    }
    if (node[childrenField]) {
      copy[childrenField] = copyTree(node[childrenField], setParent, parentField, childrenField, copy);
    }
    setParent && (copy[parentField] = parent);
    copys.push(copy);
  }
  return isarray ? copys : copys[0];
}

/**
 * 将数组转成 TREE 结构体
 * @param {Array} array 元素数组
 * @param {String} [id] 元素的id字段(默认值:id)
 * @param {String} [pid] 元素的父id字段(默认值:pid)
 * @param {Object} [map] 元素的map结构
 * @param {Object} [root] 元素的根节点
 * @param {String} [childrenKey] 保存子节点的字段
 * @returns {Array} 返回tree第一层数组
 */
export function arrayToTree(array, id='id', pid='pid', map=null, root=null, childrenKey='children') {
  if (!array || array.length == 0) return [];
  map = map || arrayToMap(array, id);
  let tree;
  if (root) {
	  root[childrenKey] ? (tree = root[childrenKey]) : (root[childrenKey] = tree = []);
  } else {
	  tree = [];
  }
  for (let i=0,len=array.length,item,parent,sons; i<len; i++) {
    item = array[i];
    parent = map[item[pid]];
    if (parent) {
      sons = parent[childrenKey];
      !sons && (sons = parent[childrenKey] = []);
      sons.push(item);
      item.parent = parent;
    } else {
      item.parent = root || null;
      tree.push(item);
    }
  }
  return tree;
};

/**
 * 从指定树结点nodes中查找符合条件的所有结点，查找规则是：结点属性field的值，等于数组values中其中一个
 * @param {Array} nodes 树结点
 * @param {Array} values 数组值
 * @param {String} field 结点属性
 * @param {String} [hasOwnField] 结点必须有该字段
 * @returns {Array} 返回符合的结点数组
 */
export function getNodesByValues(nodes, values, field='id', hasOwnField=null) {
  if (!nodes || !values || values.length == 0) return [];
  let _values = {};
  for (let i=0,len=values.length; i<len; i++) {
    _values[values[i]] = true;
  }
  nodes = Array.isArray(nodes) ? nodes : [nodes];
  return _getNodesByValues(nodes, _values, field, hasOwnField, [], values.length);
}

function _getNodesByValues(nodes, values, field='id', hasOwnField, array, left) {
  if (!nodes || nodes.length == 0) return array;
  for (let i=0,len=nodes.length,node; i<len; i++) {
    node = nodes[i];
    if (!hasOwnField || node.hasOwnProperty(hasOwnField)) {
      if (values[node[field]] === true) {
        array.push(node);
        if (--left == 0) return array;
      }
    }
    if (node.children && node.children.length > 0) {
      _getNodesByValues(node.children, values, field, hasOwnField, array, left);
    }
  }
  return array;
}

/**
 * 从指定树结点nodes中查找符合条件的一个结点，查找规则是：结点属性field的值等于value
 * @param {Array} nodes 树结点
 * @param {Object} value 数值
 * @param {String} field 结点属性
 * @param {String} [hasOwnField] 结点必须有该字段
 * @returns {Object} 返回符合的结点
 */
export function getNodeByValue(nodes, value, field='id', hasOwnField=null) {
  if (!nodes) return null;
  nodes = Array.isArray(nodes) ? nodes : [nodes];
  if (nodes.length == 0) return null;
  for (let i=0,len=nodes.length,node; i<len; i++) {
    node = nodes[i];
    if (!hasOwnField || node.hasOwnProperty(hasOwnField)) {
      if (node[field] === value) {
        return node;
      }
    }
    if (node.children && node.children.length > 0) {
    	node = getNodeByValue(node.children, value, field, hasOwnField);
    	if (node) return node;
    }
  }
  return null;
}

/**
 * 从指定树结点nodes中查找符合条件的结点，查找规则是：filter函数返回true
 * @param {Array} nodes 树结点
 * @param {Function} filter 过滤函数
 * @param {String} children children属性
 * @returns {Array} 返回结点集合
 */
export function getNodesByFilter(nodes, filter, children='children', result=null) {
  if (!nodes) return [];
  result = result || [];
  nodes = Array.isArray(nodes) ? nodes : [nodes];
  for (let i=0,len=nodes.length,node; i<len; i++) {
    node = nodes[i];
    filter(node) === true && result.push(node);
    node = node[children];
    if (node && node.length > 0) {
      getNodesByFilter(node, filter, children, result);
    }
  }
  return result;
}

/**
 * 将树结点，转成MAP结构
 * @param {Array} nodes 树结点
 * @param {String} key key属性
 * @param {String} children children属性
 * @param {String} [hasOwnField] 结点必须有该字段
 * @param {Map} [map] 覆盖MAP对象
 * @returns {Map} 返回MAP结构对象
 */
export function treeToMap(nodes, key='id', children='children', hasOwnField=null, map=null) {
  map = map || {};
  if (!nodes || nodes.length == 0) {
    return map;
  }
  for (let i=0,len=nodes.length,node; i<len; i++) {
    node = nodes[i];
    if (!hasOwnField || node.hasOwnProperty(hasOwnField)) {
      map[node[key]] = node;
    }
    node = node[children];
    if (node && node.length > 0) {
      treeToMap(node, key, children, hasOwnField, map);
    }
  }
  return map;
}

export function treeSearch(tree, text, hasOwnField=null, searchFun=null, max=99999999) {
  let nodes = tree.getNodes();
  if (nodes && nodes.length == 1) {
    nodes = nodes[0][tree.setting.data.key.children];
  }
  if (!nodes || nodes.length == 0) return [];
  return dgSearch([], nodes, text.toLowerCase(), hasOwnField, searchFun, tree.setting.view.nameFunction, tree.setting.view.hideFunction, tree.setting.data.key, max);
}

function dgSearch(results, nodes, text, hasOwnField, searchFun, nameFun, hideFun, keys, max){
  if (!nodes || nodes.length == 0) {
    return results;
  }
  for (let i=0,len=nodes.length,node,value; i<len; i++) {
    node = nodes[i];
    if (hideFun && hideFun(node) === true) continue;
    if (!hasOwnField || node.hasOwnProperty(hasOwnField)) {
      if (searchFun) {
        if (searchFun(node, text) === true) {
          results.push(node);
          if (results.length >= max) return results;
        }
      } else {
        value = nameFun ? nameFun(node) : node[keys.name];
        if (value) {
          value = value.toLowerCase();
          if (value.indexOf(text) >= 0) {
            results.push(node);
            if (results.length >= max) return results;
          }
        }
      }
    }
    dgSearch(results, node[keys.children], text, hasOwnField, searchFun, nameFun, hideFun, keys, max);
  }
  return results;
}
