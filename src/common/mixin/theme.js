import Storage from "@/common/cache/Storage.js";

/**
 * 皮肤样式主题模块
 */
let _style = {};

_style.blue = {
  color: 'rgba(64,150,209,1)',               //主打颜色 #4096D1
  menubar_color: '#2C78BF',                  //菜单栏颜色
  selected_color: '#B9D5EA'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.coffee = {
  color: 'rgba(181,125,88,1)',               //主打颜色 #4B57D58
  menubar_color: '#A97452',                  //菜单栏颜色
  selected_color: '#E4D3C9'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.cyan = {
  color: 'rgba(63,145,107,1)',               //主打颜色 #3F916B
  menubar_color: '#138667',                  //菜单栏颜色
  selected_color: '#B4D5CE'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.green = {
  color: 'rgba(127,165,64,1)',               //主打颜色 #7FA540
  menubar_color: '#3B8B0E',                  //菜单栏颜色
  selected_color: '#BFDAAF'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.pink = {
  color: 'rgba(223,107,126,1)',              //主打颜色 #DF6B7E
  menubar_color: '#D04A63',                  //菜单栏颜色
  selected_color: '#EDC6CB'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.purple = {
  color: 'rgba(105,117,219,1)',              //主打颜色 #6975DB
  menubar_color: '#5061B9',                  //菜单栏颜色
  selected_color: '#C9CDEA'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.red = {
  color: 'rgba(198,68,68,1)',                //主打颜色 #C64444
  menubar_color: '#B62E2E',                  //菜单栏颜色
  selected_color: '#E7BDBE'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.black = {
  color: 'rgba(77,99,112,1)',                //主打颜色 #4C6370
  menubar_color: '#4C6370',                  //菜单栏颜色
  selected_color: '#C4CBD1'                  //选中颜色(用于选中表格、列表等的底色)
};

_style.yellow = {
  color: 'rgba(245,194,70,1)',                //主打颜色  #f5c246
  menubar_color: '#ffb002',                  //菜单栏颜色
  selected_color: '#fceeb9'                  //选中颜色(用于选中表格、列表等的底色)
};

let colors = {
  bg_color: '#F0F1F3',                       //背景颜色
  border_color_dark: '#AEBAC5',              //边框深色
  border_color_light: '#D6D6D6',             //边框浅色
  alternate_colors: ['#FFFFFF','#FAFAFA'],   //交替颜色(用于表格类的间隔行底色)
  list_hover_color: '#FCF0C1',               //鼠标浮动颜色(用于选中表格、列表等的鼠标经过的底色)
  tree_toolbar_bg_color: '#F0F1F3',          //树上工具栏背景色
  toolbar_bg_color: '#FFF',                  //通用工具栏背景色
  input_label_bg_color: '#F0F1F3',           //输入栏标签背景色
}

// let button_radius = '16px', tab_radius = '8px', input_radius = '8px', panel_radius = '16px', popup_radius = '8px', window_radius = '16px';
let button_radius = '0', tab_radius = '0', input_radius = '0', panel_radius = '0', popup_radius = '0', window_radius = '0';
let radius = {
  tab_radius: tab_radius,
  panel_radius: panel_radius,
  popup_radius: popup_radius,
  window_radius: window_radius,

  button_radius: button_radius,
  button_radius_l: `${button_radius} 0 0 ${button_radius}`,
  button_radius_r: `0 ${button_radius} ${button_radius} 0`,
  button_radius_t: `${button_radius} ${button_radius} 0 0`,
  button_radius_b: `0 0 ${button_radius} ${button_radius}`,
  button_radius_tl: `${button_radius} 0 0 0`,
  button_radius_tr: `0 ${button_radius} 0 0`,
  button_radius_br: `0 0 ${button_radius} 0`,
  button_radius_bl: `0 0 0 ${button_radius}`,

  input_radius: input_radius,
  input_radius_l: `${input_radius} 0 0 ${input_radius}`,
  input_radius_r: `0 ${input_radius} ${input_radius} 0`,
  input_radius_t: `${input_radius} ${input_radius} 0 0`,
  input_radius_b: `0 0 ${input_radius} ${input_radius}`,
  input_radius_tl: `${input_radius} 0 0 0`,
  input_radius_tr: `0 ${input_radius} 0 0`,
  input_radius_br: `0 0 ${input_radius} 0`,
  input_radius_bl: `0 0 0 ${input_radius}`,
}

let theme = {
  inputHeight: 32,                           //输入框默认高度

  window: {
    borderRadius: 'var(--window_radius)',
    boxShadow: '0px 0px 8px 0px RGBA(0, 0, 0, 0.3)',
    border: 0,
    // overflow: 'hidden',
  },
  panel: {
    borderRadius: panel_radius,
    // boxShadow: '0px 0px 4px 0px RGBA(0, 0, 0, 0.2)',
    // border: 0,
    border: '1px solid var(--border_color_dark)',
    overflow: 'hidden',
  },
  popup: {
    borderRadius: popup_radius,
    boxShadow: '0px 0px 8px 0px RGBA(0, 0, 0, 0.3)',
    border: 0,
    overflow: 'hidden',
  },
};

Object.assign(theme, colors);
Object.assign(theme, radius);

theme.style = () => _style;

let zindex = 2000;
theme.zindex = () => zindex++;

let _list = null;
theme.list = () => {
  return _list || (_list = [
    {name:$_L.get('天蓝色'),value:'blue'},
    {name:$_L.get('青草绿'),value:'green'},
    {name:$_L.get('健康绿'),value:'cyan'},
    {name:$_L.get('紫罗兰'),value:'purple'},
    {name:$_L.get('粉红色'),value:'pink'},
    {name:$_L.get('大红色'),value:'red'},
    {name:$_L.get('咖啡色'),value:'coffee'},
    {name:$_L.get('酷黑色'),value:'black'},
    {name:$_L.get('校车黄'),value:'yellow'}
  ]);
};

theme.reset = themes => {
  let style = {}, list = [];
  themes.forEach(item => {
    list.push({name: $_L.get(item.name), value: item.value});
    style[item.value] = item;
    delete item.name;
    delete item.value;
  });
  _style = style;
  _list = list;
  !style[theme.value] && theme.change(_list[0].value);
};

theme.rgba = (rgba, a) => rgba ? rgba.replace(',1)', `,${a})`) : '';

theme.change = value => {
  if (!_style[value] || theme.value == value) return;
  Storage.set('theme', theme.value = value, true);
  Object.assign(theme, _style[value]);
  let css = [];
  for (let key in theme) {
    if (typeof theme[key] == 'number' || typeof theme[key] == 'string') {
      css.push(`--${key}:${theme[key]}`);
    }
  }
  for (let i=1; i<10; i++) css.push(`--color_a${i}:${theme.rgba(theme.color, i/10)}`);
  document.body.setAttribute('style',css.join(';'));
  window.$_postMessage && window.$_postMessage({cmd:'theme_change', theme:value});
};

let value = Storage.get('theme', theme.list()[0].value, true);
theme.change(_style[value] ? value : theme.list()[0].value);

export default window.$_theme = theme;
