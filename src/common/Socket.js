
export default function Socket(url, onopen, onclose) {
	this.onopen = onopen;
	this.onclose = onclose;
	this.sid = window.$_uuid($_main.sessionId);

	this.url = ($_domain.WEB_HTTP == 'https' ? "wss://" : "ws://") + url;
	this.ws = null;

	this.opened = false;
	this.stopped = false;

	this.listeners = {};
}

Socket.prototype = {
	getId: function() {
		return this.sid;
	},

	connect: function() {
		this.stopped = false;
		this.ws = new WebSocket(this.url);
		this.ws.onopen = this._onopen.bind(this);
		this.ws.onmessage = this._onmessage.bind(this);
		this.ws.onclose = this._onclose.bind(this);
	},
	
	close: function() {
		this.stopped = true;
		this.opened = false;
		this.listeners = {};
		if (this.ws && this.ws.readyState === 1) {
			this.ws.send('{"cmd":"close"}');
			this.ws.close();
		}
	},
	
	destroy: function() {
		this.close();
		this.ws = null;
		this.onopen = null;
		this.onclose = null;
		this.listeners = null;
	},

	send: function(msg) {
		if (!this.opened || !this.ws || this.ws.readyState != 1) return false;
		this.ws.send((typeof msg === "string") ? msg : JSON.stringify(msg));
		return true;
	},
	
	addListener: function(cmd, callback) {
		this.listeners[cmd] = this.listeners[cmd] || [];
		this.listeners[cmd].push(callback);
	},

	removeListener: function(cmd, callback) {
		if (!this.listeners) return;
		let cbs = this.listeners[cmd];
		if (!cbs) return;
		let index = cbs.indexOf(callback);
		if (index == -1) return;
		cbs.splice(index, 1);
		if (cbs.length) return;
		delete this.listeners[cmd];
	},
	
	_onopen: function() {
		if (this.stopped) {
			this.ws.send('{"cmd":"close"}');
			this.ws.close();
			return;
		}
		this.opened = true;
		this.time = new Date().getTime();
		this._keepalive();
		this.onopen && this.onopen();
	},
	
	_onmessage: function(event) {
		this.time = new Date().getTime();
		event = JSON.parse(event.data);
		let cbs = this.listeners[event.cmd];
		cbs && cbs.forEach(cb => { try{cb(event)}catch(error){console.log(error)} });
	},
	
	_onclose: function() {
		if (this.opened) {
			this.onclose && this.onclose();
			this.opened = false;
		}
		if (this.keepaliveTimer) {
			clearTimeout(this.keepaliveTimer);
			this.keepaliveTimer = false;
		}
		!this.stopped && this.connect();
	},

	_keepalive: function() {
		if (!this.opened) return;
		if (new Date().getTime() - this.time > 60*1000) {
			return this.ws && (this.ws.send('{"cmd":"close"}'), this.ws.close());
		}
		this.send('{"cmd":"keep_alive","sid":"'+this.sid+'"}');
		this.keepaliveTimer = setTimeout(this._keepalive.bind(this), 10000);
	},
}