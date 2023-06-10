
import { UtilTools } from '@/components/Table/tools';

/**
 * @param {Button} btn 导出按钮
 * @param {vxe-table/vxe-grid} table 数据表格
 * @param {String} fileName 保存的文件名称
 * @param {String} [title] 文件里面的标题，如果为空，取fileName值
 * @param {Array} [datas] 导出的数据，如果为空，取table的数据
 *
 * 例子：
 * <Button ref="btn" icon="el-icon-download" @click="exportToExcel($refs.btn, $refs.table, '轨迹报表明细')"/>
 * <vxe-table ref="table" ...>
 * 	<vxe-table-column ...
 * </vxe-table>
 */
export function exportToExcel(btn, table, fileName, datas=null) {
	table = table.$refs.xTable || table;
	if (datas && !Array.isArray(datas)) {
		if (!datas.get) {
			datas = detailExport(datas);
		} else {
			return asynDetailExport(table, fileName, datas);
		}
	}
	datas = datas || table.afterFullData || table.getTableData().visibleData;
	if (!datas || datas.length == 0) {
		return $_alert.warn('无数据可导出！');
	}
	let columns = table.getTableColumn().fullColumn;//{collectColumn, fullColumn, visibleColumn, tableColumn}
	let _columns = [], _headers = [], _aligns = [];
	columns.forEach(column => {
		if (!column.visible || !column.title || column.type=='checkbox') return;
		if (column.property || column.formatter || column.type =='index') {
			_columns.push(column);
			_headers.push(column.title);
			_aligns.push(column.align||'center');
		}
	});

	let uid = window.$_uuid(window.$_main.sessionId + "_");
	server(uid, btn, table, datas, _columns, _headers, _aligns, fileName);
}

function asynDetailExport(table, fileName, {datas, end, get}) {
	if (!datas || datas.length == 0) {
		$_alert.warn('无数据可导出！');
		return null;
	}
	let columns = table.getTableColumn().fullColumn;//{collectColumn, fullColumn, visibleColumn, tableColumn}
	let _columns = [], _headers = [], _aligns = [];
	columns.forEach(column => {
		if (!column.visible || !column.title || column.type=='checkbox') return;
		if (column.property || column.formatter || column.type =='index') {
			_columns.push(column);
			_headers.push(column.title);
			_aligns.push(column.align||'center');
		}
	});
	let info = {ing: true, hasData: false, params: {uid: window.$_uuid(window.$_main.sessionId + "_"), file:fileName, title:fileName, headers:JSON.stringify(_headers), aligns:JSON.stringify(_aligns)}};
	dgDetailExport(table, datas, end, get, _columns, info, 0);
	return info.ing ? {cancel: ()=> {info.ing = false; end();}} : null;
}

function dgDetailExport(table, datas, end, get, columns, info, index) {
	if (index == datas.length) {
		info.ing = false;
		end();
		return info.hasData ? download(window.$_main.domain.WEB_PATH + 'excel', info.params) : $_alert.warn('无数据可导出！');
	}
	get(datas[index], index + ' / ' + datas.length, details => {
		if (!info.ing) return;
		if (!details || details.length == 0) {
			return dgDetailExport(table, datas, end, get, columns, info, ++index);
		} else {
			info.hasData = true;
			details = next1000(table, details, columns, 0, 99999999);
			details.push(null);//导出时加空行
			window.$_main.http.post('/exp?append', {uid:info.params.uid, datas:details}).then(()=>{
				dgDetailExport(table, datas, end, get, columns, info, ++index);
			}).catch(end);
		}
	});
}

function detailExport({datas, field}) {
	if (!datas || datas.length == 0) return [];
	let details = [];
	for (let i=0, len=datas.length, array; i<len; i++) {
	  array = datas[i][field];
	  if (!array || array.length == 0) continue;
	  for (let j=0, l=array.length; j<l; j++) {
		details.push(array[j]);
	  }
	  details.push(null);//导出时加空行
	}
	return details;
}

function server(uid, btn, table, datas, columns, headers, aligns, fileName, index=0) {
	if (index < datas.length) {
		index == 0 && setBtn(btn, true);
		let _datas = next1000(table, datas, columns, index);
		index += _datas.length;
		return window.$_main.http.post('/exp?append', {uid:uid, datas:_datas}).then(()=>{
			server(uid, btn, table, datas, columns, headers, aligns, fileName, index);
		}).catch(()=>{
			setBtn(btn, false);
		});
	}

	let params = {uid:uid, file:fileName, title:fileName, headers:JSON.stringify(headers), aligns:JSON.stringify(aligns)};
	download(window.$_main.domain.WEB_PATH + 'excel', params);

	setBtn(btn, false);
}

export function download(url, params) {
    let form = document.createElement("form");
    form.style.display = 'none';
    form.action = url;
    form.method = "post";
    for (let key in params){
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
	document.body.removeChild(form);
}

function setBtn(btn, loading) {
	if (!btn || (!btn.setIcon && !btn.setDisabled)) return;
	if (loading) {
		btn.__icon = btn.icon;
		btn.setIcon && btn.setIcon('el-icon-loading');
		btn.setDisabled && btn.setDisabled(true);
	} else {
		btn.setIcon && btn.setIcon(btn.__icon);
		delete btn.__icon;
		btn.setDisabled && btn.setDisabled(false);
	}
}

function next1000(table, datas, columns, index, count=1000) {
	let item = null, text = null, _datas = [], params = {$table: table}, iii = '序号';
	for (let i=index, len=Math.min(datas.length,index+count); i < len; i++) {
		item = datas[i];
		let texts = [];
		params.row = item;
		columns.forEach(column => {
			if (!item) {
				text = '';
			} else if (column.title == iii) {
				text = String(i+1);
			} else {
				params.column = column;
				text = UtilTools.getCellLabel(item, column, params);
				text = (text == null || text == undefined) ? '' : String(text);
				text = !text ? ' ' : text.replace('null','');
			}
			texts.push(text);
		});
		_datas.push(texts);
	}
	return _datas;
}
