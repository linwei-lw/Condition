/**
 * 多语言转换模块
 */
let L = {};

let main = window.$_main.root ? window.$_main.root.$_L : null;

L.get = (str, ...vars) => {
  if (main) return main.get(str, vars);
  if (vars && vars.length > 0) {
    for (let i=0; i<vars.length; i++) {
      str = str.replace(new RegExp("\\{"+i+"\\}","g"), vars[i]);  
    }
  }
  return str;
}

export default window.$_L = L;