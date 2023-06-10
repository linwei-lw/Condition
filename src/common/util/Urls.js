
/**
 * 获取车辆树图标路径
 * @param {Int}    state 车辆状态
 * @param {String} [stts] abc|树图标|地图图标|大图标
 * @return {String} 返回绝对路径
 */
export function getCarTreeIconUrl(state, stts=null, cmpId=null) {
	return getCarMapIconUrl(state, stts, cmpId);
};

/**
 * 获取车辆地图图标路径
 * @param {Int}    state 车辆状态
 * @param {String} [stts] abc|树图标|地图图标|大图标
 * @return {String} 返回绝对路径
 */
export function getCarMapIconUrl(state, stts=null, cmpId=null) {
	state == 2 && (state = 6);
	stts = getStts(stts, 2, 'default');
	if (stts.indexOf('*') == 0) {
		return window.$_main.domain.WEB_ROOT + 'images/car/map/' + cmpId + "/" + encodeURI(stts.substr(1)) + '/' + state + '.png'+  `?${Math.random()}`;
	}
	return window.$_main.domain.WEB_PATH + 'rs/img/map/car/'+stts+'/'+state+'.png';
}

/**
 * 从《abc|树图标|地图图标|大图标》中取出对应的值
 * @param {String} stts  abc|树图标|地图图标|大图标
 * @param {Int}    index 用|拆开后的第几个
 * @param {String} value 默认值（如果没取到，则使用该埴）
 * @return {String} 返回对应索引值或默认值
 */
export function getStts(stts, index, value) {
	if (!stts) return value;
	stts = stts.split('|');
	return stts.length > index ? (stts[index] || value) : value;
}


//标注图标路径
export function getPoiIconUrl(icon) {
	return $_domain.WEB_PATH + 'rs/img/map/poi/' + encodeURI(icon || '默认/默认.png');
}

//报警图标路径
export function getAlarmIconUrl(typeId) {
	return $_domain.WEB_PATH + 'rs/img/alarm/' + typeId + '.png';
}
//信号线状态图标路径
export function getSgnIconUrl(icon) {
	return $_main.domain.WEB_PATH + 'rs/img/state/' + icon + '.png';
}