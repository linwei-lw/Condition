import Button from './Button.vue';
import Slider from './Slider.vue';
import InputLabel from './InputLabel.vue';
import InputText from './InputText.vue';
import InputTree from './InputTree.vue';
import InputRadio from  './InputRadio.vue';
import InputDateTime from  './InputDateTime.vue';
import InputSelect from './InputSelect.vue';
import Progress from './Progress.vue';
import Toolbar from './Toolbar.vue';
import Window from './Window.vue';
import Tree from './Tree';

const components = [
	Button,
	Slider,
	InputLabel,
	InputDateTime,
	InputText,
	Progress,
	Toolbar,
	Window,
	Tree,/*Toolbar*/
	InputTree,/*Tree*/
	InputRadio,
	InputSelect
];

import '@/assets/element-ui.css';
import ElementUI from 'element-ui';
import 'xe-utils';
import VXETable from './Table/all.js';
import './Table/index.css';

const install = function(Vue) {
  Vue.use(VXETable);
  Vue.use(ElementUI);
  components.forEach(component => Vue.component(component.name, component));
};

import Alert from './Alert';
window.$_alert = Alert;

import Popup from './util/Popup.js';
window.$_popup = Popup;

let echarts = require('echarts/lib/echarts');
require('echarts/extension/bmap/bmap');
require('echarts/lib/chart/line');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/pie');
require('echarts/lib/chart/map');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/visualMap');
require('echarts/lib/component/toolbox');
require('echarts/lib/component/dataZoom');
require('echarts/lib/component/title');
require('echarts/lib/component/legend');
require('echarts/lib/component/legendScroll');
window.echarts = echarts;

// let Highcharts = require('highcharts');
// window.Highcharts = Highcharts;

import './Tree/jquery-3.6.0.min.js';
import './Tree/jquery.ztree.core.js';
import './Tree/jquery.ztree.excheck.js';
// import './Tree/jquery.ztree.exedit.js';
import './Tree/zTreeStyle.css';
import './util/element-resize.js';


export default {
	install
}
