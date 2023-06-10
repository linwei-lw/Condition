//获取当天日期字符串
export function getNowDate(format = 'YYYY-MM-DD') {
	return dateFormat(null, format);
}

//获取当前日期时间字符串
export function getNowDateTime(format = 'YYYY-MM-DD HH:NN:SS') {
	return dateFormat(null, format);
}

/**
 * 当天加天数，如：明天addDateTime(1)　昨天addDateTime(-1)
 * @params {Int} day 相隔的天数
 * @params {String} format 返回格式
 * @returns {String} 日期字符串
 */
export function addDateTime(day, format = 'YYYY-MM-DD HH:NN:SS') {
	let date = new Date();
	date.setDate(date.getDate() + day);
	return dateFormat(date, format);
}

/**
 * 获取两个日期时间相隔的天数
 * @params {String} datetime1 日期时间1
 * @params {String} datetime2 日期时间2
 * @returns {Number} 相隔天数
 */
export function apartDays(datetime1, datetime2) {
	return datetime1 && datetime2 ? Math.ceil(apartSeconds(datetime1, datetime2) / (24 * 60 * 60)) : 0;
}

/**
 * 获取两个日期时间相隔的秒数
 * @params {String} datetime1 日期时间1
 * @params {String} datetime2 日期时间2
 * @returns {Number} 相隔秒数
 */
export function apartSeconds(datetime1, datetime2) {
	if (!datetime1 || !datetime2) return null;
	datetime1 = parseDate(datetime1);
	datetime2 = parseDate(datetime2);
	return Math.abs(datetime1.getTime() - datetime2.getTime()) / 1000;
}

/**
 * 获取某月份的天数
 * @params year 指定年份
 * @params month 指定月份
 * @returns {Number} 当月的天数
 */
