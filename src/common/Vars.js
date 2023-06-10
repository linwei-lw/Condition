
let plateColor = {map:null, list:null};

export function getPlateColorMap(callback) {
	if (plateColor.map) {
		return callback ? callback(plateColor.map) : plateColor.map;
	}
	let fun = result => {
		onPlateColor(result);
		return callback ? callback(plateColor.map) : plateColor.map;
	}
	return callback ? window.$_main.http.get('cmn?getPlateColorList').then(fun) : fun(window.$_main.http.syncGet('cmn?getPlateColorList'));
}

export function getPlateColorArray(callback) {
	if (plateColor.list) {
		return callback ? callback(plateColor.list) : plateColor.list;
	}
	let fun = result => {
		onPlateColor(result);
		return callback ? callback(plateColor.list) : plateColor.list;
	}
	return callback ? window.$_main.http.get('cmn?getPlateColorList').then(fun) : fun(window.$_main.http.syncGet('cmn?getPlateColorList'));
}

function onPlateColor(result) {
	plateColor.map = {};
	plateColor.list = [];
	result.forEach(item => {
		item.name = $_L.get(item.name);
		plateColor.map[item.id] = item.name;
		plateColor.list.push({label:item.name, value:item.id});
	});
}

let carStateCnMap;
export function getCarStateCnMap() {
	return carStateCnMap || (carStateCnMap = {
		1: $_L.get('离线-从未报定位'),
		2: $_L.get('欠费'),//离线-
		3: $_L.get('离线'),
		4: $_L.get('离线-报警'),
		5: $_L.get('在线-从未报定位'),
		6: $_L.get('欠费'),//在线-
		7: $_L.get('在线-行驶'),
		8: $_L.get('在线-行驶-报警'),
		9: $_L.get('在线-停车-ACC关'),
		10:$_L.get('在线-停车-ACC开'),
		11:$_L.get('在线-停车-ACC关-报警'),
		12:$_L.get('在线-停车-ACC开-报警'),
		13:$_L.get('在线-无效定位'),
	});
}

let carStateZfZ;
export function getCarStateZfZ() {
	return carStateZfZ || (carStateZfZ = {0: $_L.get('行驶中反转'),1: $_L.get('行驶中停转'),2: $_L.get('行驶中正转'),3: $_L.get('停车中反转'),4: $_L.get('停车中停转'),5: $_L.get('停车中正转')});
}

let gpsTypeMap;
export function getGpsTypeMap() {
	return gpsTypeMap || (gpsTypeMap = {
		'1':'GPS', '2':$_L.get('北斗'), '3':$_L.get('GPS北斗兼容模式'), '7':'GLONASS', '8':'Galileo', '9':$_L.get('基站'), '10':$_L.get('国标'), '11':'LBS', '12':'WIFI', '13':$_L.get('差分定位')
	});
}

let alarmSrcMap;
export function getAlarmSrcMap() {
	return alarmSrcMap || (alarmSrcMap = {'1':$_L.get('终端'),'2':$_L.get('平台'),'3':$_L.get('政府'),'9':$_L.get('其它'),'8':$_L.get('下级企业平台')});
}

let alarmStateMap;
export function getAlarmStateMap() {
	return alarmStateMap || (alarmStateMap = {'0':$_L.get('未处理'),'1':$_L.get('处理'),'2':$_L.get('忽略'),'3':$_L.get('误报')});
}

let playTips;
export function getPlayTip(ret) {
	playTips = playTips || (playTips = {
		'-7': $_L.get('未绑定视频终端'),
		'-6': $_L.get('车辆欠费'),
		'-5': $_L.get('视频类型不正确'),
		'-4': $_L.get('设备没有回应，请稍后再试'),
		'-3': $_L.get('车辆不存在'),
		'-2': $_L.get('系统异常'),
		'-1': $_L.get('设备离线'),
		'1' : $_L.get('设备返回失败'),
		'2' : $_L.get('设备返回消息有误'),
		'3' : $_L.get('设备不支持'),
		'13': $_L.get('对讲被占用'),
		'14': $_L.get('广播被占用'),
		// '15': $_L.get('上级平台正在播放'),
		// '16': $_L.get('紧急报警正在录像'),
		'17': $_L.get('广播端口分配完毕'),
		'20': $_L.get('录像回放被占用'),
		// '21': $_L.get('上级平台正在回放'),
		'31': $_L.get('809返回失败'),
		'32': $_L.get('809不支持'),
		'33': $_L.get('809会话结束'),
		'34': $_L.get('809时效口令错误'),
		'35': $_L.get('809不满足跨域条件'),
		'42': $_L.get('账号使用流量已超出设置'),
		'43': $_L.get('设备使用流量已超出设置'),
		'44': $_L.get('服务器带宽已满，请稍后再试'),
	});
	return playTips[''+ret] || ($_L.get('未知异常:') + ret);
}
