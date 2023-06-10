import Vue from 'vue';
import { domLeftTop } from '@/components/util/Dom.js';

export default {
  /**
   * 把组件弹出在最上层
   * @param component 要弹出的组件
   * @param data:Object 为该组件设置data值
   * @param parent:String|DOM 在哪个DOM上居中
   * @param appendDom:DOM 在哪个DOM上插入
   */
  open: (component, data, parent, beforeMount=null, style=null, appendDom) => {
    let constructor = Vue.extend(component);
    let instance = new constructor({ data: data||null });
    beforeMount && beforeMount(instance);
    let div = document.createElement("div");
    if(appendDom){
      appendDom.appendChild(div);
    }else{
      document.body.appendChild(div);
    }
    instance.$mount(div);
    position(instance, parent, style);
    return instance;
  },
  position: (instance, parent, style) => {
    position(instance, parent, style);
  }
};

function position(instance, parent, style) {
  parent = parent || document.body;
  if (typeof parent === 'string') {
    parent = document.getElementById(parent) || document.body;
  }
  let {left, top} = domLeftTop(parent);
  let offsetWidth = parent.offsetWidth, offsetHeight = parent.offsetHeight, msgW = instance.$el.clientWidth, msgH = instance.$el.clientHeight;
  left = Math.max(0,(left + (offsetWidth - msgW) / 2));
  top = Math.max(0,(top + (offsetHeight - msgH) / 3));
  instance.$el.style.top = top + 'px';
  instance.$el.style.left = left + 'px';
  instance.$el.style['z-index'] = window.$_theme.zindex();
  if (style) {
    for (let key in style) {
      instance.$el.style[key] = style[key];
    }
  }
}