export function getDays(year, month) {
	if(month == 2) { //如果是二月，判断是否为闰年
		return((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) ? 29 : 28;
	} else if(month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
		return 31;
	}
	return 30;
}

/**
 * 将日期对象进行字符串格式化
 * @params {Date} date 日期对象
 * @params {String} format 格式
 * @returns {String} 日期字符串
 */
export function dateFormat(date, format = 'YYYY-MM-DD') {
	date = date || new Date();
	format = format || 'YYYY-MM-DD';

	let month = date.getMonth() + 1,
		day = date.getDate(),
		hour = date.getHours(),
		minute = date.getMinutes(),
		second = date.getSeconds(),
		millisecond = date.getMilliseconds()+'';
	month = (month < 10 ? '0' : '') + month;
	day = (day < 10 ? '0' : '') + day;
	hour = (hour < 10 ? '0' : '') + hour;
	minute = (minute < 10 ? '0' : '') + minute;
	second = (second < 10 ? '0' : '') + second;

	return format.replace('YYYY', date.getFullYear()).replace('MM', month).replace('DD', day).replace('HH', hour).replace('NN', minute).replace('SS', second).replace('MSD', millisecond);
}

/**
 * 将字符串转化为日期对象
 * @params {String} date 日期字符串
 * @returns {Date} 日期对象
 */
export function parseDate(date) {
	let ymdhns = date.split(/[-| |:]/);
	let year = parseInt(ymdhns[0]);
	let month = parseInt(ymdhns[1]);
	let day = parseInt(ymdhns[2]);
	let hour = ymdhns.length > 3 ? parseInt(ymdhns[3]) : 0;
	let minute = ymdhns.length > 4 ? parseInt(ymdhns[4]) : 0;
	let second = ymdhns.length > 5 ? parseInt(ymdhns[5]) : 0;
	return new Date(year, month - 1, day, hour, minute, second);
}

/**
 * 将[datetime]从格式yyyy-MM-dd hh:mm:ss转成格式yyyyMMddhhmmss
 * @params {String} datetime 日期时间字符串
 * @returns {String} 日期时间纯数字格式
 */
export function dateFormatToNum(datetime) {
	return datetime.split(/[-| |:]/).join('');
}

/**
 * 将[datetime]从格式yyyyMMddhhmmss转成格式yyyy-MM-dd hh:mm:ss
 * @params {String} datetime 日期时间纯数字格式
 * @returns {String} 日期时间字符串
 */
export function dateNumToFormat(datetime) {
	if(datetime.length == 14) {
		return [datetime.substr(0, 4), '-', datetime.substr(4, 2), '-', datetime.substr(6, 2), ' ', datetime.substr(8, 2), ':', datetime.substr(10, 2), ':', datetime.substr(12, 2)].join('');
	}
	return datetime;
}

/**
 * 将秒数转成[天 时:分:秒]格式
 * @params {Int} seconds 秒数
 * @returns {String} [天 时:分:秒]
 */
export function secondsToDHMS(seconds) {
	if(seconds === 0 || seconds === '0') return '00:00:00';
	if(!seconds) return '';
	seconds = Number(seconds);
	let day = parseInt(seconds / (60 * 60 * 24));
	let hour = parseInt((seconds % (60 * 60 * 24)) / (60 * 60));
	let minute = parseInt(((seconds % (60 * 60 * 24)) % (60 * 60)) / 60);
	let second = parseInt(((seconds % (60 * 60 * 24)) % (60 * 60)) % 60);
	let dhms = '';
	if(day > 0) {
		dhms = (day < 10 ? '0' : '') + day;
		dhms += ' ';
	}
	dhms += (hour < 10 ? '0' : '') + hour;
	dhms += (minute < 10 ? ':0' : ':') + minute;
	dhms += (second < 10 ? ':0' : ':') + second;
	return dhms;
}

/**
 * 将秒数转成[时:分:秒]格式
 * @params {Int} seconds 秒数
 * @returns {String} [时:分:秒]
 */
export function secondsToHMS(seconds) {
	if(seconds === 0 || seconds === '0') return '00:00:00';
	if(!seconds) return '';
	seconds = Number(seconds);
	let hour = parseInt(seconds / (60 * 60));
	let minute = parseInt(((seconds % (60 * 60 * 24)) % (60 * 60)) / 60);
	let second = parseInt(((seconds % (60 * 60 * 24)) % (60 * 60)) % 60);
	let hms = (hour < 10 ? '0' : '') + hour;
	hms += (minute < 10 ? ':0' : ':') + minute;
	hms += (second < 10 ? ':0' : ':') + second;
	return hms;
}

/**
 * 将两日期时间的间隔转成[时:分:秒]
 * @params {String} datetime1 日期时间1
 * @params {String} datetime2 日期时间2
 * @returns {String} [时:分:秒]
 */
export function apartToHMS(datetime1, datetime2) {
	return datetime1 && datetime2 ? secondsToHMS(apartSeconds(datetime1, datetime2)) : '';
}

/**
 * 将两日期时间的间隔转成[x天x时x分x秒]
 * @params {String} datetime1 日期时间1
 * @params {String} datetime2 日期时间2
 * @returns {String} [x天x时x分x秒]
 */
export function apartDateTimeCnDesc(datetime1, datetime2) {
	return datetime1 && datetime2 ? secondsToCnDesc(apartSeconds(datetime1, datetime2)) : '';
}

/**
 * 将秒数转成[x天x时x分x秒]格式
 * @params {Int} seconds 秒数
 * @returns {String} [x天x时x分x秒]
 */
export function secondsToCnDesc(seconds) {
	if(seconds === 0 || seconds === '0') return '0秒';
	if(!seconds) return '';
	let day = parseInt(seconds / (60 * 60 * 24));
	let hour = parseInt((seconds % (60 * 60 * 24)) / (60 * 60));
	let minute = parseInt(((seconds % (60 * 60 * 24)) % (60 * 60)) / 60);
	let second = parseInt(((seconds % (60 * 60 * 24)) % (60 * 60)) % 60);
	let desc = [];
	day > 0 && desc.push(day, '天');
	hour > 0 && desc.push(hour, '时');
	minute > 0 && desc.push(minute, '分');
	second > 0 && desc.push(second, '秒');
	return desc.join('');
}

/**
 * 将时间范围分割成每一天
 * 例：2019-12-23 00:00:00 ~ 2019-12-24 23:59:59或2019-12-23 ~ 2019-12-24
 * 分割为：[{sdate:2019-12-23 00:00:00,edate:2019-12-23 23:59:59},{sdate:2019-12-24 00:00:00,edate:2019-12-24 23:59:59}]
 * @params {String} startDate 开始时间
 * @params {String} endDate 结束时间
 * @returns {Array} [{sdate:yyyy-MM-dd hh:mm:ss,edate:yyyy-MM-dd hh:mm:ss}]
 */
export function splitDate(start, end) {
	let sf = {10:'', 13:' 00', 16:' 00:00'}[start.length] || ' 00:00:00', ef = {10:'', 13:' 24', 16:' 24:00'}[start.length] || ' 23:59:59';
	let sdate = parseDate(start.split(' ')[0]), stime = sdate.getTime(), etime = parseDate(end).getTime(), item = {sdate:start}, result = [], oneday = 24*60*60*1000;
	while ((stime + oneday) < etime) {
		sdate.setTime(stime = stime + oneday - 1);
		item.edate = dateFormat(sdate,'YYYY-MM-DD') + ef;
		result.push(item);

		sdate.setTime(stime = stime + 1);
		item = {sdate: dateFormat(sdate,'YYYY-MM-DD') + sf};
	}
	item.edate = end;
	result.push(item);
	return result;
}
