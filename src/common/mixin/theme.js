/**
 * 皮肤样式主题模块
 */
let style = {};

style.blue = {
  color: 'rgba(64,150,209,1)',               //主打颜色 #4096D1
  menubar_color: '#2C78BF',                  //菜单栏颜色
  selected_color: '#B9D5EA'                  //选中颜色(用于选中表格、列表等的底色)
};

let theme = {
  bg_color: '#E8EAED',                       //背景颜色
  border_color_dark: '#AEBAC5',              //边框深色
  border_color_light: '#D6D6D6',             //边框浅色
  alternate_colors: ['#FFFFFF','#FAFAFA'],   //交替颜色(用于表格类的间隔行底色)
  list_hover_color: '#FCF0C1',               //鼠标浮动颜色(用于选中表格、列表等的鼠标经过的底色)
  inputHeight: 32 ,                          //输入框默认高度
  popup: {
    borderRadius: '0',
    boxShadow: '0px 0px 8px 0px RGBA(0, 0, 0, 0.3)',
    border: 0,
    overflow: 'hidden',
  },
};

let zindex = 2000;
theme.zindex = () => zindex++;

theme.change = name => {
  name = style[name];
  for (let key in name) {
    theme[key] = name[key];
  }
};

theme.change('blue');

theme.rgba = (rgba, a) => {
  return rgba.replace(',1)', ','+a+')');
}

export default window.$_theme = theme;
