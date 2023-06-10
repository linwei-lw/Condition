import Main from './Alert';

let instances = [];

  /**
   * 把提示框弹出在最上层
   * @param {String} type 提示框类型
   * @param {String} message 提示文本
   * @param {(String|DOM)} [parent] 在哪个DOM上居中
   * @param {Function} [callback] 按钮的回调函数,参数(true<是>按钮/false<否>按钮)
   * @param {Boolean} [showYesBtn] 是否显示<是>按钮
   * @param {Boolean} [showNoBtn] 是否显示<否>按钮
   */
const Alert = (type, message, parent, callback=null, showYesBtn=false, showNoBtn=false, yesText, noText,style) => {
  let instance = $_popup.open(Main, {type:type, message:message, callback:callback, showYesBtn:showYesBtn, showNoBtn:showNoBtn, yesText:yesText, noText:noText}, parent,null,style)
  
  if (!showYesBtn && !showNoBtn) {
    instances.push(instance);
    if (instances.length == 1) {
      document.addEventListener('mousedown', onMouseClick);
      document.addEventListener('keydown', onMouseClick);
    }
  }
  return instance;
};

Alert.success = (message, parent, callback=null, showYesBtn=false, showNoBtn=false,yesText, noText,style) => {
  return Alert('success', message||$_L.get('操作成功'), parent||document.body, callback, showYesBtn, showNoBtn,yesText, noText,style);
};

Alert.warn = (message, parent, callback=null, showYesBtn=false, showNoBtn=false,yesText, noText,style) => {
  return Alert('warn', message, parent||document.body, callback, showYesBtn, showNoBtn,yesText, noText,style);
};

Alert.error = (message, parent, callback=null, showYesBtn=false, showNoBtn=false,yesText, noText,style) => {
  return Alert('error', message, parent||document.body, callback, showYesBtn, showNoBtn,yesText, noText,style);
};
Alert.comfirm = (message, callback, parent, yesText, noText,style) => {
  return Alert('comfirm', message, parent||document.body, callback, true, true, yesText, noText,style);
};

function onMouseClick(e) {
  for (let i = instances.length - 1; i >= 0; i--) {
    if (instances[i].$el.contains(e.target)) {
      return;
    }
  }
  for (let i = instances.length - 1; i >= 0; i--) {
    document.body.removeChild(instances[i].$el);
    instances[i].$destroy();
  }
  instances.splice(0,instances.length);
  document.removeEventListener('mousedown', onMouseClick);
  document.removeEventListener('keydown', onMouseClick);
}

export default Alert;
