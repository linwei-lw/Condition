
import { objIsEmpty } from '@/common/util/Objects.js';

let LISTENERS = {}, TIME = false, REMOVED = {}, REMOVE_FLAG = false, POST_ING = false;

let Message = {
	RESTART: -1,    //接收服务器重启指令
	GPS:     2,     //接收定位指令
	CRD:     3,     //接收实时数据
	STATE:   5,     //接收车辆状态指令
	CMD:     7,     //接收指令回复
	MSG:     9,     //接收消息通知
	EXIT:    12,    //接受（单账户登录模式时强制退出指令)
};
let sorts = {};
sorts[Message.EXIT] = 1;
sorts[Message.RESTART] = 2;
sorts[Message.STATE] = 3;
sorts[Message.CMD] = 5;
sorts[Message.GPS] = 8;
sorts[Message.CRD] = 9;
sorts[Message.MSG] = 10;

//三方系统使用列表
//CAN用了20、21

function sortCmds(cmd1, cmd2) {
	cmd1 = sorts[cmd1] || 99;
	cmd2 = sorts[cmd2] || 99;
	return cmd1 - cmd2;
}

function onTimer() {
	let cmds = Object.keys(LISTENERS);
	if (cmds.length == 0) return;

	if (cmds.length > 1) cmds.sort(sortCmds);
	POST_ING = true;
	window.$_main.http.post('/message', cmds, true).then(result => {
		POST_ING = false;
		for (let i=0; i<cmds.length; i++) {
			if (!result[i]) continue;
			let cbs = LISTENERS[cmds[i]];
			cbs && cbs.forEach(cb => { try{cb(result[i])}catch(error){console.log(error)} });
			if (REMOVE_FLAG) {
				cbs = REMOVED[cmds[i]];
				cbs && cbs.forEach(cb => { try{cb(result[i])}catch(error){console.log(error)} });
			}
		}
		if (REMOVE_FLAG) {
			REMOVE_FLAG = false;
			REMOVED = {};
		}
		if (TIME === false) return;
		TIME = setTimeout(onTimer, 2000);
	}).catch(error => {
		console.log(error);
		TIME !== false && (TIME = setTimeout(onTimer, 2000));
	});
}

Message.addListener = function(cmd, callback) {
	LISTENERS[cmd] = LISTENERS[cmd] || [];
	LISTENERS[cmd].push(callback);
	TIME === false && (TIME = setTimeout(onTimer, 2000));
}

Message.removeListener = function(cmd, callback) {
	let cbs = LISTENERS[cmd];
	if (!cbs) return;
	let index = cbs.indexOf(callback);
	if (index == -1) return;

	cbs.splice(index, 1);
	if (cbs.length) return;
	delete LISTENERS[cmd];

	if (POST_ING) {
		REMOVED[cmd] = REMOVED[cmd] || [];
		REMOVED[cmd].push(callback);
		REMOVE_FLAG = true;
	}

	if (objIsEmpty(LISTENERS) && TIME !== false) {
		clearTimeout(TIME);
		TIME = false;
	}
}

export default Message;
