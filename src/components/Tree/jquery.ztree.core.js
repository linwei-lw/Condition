/*
 * JQuery zTree core v3.5.40
 * http://treejs.cn/
 *
 * Copyright (c) 2010 Hunter.z
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * email: hunter.z@263.net
 * Date: 2019-01-18
 */
(function($) {
    var settings = {},
    roots = {},
    caches = {},
    _consts = {
        className: {
            BUTTON: "button",
            LEVEL: "level",
            ICO_LOADING: "ico_loading",
            SWITCH: "switch",
            NAME: 'node_name'
        },
        event: {
            NODECREATED: "ztree_nodeCreated",
            CLICK: "ztree_click",
            EXPAND: "ztree_expand",
            COLLAPSE: "ztree_collapse",
            ASYNC_SUCCESS: "ztree_async_success",
            ASYNC_ERROR: "ztree_async_error",
            REMOVE: "ztree_remove",
            SELECTED: "ztree_selected",
            UNSELECTED: "ztree_unselected"
        },
        id: {
            DIV: '_div',
            A: "_a",
            ICON: "_ico",
            SPAN: "_span",
            SWITCH: "_switch",
            UL: "_ul"
        },
        line: {
            ROOT: "root",
            ROOTS: "roots",
            CENTER: "center",
            BOTTOM: "bottom",
            NOLINE: "noline",
            LINE: "line"
        },
        folder: {
            OPEN: "open",
            CLOSE: "close",
            DOCU: "docu"
        }
    },
    _setting = {
        treeId: "",
        treeObj: null,
        view: {
            addDiyDom: null,
            dblClickExpand: true,
            expandSpeed: "", //fast
            nameIsHTML: false,
            showLine: true,
            txtSelectedEnable: false,
            nameFunction: null,
            iconUrlFunction: null,
            iconCssFunction: null,
            titleFunction: null,
            hideFunction: null
        },
        data: {
            key: {
                name: "name",
                parent: "parent",
                children: "children"
            },
            keep: {
                parent: false,
                leaf: false
            }
        },
        async: {
            enable: false,
            contentType: "application/x-www-form-urlencoded",
            type: "post",
            dataType: "text",
            headers: {},
            xhrFields: {},
            url: "",
            autoParam: [],
            otherParam: [],
            dataFilter: null
        },
        callback: {
            beforeAsync: null,
            beforeClick: null,
            beforeDblClick: null,
            beforeRightClick: null,
            beforeMouseDown: null,
            beforeMouseUp: null,
            beforeExpand: null,
            beforeCollapse: null,
            beforeRemove: null,
            onAsyncError: null,
            onAsyncSuccess: null,
            onNodeCreated: null,
            onClick: null,
            onDblClick: null,
            onRightClick: null,
            onMouseDown: null,
            onMouseUp: null,
            onExpand: null,
            onCollapse: null,
            onRemove: null,
            onMouseOver: null,
            onMouseOut: null,
        }
    },
    _initRoot = function(setting) {
        var r = data.getRoot(setting);
        if (!r) {
            r = {};
            data.setRoot(setting, r);
        }
        r[setting.data.key.children] = [];
        r.expandTriggerFlag = false;
        r.curSelectedList = [];
        r.noSelection = true;
        r.createdNodes = [];
        r.zId = r.zId || 0;
        r._ver = (new Date()).getTime();
    },
    _initCache = function(setting) {
        var c = data.getCache(setting);
        !c && data.setCache(setting, c = {});
        c.nodes = [];
    },
    _bindEvent = function(setting) {
        var o = setting.treeObj, c = consts.event;
        o.bind(c.NODECREATED, function(event, node) {
            tools.apply(setting.callback.onNodeCreated, [node, event]);
        });
        o.bind(c.CLICK, function(event, srcEvent, node) {
            tools.apply(setting.callback.onClick, [node, srcEvent]);
        });
        o.bind(c.EXPAND, function(event, node) {
            tools.apply(setting.callback.onExpand, [node, event]);
        });
        o.bind(c.COLLAPSE, function(event, node) {
            tools.apply(setting.callback.onCollapse, [node, event]);
        });
        o.bind(c.ASYNC_SUCCESS, function(event, node, msg) {
            tools.apply(setting.callback.onAsyncSuccess, [node, event, msg]);
        });
        o.bind(c.ASYNC_ERROR, function(event, node, XMLHttpRequest, textStatus, errorThrown) {
            tools.apply(setting.callback.onAsyncError, [node, event, XMLHttpRequest, textStatus, errorThrown]);
        });
        o.bind(c.REMOVE, function(event, node) {
            tools.apply(setting.callback.onRemove, [node, event]);
        });
        o.bind(c.SELECTED, function(event, node) {
            tools.apply(setting.callback.onSelected, [node, event]);
        });
        o.bind(c.UNSELECTED, function(event, node) {
            tools.apply(setting.callback.onUnSelected, [node, event]);
        });
    },
    _unbindEvent = function(setting) {
        var o = setting.treeObj,
        c = consts.event;
        o.unbind(c.NODECREATED).unbind(c.CLICK).unbind(c.EXPAND).unbind(c.COLLAPSE).unbind(c.ASYNC_SUCCESS).unbind(c.ASYNC_ERROR).unbind(c.REMOVE).unbind(c.SELECTED).unbind(c.UNSELECTED);
    },
    _eventProxy = function(event) {
        var target = event.target,
        setting = data.getSetting(event.data.treeId),
        tId = "",
        node = null,
        nodeEventType = "",
        treeEventType = "",
        nodeEventCallback = null,
        treeEventCallback = null,
        tmp = null;
        if (tools.eqs(event.type, "mousedown")) {
            treeEventType = "mousedown";
        } else if (tools.eqs(event.type, "mouseup")) {
            treeEventType = "mouseup";
        } else if (tools.eqs(event.type, "mouseover")) {
        	treeEventType = "mouseover";
        } else if (tools.eqs(event.type, "mouseout")) {
        	treeEventType = "mouseout";
        } else if (tools.eqs(event.type, "contextmenu")) {
            treeEventType = "contextmenu";
        } else if (tools.eqs(event.type, "click")) {
            if (tools.eqs(target.tagName, "span") && target.getAttribute("treeNode" + consts.id.SWITCH) !== null) {
                tId = tools.getNodeMainDom(target).id;
                nodeEventType = "switchNode";
            } else {
                tmp = tools.getMDom(setting, target, [{
                    tagName: "div",
                    attrName: "treeNode" + consts.id.DIV
                }]);
                if (tmp) {
                    tId = tools.getNodeMainDom(tmp).id;
                    nodeEventType = "clickNode";
                }
            }
        } else if (tools.eqs(event.type, "dblclick")) {
            treeEventType = "dblclick";
            tmp = tools.getMDom(setting, target, [{
                tagName: "div",
                attrName: "treeNode" + consts.id.DIV
            }]);
            if (tmp) {
                tId = tools.getNodeMainDom(tmp).id;
                nodeEventType = "switchNode";
            }
        }
        if (treeEventType.length > 0 && tId.length == 0) {
            tmp = tools.getMDom(setting, target, [{
                tagName: "div",
                attrName: "treeNode" + consts.id.DIV
            }]);
            if (tmp) {
                tId = tools.getNodeMainDom(tmp).id;
            }
        }
        // event to node
        if (tId.length > 0) {
            node = data.getNodeCache(setting, tId);
            switch (nodeEventType) {
            case "switchNode":
                if (node == null || !node[setting.treeId].isParent) {
                    nodeEventType = "";
                } else if (tools.eqs(event.type, "click") || (tools.eqs(event.type, "dblclick") && tools.apply(setting.view.dblClickExpand, [node], setting.view.dblClickExpand))) {
                    nodeEventCallback = handler.onSwitchNode;
                } else {
                    nodeEventType = "";
                }
                break;
            case "clickNode":
                nodeEventCallback = handler.onClickNode;
                break;
            }
        }
        // event to zTree
        switch (treeEventType) {
        case "mousedown":
            treeEventCallback = handler.onZTreeMousedown;
            break;
        case "mouseup":
            treeEventCallback = handler.onZTreeMouseup;
            break;
        case "mouseover":
            treeEventCallback = handler.onZTreeMouseover;
            break;
        case "mouseout":
            treeEventCallback = handler.onZTreeMouseout;
            break;
        case "dblclick":
            treeEventCallback = handler.onZTreeDblclick;
            break;
        case "contextmenu":
            treeEventCallback = handler.onZTreeContextmenu;
            break;
        }
        var proxyResult = {
            stop: false,
            node: node,
            nodeEventType: nodeEventType,
            nodeEventCallback: nodeEventCallback,
            treeEventType: treeEventType,
            treeEventCallback: treeEventCallback
        };
        return proxyResult;
    },
    //default init node of core
    _initNode = function(setting, level, n, parentNode, isFirstNode, isLastNode, openFlag) {
        if (!n) return;
        var r = data.getRoot(setting), children = n[setting.data.key.children];
        var Z = n[setting.treeId] = n[setting.treeId] || {};
        Z.level = level;
        Z.tId = setting.treeId + "_" + (++r.zId);
        Z.open = !!Z.open;
        if (tools.isArray(children)) {
            Z.isParent = true;
            Z.zAsync = true;
        } else {
            Z.open = (Z.isParent && !setting.async.enable) ? Z.open: false;
            Z.zAsync = !Z.isParent;
        }
        Z.isFirstNode = isFirstNode;
        Z.isLastNode = isLastNode;
        Z.isAjaxing = false;
    },
    _init = {
        bind: [_bindEvent],
        unbind: [_unbindEvent],
        caches: [_initCache],
        nodes: [_initNode],
        proxys: [_eventProxy],
        roots: [_initRoot],
        beforeA: [],
        afterA: [],
        innerBeforeA: [],
        innerAfterA: [],
        innerAfterIcon: [],
        zTreeTools: []
    },
    //method of operate data
    data = {
        addNodeCache: function(setting, node) {
            data.getCache(setting).nodes[data.getNodeCacheId(node[setting.treeId].tId)] = node;
        },
        getNodeCacheId: function(tId) {
            return tId.substring(tId.lastIndexOf("_") + 1);
        },
        addAfterA: function(afterA) {
            _init.afterA.push(afterA);
        },
        addBeforeA: function(beforeA) {
            _init.beforeA.push(beforeA);
        },
        addInnerAfterA: function(innerAfterA) {
            _init.innerAfterA.push(innerAfterA);
        },
        addInnerBeforeA: function(innerBeforeA) {
            _init.innerBeforeA.push(innerBeforeA);
        },
        addInnerAfterIcon: function(innerAfterIcon) {
            _init.innerAfterIcon.push(innerAfterIcon);
        },
        addInitBind: function(bindEvent) {
            _init.bind.push(bindEvent);
        },
        addInitUnBind: function(unbindEvent) {
            _init.unbind.push(unbindEvent);
        },
        addInitCache: function(initCache) {
            _init.caches.push(initCache);
        },
        addInitNode: function(initNode) {
            _init.nodes.push(initNode);
        },
        addInitProxy: function(initProxy, isFirst) {
            if ( !! isFirst) {
                _init.proxys.splice(0, 0, initProxy);
            } else {
                _init.proxys.push(initProxy);
            }
        },
        addInitRoot: function(initRoot) {
            _init.roots.push(initRoot);
        },
        addNodesData: function(setting, parentNode, index, nodes) {
            var children = parentNode[setting.data.key.children] || [], Z;
            if (children.length == nodes.length) {
                parentNode[setting.treeId].isParent = true;
            	return;
            }
            if (index === 0) {
            	var first = children[nodes.length - 1];
                Z = first[setting.treeId];
                Z?Z.isFirstNode = false:Z={isFirstNode:false}
                view.setNodeLineIcos(setting, first, Z);
            } else if (index < 0) {
                var last = children[children.length - nodes.length - 1];
                if (last) {
                    Z = last[setting.treeId] || {};
                	Z.isLastNode = false;
                    view.setNodeLineIcos(setting, last, Z);
                }
            }
            parentNode[setting.treeId].isParent = true;
//            var children = parentNode[setting.data.key.children], params;
//            if (!children) {
//                children = parentNode[setting.data.key.children] = [];
//                index = -1;
//            } else if (index >= children.length) {
//                index = -1;
//            }
//            if (children.length > 0 && index === 0) {
//                children[0][setting.treeId].isFirstNode = false;
//                view.setNodeLineIcos(setting, children[0]);
//            } else if (children.length > 0 && index < 0) {
//                children[children.length - 1][setting.treeId].isLastNode = false;
//                view.setNodeLineIcos(setting, children[children.length - 1]);
//            }
//            parentNode[setting.treeId].isParent = true;
//            if (index < 0) {
//                parentNode[setting.data.key.children] = children.concat(nodes);
//            } else {
//                params = [index, 0].concat(nodes);
//                children.splice.apply(children, params);
//            }
        },
        addSelectedNode: function(setting, node) {
            if (!data.isSelectedNode(setting, node)) {
                var root = data.getRoot(setting);
                root.curSelectedList.push(node);
            }
        },
        addCreatedNode: function(setting, node) {
            if (!! setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
                var root = data.getRoot(setting);
                root.createdNodes.push(node);
            }
        },
        addZTreeTools: function(zTreeTools) {
            _init.zTreeTools.push(zTreeTools);
        },
        exSetting: function(s) {
            $.extend(true, _setting, s);
        },
        getAfterA: function(setting, node, array) {
            for (var i = 0, j = _init.afterA.length; i < j; i++) {
                _init.afterA[i].apply(this, arguments);
            }
        },
        getBeforeA: function(setting, node, array) {
            for (var i = 0, j = _init.beforeA.length; i < j; i++) {
                _init.beforeA[i].apply(this, arguments);
            }
        },
        getInnerAfterIcon: function(setting, node, array) {
            for (var i = 0, j = _init.innerAfterIcon.length; i < j; i++) {
                _init.innerAfterIcon[i].apply(this, arguments);
            }
        },
        getInnerAfterA: function(setting, node, array) {
            for (var i = 0, j = _init.innerAfterA.length; i < j; i++) {
                _init.innerAfterA[i].apply(this, arguments);
            }
        },
        getInnerBeforeA: function(setting, node, array) {
            for (var i = 0, j = _init.innerBeforeA.length; i < j; i++) {
                _init.innerBeforeA[i].apply(this, arguments);
            }
        },
        getCache: function(setting) {
            return caches[setting.treeId];
        },
        getNodeByParam: function(setting, nodes, key, value) {
            if (!nodes || !key) return null;
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node[key] == value) {
                    return nodes[i];
                }
                var children = node[setting.data.key.children];
                var tmp = data.getNodeByParam(setting, children, key, value);
                if (tmp) return tmp;
            }
            return null;
        },
        getNodeCache: function(setting, tId) {
            if (!tId) return null;
            return caches[setting.treeId].nodes[data.getNodeCacheId(tId)] || 0;
        },
        getNodes: function(setting) {
            return data.getRoot(setting)[setting.data.key.children];
        },
        getNodesByParam: function(setting, nodes, key, value) {
            if (!nodes || !key) return [];
            var result = [];
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node[key] == value) {
                    result.push(node);
                }
                var children = node[setting.data.key.children];
                result = result.concat(data.getNodesByParam(setting, children, key, value));
            }
            return result;
        },
        getNodesByParamFuzzy: function(setting, nodes, key, value) {
            if (!nodes || !key) return [];
            var result = [];
            value = value.toLowerCase();
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (typeof node[key] == "string" && nodes[i][key].toLowerCase().indexOf(value) > -1) {
                    result.push(node);
                }
                var children = node[setting.data.key.children];
                result = result.concat(data.getNodesByParamFuzzy(setting, children, key, value));
            }
            return result;
        },
        getNodesByFilter: function(setting, nodes, filter, isSingle, invokeParam) {
            if (!nodes) return (isSingle ? null: []);
            var result = isSingle ? null: [];
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (tools.apply(filter, [node, invokeParam], false)) {
                    if (isSingle) {
                        return node;
                    }
                    result.push(node);
                }
                var children = node[setting.data.key.children];
                var tmpResult = data.getNodesByFilter(setting, children, filter, isSingle, invokeParam);
                if (isSingle && !!tmpResult) {
                    return tmpResult;
                }
                result = isSingle ? tmpResult: result.concat(tmpResult);
            }
            return result;
        },
        getRoot: function(setting) {
            return setting ? roots[setting.treeId] : null;
        },
        getRoots: function() {
            return roots;
        },
        getSetting: function(treeId) {
            return settings[treeId];
        },
        getSettings: function() {
            return settings;
        },
        getZTreeTools: function(treeId) {
            var r = this.getRoot(this.getSetting(treeId));
            return r ? r.treeTools: null;
        },
        initCache: function(setting) {
            for (var i = 0, j = _init.caches.length; i < j; i++) {
                _init.caches[i].apply(this, arguments);
            }
        },
        initNode: function(setting, level, node, parentNode, preNode, nextNode) {
            for (var i = 0, j = _init.nodes.length; i < j; i++) {
                _init.nodes[i].apply(this, arguments);
            }
        },
        initRoot: function(setting) {
            for (var i = 0, j = _init.roots.length; i < j; i++) {
                _init.roots[i].apply(this, arguments);
            }
        },
        isSelectedNode: function(setting, node) {
            var root = data.getRoot(setting);
            for (var i = 0, j = root.curSelectedList.length; i < j; i++) {
                if (node === root.curSelectedList[i]) return true;
            }
            return false;
        },
        nodeName: function(setting, node) {
            return setting.view.nameFunction ? setting.view.nameFunction(node) : node[setting.data.key.name];
        },
        removeNodeCache: function(setting, node) {
            var children = node[setting.data.key.children];
            if (children) {
                for (var i = 0, l = children.length; i < l; i++) {
                    data.removeNodeCache(setting, children[i]);
                }
            }
            data.getCache(setting).nodes[data.getNodeCacheId(node[setting.treeId].tId)] = null;
        },
        removeSelectedNode: function(setting, node) {
            var root = data.getRoot(setting);
            for (var i = 0, j = root.curSelectedList.length; i < j; i++) {
                if (node === root.curSelectedList[i] || !data.getNodeCache(setting, root.curSelectedList[i][setting.treeId].tId)) {
                    root.curSelectedList.splice(i, 1);
                    setting.treeObj.trigger(consts.event.UNSELECTED, [node]);
                    i--;
                    j--;
                }
            }
        },
        setCache: function(setting, cache) {
            caches[setting.treeId] = cache;
        },
        setRoot: function(setting, root) {
            roots[setting.treeId] = root;
        },
        setZTreeTools: function(setting, zTreeTools) {
            for (var i = 0, j = _init.zTreeTools.length; i < j; i++) {
                _init.zTreeTools[i].apply(this, arguments);
            }
        },
        transformToArrayFormat: function(setting, nodes) {
            if (!nodes) return [];
            var r = [];
            if (tools.isArray(nodes)) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    _do(nodes[i]);
                }
            } else {
                _do(nodes);
            }
            return r;

            function _do(_node) {
                r.push(_node);
                var children = _node[setting.data.key.children];
                if (children) {
                    r = r.concat(data.transformToArrayFormat(setting, children));
                }
            }
        }
    },
    //method of event proxy
    event = {
        bindEvent: function(setting) {
            for (var i = 0, j = _init.bind.length; i < j; i++) {
                _init.bind[i].apply(this, arguments);
            }
        },
        unbindEvent: function(setting) {
            for (var i = 0, j = _init.unbind.length; i < j; i++) {
                _init.unbind[i].apply(this, arguments);
            }
        },
        bindTree: function(setting) {
            var eventParam = {
                treeId: setting.treeId
            },
            o = setting.treeObj;
            if (!setting.view.txtSelectedEnable) {
                // for can't select text
                o.bind('selectstart', handler.onSelectStart).css({
                    "-moz-user-select": "-moz-none"
                });
            }
            o.bind('click', eventParam, event.proxy);
            o.bind('dblclick', eventParam, event.proxy);
            o.bind('mouseover', eventParam, event.proxy);
            o.bind('mouseout', eventParam, event.proxy);
            o.bind('mousedown', eventParam, event.proxy);
            o.bind('mouseup', eventParam, event.proxy);
            o.bind('contextmenu', eventParam, event.proxy);
        },
        unbindTree: function(setting) {
            var o = setting.treeObj;
            o.unbind('selectstart', handler.onSelectStart).unbind('click', event.proxy).unbind('dblclick', event.proxy).unbind('mouseover', event.proxy).unbind('mouseout', event.proxy).unbind('mousedown', event.proxy).unbind('mouseup', event.proxy).unbind('contextmenu', event.proxy);
        },
        doProxy: function(e) {
            var results = [];
            for (var i = 0, j = _init.proxys.length; i < j; i++) {
                var proxyResult = _init.proxys[i].apply(this, arguments);
                results.push(proxyResult);
                if (proxyResult.stop) {
                    break;
                }
            }
            return results;
        },
        proxy: function(e) {
            var results = event.doProxy(e), r = true, x = false;
            for (var i = 0, l = results.length; i < l; i++) {
                var proxyResult = results[i];
                if (proxyResult.nodeEventCallback) {
                    x = true;
                    r = proxyResult.nodeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
                }
                if (proxyResult.treeEventCallback) {
                    x = true;
                    r = proxyResult.treeEventCallback.apply(proxyResult, [e, proxyResult.node]) && r;
                }
            }
            return r;
        }
    },
    //method of event handler
    handler = {
        onSwitchNode: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (node[setting.treeId].open) {
                if (tools.apply(setting.callback.beforeCollapse, [node, event], true) == false) return true;
                data.getRoot(setting).expandTriggerFlag = true;
                view.switchNode(setting, node, true);
            } else {
                if (tools.apply(setting.callback.beforeExpand, [node, event], true) == false) return true;
                data.getRoot(setting).expandTriggerFlag = true;
                view.switchNode(setting, node, false);
            }
            return true;
        },
        onClickNode: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (tools.apply(setting.callback.beforeClick, [node, event], true) == false) return true;
            view.selectNode(setting, node, true);
            setting.treeObj.trigger(consts.event.CLICK, [event, node]);
            return true;
        },
        onZTreeMousedown: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (tools.apply(setting.callback.beforeMouseDown, [node, event], true)) {
                tools.apply(setting.callback.onMouseDown, [node, event]);
            }
            return true;
        },
        onZTreeMouseup: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (tools.apply(setting.callback.beforeMouseUp, [node, event], true)) {
                tools.apply(setting.callback.onMouseUp, [node, event]);
            }
            return true;
        },
        onZTreeMouseover: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            tools.apply(setting.callback.onMouseOver, [node, event]);
            return true;
        },
        onZTreeMouseout: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            tools.apply(setting.callback.onMouseOut, [node, event]);
            return true;
        },
        onZTreeDblclick: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (tools.apply(setting.callback.beforeDblClick, [node, event], true)) {
                tools.apply(setting.callback.onDblClick, [node, event]);
            }
            return true;
        },
        onZTreeContextmenu: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (tools.apply(setting.callback.beforeRightClick, [node, event], true)) {
                tools.apply(setting.callback.onRightClick, [node, event]);
            }
            return (typeof setting.callback.onRightClick) != "function";
        },
        onSelectStart: function(e) {
            var n = e.originalEvent.srcElement.nodeName.toLowerCase();
            return (n === "input" || n === "textarea");
        }
    },
    //method of tools for zTree
    tools = {
        apply: function(fun, param, defaultValue) {
            if ((typeof fun) == "function") {
                return fun.apply(zt, param ? param: []);
            }
            return defaultValue;
        },
        canAsync: function(setting, node) {
            var children = node[setting.data.key.children];
            var isParent = node[setting.treeId].isParent;
            return (setting.async.enable && node && isParent && !(node[setting.treeId].zAsync || (children && children.length > 0)));
        },
        clone: function(obj) {
            if (obj === null) return null;
            var o = tools.isArray(obj) ? [] : {};
            for (var i in obj) {
                o[i] = (obj[i] instanceof Date) ? new Date(obj[i].getTime()) : (typeof obj[i] === "object" ? tools.clone(obj[i]) : obj[i]);
            }
            return o;
        },
        eqs: function(str1, str2) {
            return str1.toLowerCase() === str2.toLowerCase();
        },
        isArray: function(arr) {
            return Object.prototype.toString.apply(arr) === "[object Array]";
        },
        $: function(node, exp, setting) {
            if ( !! exp && typeof exp != "string") {
                setting = exp;
                exp = "";
            }
            if (typeof node == "string") {
                return $(node, setting ? setting.treeObj.get(0).ownerDocument: null);
            } else {
            	if (!node[setting.treeId]) {
            		return $();
            	}
                return $("#" + node[setting.treeId].tId + exp, setting ? setting.treeObj: null);
            }
        },
        getMDom: function(setting, curDom, targetExpr) {
            if (!curDom) return null;
            while (curDom && curDom.id !== setting.treeId) {
                for (var i = 0, l = targetExpr.length; curDom.tagName && i < l; i++) {
                    if (tools.eqs(curDom.tagName, targetExpr[i].tagName) && curDom.getAttribute(targetExpr[i].attrName) !== null) {
                        return curDom;
                    }
                }
                curDom = curDom.parentNode;
            }
            return null;
        },
        getNodeMainDom: function(target) {
            return ($(target).parent("li").get(0) || $(target).parentsUntil("li").parent().get(0));
        }
    },
    //method of operate ztree dom
    view = {
        addNodes: function(setting, parentNode, index, newNodes, isSilent) {
            if (setting.data.keep.leaf && parentNode && !parentNode[setting.treeId].isParent) {
                return;
            }
            if (!tools.isArray(newNodes)) {
                newNodes = [newNodes];
            }
            if (parentNode) {
                var target_switchObj = $$(parentNode, consts.id.SWITCH, setting),
                target_icoObj = $$(parentNode, consts.id.ICON, setting),
                target_ulObj = $$(parentNode, consts.id.UL, setting);
                var Z = parentNode[setting.treeId];
                if (!Z.open) {
                    view.replaceSwitchClass(Z.level, target_switchObj, consts.folder.CLOSE);
                    view.replaceIcoClass(target_icoObj, setting, parentNode, Z);
                    Z.open = false;
                    target_ulObj.css({
                        "display": "none"
                    });
                }
                data.addNodesData(setting, parentNode, index, newNodes);
                view.createNodes(setting, Z.level + 1, newNodes, parentNode, index);
                if (!isSilent) {
                    view.expandCollapseParentNode(setting, parentNode, true);
                }
            } else {
                data.addNodesData(setting, data.getRoot(setting), index, newNodes);
                view.createNodes(setting, 0, newNodes, null, index);
            }
        },
        appendNodes: function(setting, level, nodes, parentNode, index, initFlag, openFlag) {
            if (!nodes) return [];
            var tmpPNode = parentNode || data.getRoot(setting), tmpPChild = tmpPNode[setting.data.key.children], html = [], isFirstNode, isLastNode;
            if (!tmpPChild || index >= tmpPChild.length - nodes.length) {
                index = -1;
            }
            for (var i = 0, l = nodes.length, Z; i < l; i++) {
                var node = nodes[i];
                if (initFlag) {
                    isFirstNode = ((index === 0 || tmpPChild.length == nodes.length) && (i == 0));
                    isLastNode = (index < 0 && i == (nodes.length - 1));
                    data.initNode(setting, level, node, parentNode, isFirstNode, isLastNode, openFlag);
                    data.addNodeCache(setting, node);
                }
                Z = node[setting.treeId];
                var childHtml = [];
                var children = node[setting.data.key.children];
                if (children && children.length > 0) {
                    //make child html first, because checkType
                    childHtml = view.appendNodes(setting, level + 1, children, node, -1, initFlag, openFlag && Z.open);
                }
                if (openFlag && Z) {
                    view.makeDOMNodeMainBefore(html, setting, node, Z);
                    view.makeDOMNodeDiv(html, setting, node, Z);
                    view.makeDOMNodeLine(html, setting, node, Z);
                    data.getBeforeA(setting, node, html);
                    view.makeDOMNodeNameBefore(html, setting, node, Z);
                    data.getInnerBeforeA(setting, node, html);
                    view.makeDOMNodeIcon(html, setting, node, Z);
                    data.getInnerAfterIcon(setting, node, html);
                    view.makeDOMNodeName(html, setting, node, Z);
                    data.getInnerAfterA(setting, node, html);
                    html.push("</a>"); //view.makeDOMNodeNameAfter(html, setting, node);
                    data.getAfterA(setting, node, html);
                    html.push("</div>");
                    if (Z.isParent && Z.open) {
                        view.makeUlHtml(setting, node, html, childHtml.join(''), Z);
                    }
                    html.push("</li>"); //view.makeDOMNodeMainAfter(html, setting, node);
                    data.addCreatedNode(setting, node);
                    Z.dom = true;
                }
            }
            return html;
        },
        appendParentULDom: function(setting, node) {
            var html = [], nObj = $$(node, setting), Z = node[setting.treeId], parent;
            if (!nObj.get(0) && !!(parent = node[setting.data.key.parent])) {
                view.appendParentULDom(setting, parent); parent = null;
                nObj = $$(node, setting);
            }
            var ulObj = $$(node, consts.id.UL, setting);
            if (ulObj.get(0)) {
                ulObj.remove();
            }
            var children = node[setting.data.key.children],
            childHtml = view.appendNodes(setting, Z.level + 1, children, node, -1, false, true);
            view.makeUlHtml(setting, node, html, childHtml.join(''), Z);
            nObj.append(html.join(''));
        },
        asyncNode: function(setting, node, isSilent, callback) {
            if (node && !node[setting.treeId].isParent) {
                tools.apply(callback);
                return false;
            } else if (node && node[setting.treeId].isAjaxing) {
                return false;
            } else if (tools.apply(setting.callback.beforeAsync, [node], true) == false) {
                tools.apply(callback);
                return false;
            }
            if (node) {
                node[setting.treeId].isAjaxing = true;
                var icoObj = $$(node, consts.id.ICON, setting);
                icoObj.attr({
                    "style": "",
                    "class": consts.className.BUTTON + " " + consts.className.ICO_LOADING
                });
            }
            var i, l, tmpParam = {};
            var autoParam = tools.apply(setting.async.autoParam, [node], setting.async.autoParam);
            for (i = 0, l = autoParam.length; node && i < l; i++) {
                var pKey = autoParam[i].split("="), spKey = pKey;
                if (pKey.length > 1) {
                    spKey = pKey[1];
                    pKey = pKey[0];
                }
                tmpParam[spKey] = node[pKey];
            }
            var otherParam = tools.apply(setting.async.otherParam, [node], setting.async.otherParam);
            if (tools.isArray(otherParam)) {
                for (i = 0, l = otherParam.length; i < l; i += 2) {
                    tmpParam[otherParam[i]] = otherParam[i + 1];
                }
            } else {
                for (var p in otherParam) {
                    tmpParam[p] = otherParam[p];
                }
            }
            var _tmpV = data.getRoot(setting)._ver;
            $.ajax({
                contentType: setting.async.contentType,
                cache: false,
                type: setting.async.type,
                url: tools.apply(setting.async.url, [node], setting.async.url),
                data: setting.async.contentType.indexOf('application/json') > -1 ? JSON.stringify(tmpParam) : tmpParam,
                dataType: setting.async.dataType,
                headers: setting.async.headers,
                xhrFields: setting.async.xhrFields,
                success: function(msg) {
                    if (_tmpV != data.getRoot(setting)._ver) {
                        return;
                    }
                    var newNodes = [];
                    try {
                        if (!msg || msg.length == 0) {
                            newNodes = [];
                        } else if (typeof msg == "string") {
                            newNodes = eval("(" + msg + ")");
                        } else {
                            newNodes = msg;
                        }
                    } catch(err) {
                        newNodes = msg;
                    }
                    var Z = node ? node[setting.treeId] : null;
                    if (Z) {
                        Z.isAjaxing = null;
                        Z.zAsync = true;
                    }
                    view.setNodeLineIcos(setting, node, Z);
                    if (newNodes && newNodes !== "") {
                        newNodes = tools.apply(setting.async.dataFilter, [node, newNodes], newNodes);
                        view.addNodes(setting, node, -1, !!newNodes ? newNodes: [], !!isSilent);
                    } else {
                        view.addNodes(setting, node, -1, [], !!isSilent);
                    }
                    setting.treeObj.trigger(consts.event.ASYNC_SUCCESS, [node, msg]);
                    tools.apply(callback);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    if (_tmpV != data.getRoot(setting)._ver) {
                        return;
                    }
                    var Z = node ? node[setting.treeId] : null;
                    Z && (Z.isAjaxing = null);
                    view.setNodeLineIcos(setting, node, Z);
                    setting.treeObj.trigger(consts.event.ASYNC_ERROR, [node, XMLHttpRequest, textStatus, errorThrown]);
                }
            });
            return true;
        },
        cancelPreSelectedNode: function(setting, node, excludeNode) {
            var list = data.getRoot(setting).curSelectedList, i, n;
            for (i = list.length - 1; i >= 0; i--) {
                n = list[i];
                if (node === n || (!node && (!excludeNode || excludeNode !== n))) {
                    $$(n, consts.id.DIV, setting).css('background-color', '');
                    if (node) {
                        data.removeSelectedNode(setting, node);
                        break;
                    } else {
                        list.splice(i, 1);
                        setting.treeObj.trigger(consts.event.UNSELECTED, [n]);
                    }
                }
            }
        },
        createNodeCallback: function(setting) {
            if ( !! setting.callback.onNodeCreated || !!setting.view.addDiyDom) {
                var root = data.getRoot(setting);
                while (root.createdNodes.length > 0) {
                    var node = root.createdNodes.shift();
                    tools.apply(setting.view.addDiyDom, [node]);
                    if ( !! setting.callback.onNodeCreated) {
                        setting.treeObj.trigger(consts.event.NODECREATED, [node]);
                    }
                }
            }
        },
        createNodes: function(setting, level, nodes, parentNode, index) {
            if (!nodes || nodes.length == 0) return;
            var root = data.getRoot(setting),
            openFlag = !parentNode || parentNode[setting.treeId].open || !!$$(parentNode[setting.data.key.children][0], setting).get(0);
            root.createdNodes = [];
            var zTreeHtml = view.appendNodes(setting, level, nodes, parentNode, index, true, openFlag),
            parentObj,
            nextObj;
            if (!parentNode) {
                parentObj = setting.treeObj;
            } else {
                var ulObj = $$(parentNode, consts.id.UL, setting);
                if (ulObj.get(0)) {
                    parentObj = ulObj;
                }
            }
            if (parentObj) {
                if (index >= 0) {
                    nextObj = parentObj.children()[index];
                }
                if (index >= 0 && nextObj) {
                    $(nextObj).before(zTreeHtml.join(''));
                } else {
                    parentObj.append(zTreeHtml.join(''));
                }
            }
            view.createNodeCallback(setting);
        },
        destroy: function(setting) {
            if (!setting) return;
            let { nodes } = data.getCache(setting);
            if (nodes) {
                for (let i in nodes) {
                    if(nodes[i]) delete nodes[i][setting.treeId];
                }
            }
            data.initCache(setting);
            data.initRoot(setting);
            event.unbindTree(setting);
            event.unbindEvent(setting);
            setting.treeObj.empty();
            delete settings[setting.treeId];
        },
        expandCollapseNode: function(setting, node, expandFlag, animateFlag, callback) {
            var root = data.getRoot(setting);
            var _callback;
            if (!node) {
                tools.apply(callback, []);
                return;
            }
            var children = node[setting.data.key.children];
            var Z = node[setting.treeId];
            if (root.expandTriggerFlag) {
                _callback = callback;
                callback = function() {
                    if (_callback) _callback();
                    setting.treeObj.trigger(Z.open ? consts.event.EXPAND : consts.event.COLLAPSE, [node]);
                };
                root.expandTriggerFlag = false;
            }
            Z?Z=Z:Z={open:null}
            if (!Z.open && Z.isParent && ((!$$(node, consts.id.UL, setting).get(0)) || (children && children.length > 0 && !$$(children[0], setting).get(0)))) {
                view.appendParentULDom(setting, node);
                view.createNodeCallback(setting);
            }
            if (Z.open == expandFlag) {
                tools.apply(callback, []);
                return;
            }
            var ulObj = $$(node, consts.id.UL, setting),
            switchObj = $$(node, consts.id.SWITCH, setting),
            icoObj = $$(node, consts.id.ICON, setting);
            if (Z.isParent) {
                Z.open = !Z.open;
                if (setting.view.iconUrlFunction) {
                    icoObj.attr("style", view.makeNodeIcoStyle(setting, node, Z));
                }
                if (Z.open) {
                    view.replaceSwitchClass(Z.level, switchObj, consts.folder.OPEN);
                    view.replaceIcoClass(icoObj, setting, node, Z);
                    if (animateFlag == false || setting.view.expandSpeed == "") {
                        ulObj.show();
                        tools.apply(callback, []);
                    } else {
                        if (children && children.length > 0) {
                            ulObj.slideDown(setting.view.expandSpeed, callback);
                        } else {
                            ulObj.show();
                            tools.apply(callback, []);
                        }
                    }
                } else {
                    view.replaceSwitchClass(Z.level, switchObj, consts.folder.CLOSE);
                    view.replaceIcoClass(icoObj, setting, node, Z);
                    if (animateFlag == false || setting.view.expandSpeed == "" || !(children && children.length > 0)) {
                        ulObj.hide();
                        tools.apply(callback, []);
                    } else {
                        ulObj.slideUp(setting.view.expandSpeed, callback);
                    }
                }
            } else {
                tools.apply(callback, []);
            }
        },
        expandCollapseParentNode: function(setting, node, expandFlag, animateFlag, callback) {
            if (!node) return;
            var parent = node[setting.data.key.parent];
            var Z = parent ? parent[setting.treeId] : null;
            parent = Z ? data.getNodeCache(setting, Z.tId) : null;
            if (!parent) {
                view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
            } else {
                view.expandCollapseNode(setting, node, expandFlag, animateFlag);
                view.expandCollapseParentNode(setting, parent, expandFlag, animateFlag, callback);
            }
        },
        expandCollapseSonNode: function(setting, node, expandFlag, animateFlag, callback) {
            var root = data.getRoot(setting),
            treeNodes = node ? node[setting.data.key.children] : root[setting.data.key.children],
            selfAnimateSign = node ? false: animateFlag,
            expandTriggerFlag = data.getRoot(setting).expandTriggerFlag;
            data.getRoot(setting).expandTriggerFlag = false;
            if (treeNodes) {
                for (var i = 0, l = treeNodes.length; i < l; i++) {
                    if (treeNodes[i]) view.expandCollapseSonNode(setting, treeNodes[i], expandFlag, selfAnimateSign);
                }
            }
            data.getRoot(setting).expandTriggerFlag = expandTriggerFlag;
            view.expandCollapseNode(setting, node, expandFlag, animateFlag, callback);
        },
        isSelectedNode: function(setting, node) {
            if (!node) {
                return false;
            }
            var list = data.getRoot(setting).curSelectedList, i;
            for (i = list.length - 1; i >= 0; i--) {
                if (node === list[i]) {
                    return true;
                }
            }
            return false;
        },
        makeDOMNodeDiv: function(html, setting, node, Z) {
            html.push("<div id='" + Z.tId + "_div' treeNode_div style='height:22px");
            if (setting.view.hideFunction) {
            	Z.hide = setting.view.hideFunction(node);
            	Z.hide && html.push(";display:none");
            }
            html.push("'");
        	if (setting.view.titleFunction) {
                var title = setting.view.titleFunction(node);
                if (title) html.push(" title='", title.replace(/'/g, "&#39;").replace(/</g, '&lt;').replace(/>/g, '&gt;'), "'");
            }
            html.push(">");
        },
        makeDOMNodeIcon: function(html, setting, node, Z) {
            html.push("<span id='", Z.tId, consts.id.ICON, "' treeNode", consts.id.ICON, " class='", view.makeNodeIcoClass(setting, node, Z), "' style='", view.makeNodeIcoStyle(setting, node, Z), "'></span>");
        },
        makeDOMNodeName: function(html, setting, node, Z) {
            var nameStr = data.nodeName(setting, node),
            name = nameStr ? setting.view.nameIsHTML ? nameStr: nameStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            html.push("<span id='", Z.tId, consts.id.SPAN, "' class='", consts.className.NAME, "'>", name, "</span>");
        },
        makeDOMNodeLine: function(html, setting, node, Z) {
            html.push("<span id='", Z.tId, consts.id.SWITCH, "' class='", view.makeNodeLineClass(setting, node, Z), "' treeNode", consts.id.SWITCH, "></span>");
        },
        makeDOMNodeMainBefore: function(html, setting, node, Z) {
            html.push("<li id='", Z.tId, "' class='", consts.className.LEVEL, Z.level, "' tabindex='0' hidefocus='true' treenode>");
        },
        makeDOMNodeNameBefore: function(html, setting, node, Z) {
            html.push("<a id='", Z.tId, consts.id.A, "' class='", consts.className.LEVEL, Z.level, "' treeNode", consts.id.A, ">"); //, " onclick=\"", (Z.click || ''), "\" ", "style='", fontStyle.join(''), "'"
        },
        makeNodeIcoClass: function(setting, node, Z) {
            var iconCss = consts.className.BUTTON + " ico ";
            if (!Z.isAjaxing) {
                if (setting.view.iconCssFunction) {
                    var css = setting.view.iconCssFunction(node, Z.open);
                    if (css) return iconCss + css;
                }
                if (Z.isParent) {
                    iconCss += 'ico_' + (Z.open ? consts.folder.OPEN: consts.folder.CLOSE);
                } else {
                    iconCss += 'ico_' + consts.folder.DOCU;
                }
            }
            return iconCss;
        },
        makeNodeIcoStyle: function(setting, node, Z) {
            if (!Z.isAjaxing && setting.view.iconUrlFunction) {
                var iconUrl = setting.view.iconUrlFunction(node, Z.open);
                if (iconUrl) return "background-size:16px 16px;background-image:url(" + iconUrl + ");";
            }
            return '';
        },
        makeNodeLineClass: function(setting, node, Z) {
            var lineClass = [];
            if (setting.view.showLine) {
                if (Z.level == 0 && Z.isFirstNode && Z.isLastNode) {
                    lineClass.push(consts.line.ROOT);
                } else if (Z.level == 0 && Z.isFirstNode) {
                    lineClass.push(consts.line.ROOTS);
                } else if (Z.isLastNode) {
                    lineClass.push(consts.line.BOTTOM);
                } else {
                    lineClass.push(consts.line.CENTER);
                }
            } else {
                lineClass.push(consts.line.NOLINE);
            }
            if (Z.isParent) {
                lineClass.push(Z.open ? consts.folder.OPEN: consts.folder.CLOSE);
            } else {
                lineClass.push(consts.folder.DOCU);
            }
            return view.makeNodeLineClassEx(Z.level) + lineClass.join('_');
        },
        makeNodeLineClassEx: function(level) {
            return consts.className.BUTTON + " " + consts.className.LEVEL + level + " " + consts.className.SWITCH + " ";
        },
        makeUlHtml: function(setting, node, html, content, Z) {
            html.push("<ul id='", Z.tId, consts.id.UL, "' class='", consts.className.LEVEL, Z.level, " ", view.makeUlLineClass(setting, Z), "' style='display:", (Z.open ? "block": "none"), "'>");
            html.push(content);
            html.push("</ul>");
        },
        makeUlLineClass: function(setting, Z) {
            return (setting.view.showLine && !Z.isLastNode) ? consts.line.LINE: "";
        },
        removeChildNodes: function(setting, node) {
            if (!node) return;
            var nodes = node[setting.data.key.children];
            if (!nodes) return;
            for (var i = 0, l = nodes.length; i < l; i++) {
                data.removeNodeCache(setting, nodes[i]);
                delete nodes[i][setting.treeId];
            }
            data.removeSelectedNode(setting);
            delete node[setting.data.key.children];
            if (!setting.data.keep.parent) {
                var Z = node[setting.treeId];
                Z.isParent = false;
                Z.open = false;
                var tmp_switchObj = $$(node, consts.id.SWITCH, setting),
                tmp_icoObj = $$(node, consts.id.ICON, setting);
                view.replaceSwitchClass(Z.level, tmp_switchObj, consts.folder.DOCU);
                view.replaceIcoClass(tmp_icoObj, setting, node, Z);
                $$(node, consts.id.UL, setting).remove();
            } else {
                $$(node, consts.id.UL, setting).empty();
            }
        },
        scrollIntoView: function(setting, dom) {
            if (!dom) {
                return;
            }
            // support IE 7
            if (typeof Element === 'undefined') {
                var contRect = setting.treeObj.get(0).getBoundingClientRect(), findMeRect = dom.getBoundingClientRect();
                if (findMeRect.top < contRect.top || findMeRect.bottom > contRect.bottom || findMeRect.right > contRect.right || findMeRect.left < contRect.left) {
                    dom.scrollIntoView();
                }
                return;
            }
            // CC-BY jocki84@googlemail.com, https://gist.github.com/jocki84/6ffafd003387179a988e
            if (!Element.prototype.scrollIntoViewIfNeeded) {
                Element.prototype.scrollIntoViewIfNeeded = function(centerIfNeeded) {
                    "use strict";

                    function makeRange(start, length) {
                        return {
                            "start": start,
                            "length": length,
                            "end": start + length
                        };
                    }

                    function coverRange(inner, outer) {
                        if (false === centerIfNeeded || (outer.start < inner.end && inner.start < outer.end)) {
                            return Math.max(inner.end - outer.length, Math.min(outer.start, inner.start));
                        }
                        return (inner.start + inner.end - outer.length) / 2;
                    }

                    function makePoint(x, y) {
                        return {
                            "x": x,
                            "y": y,
                            "translate": function translate(dX, dY) {
                                return makePoint(x + dX, y + dY);
                            }
                        };
                    }

                    function absolute(elem, pt) {
                        while (elem) {
                            pt = pt.translate(elem.offsetLeft, elem.offsetTop);
                            elem = elem.offsetParent;
                        }
                        return pt;
                    }
                    var target = absolute(this, makePoint(0, 0)), extent = makePoint(this.offsetWidth, this.offsetHeight), elem = this.parentNode, origin;
                    while (elem instanceof HTMLElement) {
                        // Apply desired scroll amount.
                        origin = absolute(elem, makePoint(elem.clientLeft, elem.clientTop));
                        //elem.scrollLeft = coverRange(makeRange(target.x - origin.x, extent.x), makeRange(elem.scrollLeft, elem.clientWidth));
                        elem.scrollTop = coverRange(makeRange(target.y - origin.y, extent.y), makeRange(elem.scrollTop, elem.clientHeight));
                        // Determine actual scroll amount by reading back scroll properties.
                        target = target.translate( - elem.scrollLeft, -elem.scrollTop);
                        elem = elem.parentNode;
                    }
                };
            }
            dom.scrollIntoViewIfNeeded();
            let treeDom = setting.treeObj.get(0).parentNode;
            treeDom.scrollBy(-1000, 0);
        },
        setFirstNode: function(setting, parentNode) {
            var children = parentNode[setting.data.key.children];
            if (children && children.length > 0) {
                children[0][setting.treeId].isFirstNode = true;
            }
        },
        setLastNode: function(setting, parentNode) {
            var children = parentNode[setting.data.key.children];
            if (children && children.length > 0) {
                children[children.length - 1][setting.treeId].isLastNode = true;
            }
        },
        removeNode: function(setting, node) {
            var root = data.getRoot(setting), parentNode = node[setting.data.key.parent] || root, Z = node[setting.treeId];
            Z.isFirstNode = false;
            Z.isLastNode = false;
            if (!data.getNodeCache(setting, Z.tId)) {
                return;
            }
            $$(node, setting).remove();
            data.removeNodeCache(setting, node);
            data.removeSelectedNode(setting, node);
            var children = parentNode[setting.data.key.children] || [];
            for (var i = 0, l = children.length; i < l; i++) {
                if (children[i][setting.treeId].tId == Z.tId) {
                    children.splice(i, 1);
                    break;
                }
            }
            delete node[setting.treeId];
            view.setFirstNode(setting, parentNode);
            view.setLastNode(setting, parentNode);
            var tmp_ulObj, tmp_switchObj, tmp_icoObj, childLength = children.length;
            //repair nodes old parent
            if (!setting.data.keep.parent && childLength == 0) {
                //old parentNode has no child nodes
                var pZ = parentNode[setting.treeId];
                pZ.isParent = false;
                pZ.open = false;
                delete parentNode[setting.data.key.children];
                tmp_ulObj = $$(parentNode, consts.id.UL, setting);
                tmp_switchObj = $$(parentNode, consts.id.SWITCH, setting);
                tmp_icoObj = $$(parentNode, consts.id.ICON, setting);
                view.replaceSwitchClass(pZ.level, tmp_switchObj, consts.folder.DOCU);
                view.replaceIcoClass(tmp_icoObj, setting, parentNode, pZ);
                tmp_ulObj.css("display", "none");
            } else if (setting.view.showLine && childLength > 0) {
                //old parentNode has child nodes
                var newLast = children[childLength - 1];
                tmp_ulObj = $$(newLast, consts.id.UL, setting);
                tmp_switchObj = $$(newLast, consts.id.SWITCH, setting);
                tmp_icoObj = $$(newLast, consts.id.ICON, setting);
                if (parentNode == root) {
                    if (children.length == 1) {
                        //node was root, and ztree has only one root after move node
                        view.replaceSwitchClass(newLast[setting.treeId].level, tmp_switchObj, consts.line.ROOT);
                    } else {
                        var tmp_first_switchObj = $$(children[0], consts.id.SWITCH, setting);
                        view.replaceSwitchClass(children[0][setting.treeId].level, tmp_first_switchObj, consts.line.ROOTS);
                        view.replaceSwitchClass(newLast[setting.treeId].level, tmp_switchObj, consts.line.BOTTOM);
                    }
                } else {
                    view.replaceSwitchClass(newLast[setting.treeId].level, tmp_switchObj, consts.line.BOTTOM);
                }
                tmp_ulObj.removeClass(consts.line.LINE);
            }
        },
        replaceIcoClass: function(obj, setting, node, Z) {
            if (!obj || Z.isAjaxing) return;
            obj.attr("class", this.makeNodeIcoClass(setting, node, Z));
        },
        replaceSwitchClass: function(level, obj, newName) {
            if (!obj) return;
            var tmpName = obj.attr("class");
            if (tmpName == undefined) return;
            var tmpList = tmpName.split("_");
            switch (newName) {
            case consts.line.ROOT:
            case consts.line.ROOTS:
            case consts.line.CENTER:
            case consts.line.BOTTOM:
            case consts.line.NOLINE:
                tmpList[0] = view.makeNodeLineClassEx(level) + newName;
                break;
            case consts.folder.OPEN:
            case consts.folder.CLOSE:
            case consts.folder.DOCU:
                tmpList[1] = newName;
                break;
            }
            obj.attr("class", tmpList.join("_"));
            if (newName !== consts.folder.DOCU) {
                obj.removeAttr("disabled");
            } else {
                obj.attr("disabled", "disabled");
            }
        },
        selectNode: function(setting, node) {
        	view.cancelPreSelectedNode(setting, null, node);
            $$(node, consts.id.DIV, setting).css('background-color', $_theme.selected_color);
            data.addSelectedNode(setting, node);
            setting.treeObj.trigger(consts.event.SELECTED, [node]);
        },
        setNodeLineIcos: function(setting, node, Z) {
            if (!node) return;
            var switchObj = $$(node, consts.id.SWITCH, setting),
            ulObj = $$(node, consts.id.UL, setting),
            icoObj = $$(node, consts.id.ICON, setting),
            ulLine = view.makeUlLineClass(setting, Z);
            if (ulLine.length == 0) {
                ulObj.removeClass(consts.line.LINE);
            } else {
                ulObj.addClass(ulLine);
            }
            switchObj.attr("class", view.makeNodeLineClass(setting, node, Z));
            if (Z.isParent) {
                switchObj.removeAttr("disabled");
            } else {
                switchObj.attr("disabled", "disabled");
            }
            icoObj.removeAttr("style");
            icoObj.attr("style", view.makeNodeIcoStyle(setting, node, Z));
            icoObj.attr("class", view.makeNodeIcoClass(setting, node, Z));
        },
        setNodeName: function(setting, node) {
            var nObj = $$(node, consts.id.SPAN, setting);
            nObj.empty();
            if (setting.view.nameIsHTML) {
                nObj.html(data.nodeName(setting, node));
            } else {
                nObj.text(data.nodeName(setting, node));
            }
        },
        setNodeTitle: function(setting, node) {
            if (setting.view.titleFunction) {
                var title = setting.view.titleFunction(node);
                $$(node, consts.id.DIV, setting).attr("title", !title ? "": title);
            }
        },
        setNodeHide: function(setting, node, Z) {
            if (setting.view.hideFunction) {
                var hide = setting.view.hideFunction(node);
                if ((Z.hide||false) === hide) return;
                Z.hide = hide;
                $$(node, consts.id.DIV, setting).css("display", hide ? "none": '');
                $$(node, consts.id.UL, setting).css("display", hide ? "none": '');
            }
        },
        switchNode: function(setting, node, open) {
            if (open || !tools.canAsync(setting, node)) {
                view.expandCollapseNode(setting, node, !open);
            } else if (setting.async.enable) {
                if (!view.asyncNode(setting, node)) {
                    view.expandCollapseNode(setting, node, !open);
                    return;
                }
            } else if (node) {
                view.expandCollapseNode(setting, node, !open);
            }
        }
    };
    // zTree defind
    $.fn.zTree = {
        consts: _consts,
        _z: {
            tools: tools,
            view: view,
            event: event,
            data: data
        },
        getZTreeObj: function(treeId) {
            var o = data.getZTreeTools(treeId);
            return o ? o: null;
        },
        destroy: function(treeId) {
            if ( !! treeId && treeId.length > 0) {
                view.destroy(data.getSetting(treeId));
            } else {
                for (var s in settings) {
                    view.destroy(settings[s]);
                }
            }
        },
        init: function(obj, zSetting, zNodes) {
            var setting = tools.clone(_setting);
            $.extend(true, setting, zSetting);
            setting.treeId = obj.attr("id");
            setting.treeObj = obj;
            setting.treeObj.empty();
            settings[setting.treeId] = setting;
            //For some older browser,(e.g., ie6)
            if (typeof document.body.style.maxHeight === "undefined") {
                setting.view.expandSpeed = "";
            }
            data.initRoot(setting);
            var root = data.getRoot(setting);
            zNodes = zNodes ? (tools.isArray(zNodes) ? zNodes: [zNodes]) : [];
            root[setting.data.key.children] = zNodes;
            data.initCache(setting);
            event.unbindTree(setting);
            event.bindTree(setting);
            event.unbindEvent(setting);
            event.bindEvent(setting);
            var zTreeTools = {
                setting: setting,
                addNodes: function(parentNode, index, newNodes, isSilent) {
                    if (!parentNode) parentNode = null;
                    if (parentNode && !parentNode[setting.treeId].isParent && setting.data.keep.leaf) return null;
                    var i = parseInt(index, 10);
                    if (isNaN(i)) {
                        isSilent = !!newNodes;
                        newNodes = index;
                        index = -1;
                    } else {
                        index = i;
                    }
                    if (!newNodes) return null;
                    var xNewNodes = tools.isArray(newNodes) ? newNodes: [newNodes];

                    function addCallback() {
                        view.addNodes(setting, parentNode, index, xNewNodes, (isSilent == true));
                    }
                    if (tools.canAsync(setting, parentNode)) {
                        view.asyncNode(setting, parentNode, isSilent, addCallback);
                    } else {
                        addCallback();
                    }
                    return xNewNodes;
                },
                cancelSelectedNode: function(node) {
                    view.cancelPreSelectedNode(setting, node);
                },
                destroy: function() {
                    view.destroy(setting);
                },
                expandAll: function(expandFlag) {
                    expandFlag = !!expandFlag;
                    view.expandCollapseSonNode(setting, null, expandFlag, true);
                    return expandFlag;
                },
                expandNode: function(node, expandFlag, sonSign, focus, callbackFlag) {
                    if (!node) return null;
                    var Z = node[setting.treeId];
                    if (!Z.isParent || expandFlag === !!Z.open) return null;
                    if (expandFlag !== true && expandFlag !== false) {
                        expandFlag = !Z.open;
                    }
                    callbackFlag = !!callbackFlag;
                    if (callbackFlag && expandFlag && (tools.apply(setting.callback.beforeExpand, [node], true) == false)) {
                        return null;
                    } else if (callbackFlag && !expandFlag && (tools.apply(setting.callback.beforeCollapse, [node], true) == false)) {
                        return null;
                    }
                    var parent;
                    if (expandFlag && (parent = node[setting.data.key.parent])) {
                        view.expandCollapseParentNode(setting, parent, expandFlag, false); parent = null;
                    }
                    if (expandFlag === Z.open && !sonSign) {
                        return null;
                    }
                    data.getRoot(setting).expandTriggerFlag = callbackFlag;
                    if (!tools.canAsync(setting, node) && sonSign) {
                        view.expandCollapseSonNode(setting, node, expandFlag, true, showNodeFocus);
                    } else {
                        Z.open = !expandFlag;
                        view.switchNode(this.setting, node, Z.open);
                        showNodeFocus();
                    }
                    return expandFlag;

                    function showNodeFocus() {
                        var a = $$(node, setting).get(0);
                        if (a && focus !== false) {
                            view.scrollIntoView(setting, a);
                        }
                    }
                },
                getNodes: function() {
                    return data.getNodes(setting);
                },
                getNodeByParam: function(key, value, parentNode) {
                    if (!key) return null;
                    return data.getNodeByParam(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), key, value);
                },
                getNodeByTId: function(tId) {
                    return data.getNodeCache(setting, tId);
                },
                getNodesByParam: function(key, value, parentNode) {
                    if (!key) return null;
                    return data.getNodesByParam(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), key, value);
                },
                getNodesByParamFuzzy: function(key, value, parentNode) {
                    if (!key) return null;
                    return data.getNodesByParamFuzzy(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), key, value);
                },
                getNodesByFilter: function(filter, isSingle, parentNode, invokeParam) {
                    isSingle = !!isSingle;
                    if (!filter || (typeof filter != "function")) return (isSingle ? null: []);
                    return data.getNodesByFilter(setting, parentNode ? parentNode[setting.data.key.children] : data.getNodes(setting), filter, isSingle, invokeParam);
                },
                getSelectedNodes: function() {
                    var r = [], list = data.getRoot(setting).curSelectedList;
                    for (var i = 0, l = list.length; i < l; i++) {
                        r.push(list[i]);
                    }
                    return r;
                },
                isSelectedNode: function(node) {
                    return data.isSelectedNode(setting, node);
                },
                reAsyncChildNodesPromise: function(parentNode, reloadType, isSilent) {
                    var promise = new Promise(function(resolve, reject) {
                        try {
                            zTreeTools.reAsyncChildNodes(parentNode, reloadType, isSilent, function() {
                                resolve(parentNode);
                            });
                        } catch(e) {
                            reject(e);
                        }
                    });
                    return promise;
                },
                reAsyncChildNodes: function(parentNode, reloadType, isSilent, callback) {
                    if (!this.setting.async.enable) return;
                    var isRoot = !parentNode;
                    if (isRoot) {
                        parentNode = data.getRoot(setting);
                    }
                    if (reloadType == "refresh") {
                        var children = parentNode[setting.data.key.children];
                        for (var i = 0, l = children ? children.length: 0; i < l; i++) {
                            data.removeNodeCache(setting, children[i]);
                        }
                        data.removeSelectedNode(setting);
                        parentNode[setting.data.key.children] = [];
                        if (isRoot) {
                            this.setting.treeObj.empty();
                        } else {
                            var ulObj = $$(parentNode, consts.id.UL, setting);
                            ulObj.empty();
                        }
                    }
                    view.asyncNode(this.setting, isRoot ? null: parentNode, !!isSilent, callback);
                },
                refresh: function(nodes) {
                	let selectedList = data.getRoot(setting).curSelectedList || [];
                    this.setting.treeObj.empty();
                    var root = data.getRoot(setting);
                    nodes = nodes || root[setting.data.key.children];
                    data.initRoot(setting);
                    root[setting.data.key.children] = nodes;
                    data.initCache(setting);
                    view.createNodes(setting, 0, nodes, null, -1);
                    selectedList.forEach(node => view.selectNode(setting, node));
                },
                reset: function(zNodes,keep=false) {
                    let { nodes } = data.getCache(this.setting);
                    if (nodes) {
                    	let treeId = this.setting.treeId, node;
                    	for (let i in nodes) {
                    		node = nodes[i];
                    		if (!node || !node[treeId]) continue;
                    		!keep ? (delete node[treeId]) : (node[treeId].dom=false);
                        }
                    }
                    zNodes = zNodes ? (tools.isArray(zNodes) ? zNodes: [zNodes]) : [];
                    zNodes.length == 1 && (zNodes[0][this.setting.treeId] = zNodes[0][this.setting.treeId] || {open: true});
                    this.setting.treeObj.empty();
                    var root = data.getRoot(setting);
                    data.initRoot(setting);
                    root[setting.data.key.children] = zNodes;
                    data.initCache(setting);
                    view.createNodes(setting, 0, zNodes, null, -1);
                },
                removeChildNodes: function(node) {
                    if (!node) return null;
                    var nodes = node[setting.data.key.children];
                    view.removeChildNodes(setting, node);
                    return nodes ? nodes: null;
                },
                removeNode: function(node, callbackFlag) {
                    if (!node || !node[setting.treeId]) return;
                    callbackFlag = !!callbackFlag;
                    if (callbackFlag && tools.apply(setting.callback.beforeRemove, [node], true) == false) return;
                    view.removeNode(setting, node);
                    if (callbackFlag) {
                        this.setting.treeObj.trigger(consts.event.REMOVE, [node]);
                    }
                },
                selectNode: function(node, isSilent) {
                    if (!node) return;
                    var parent = node[setting.data.key.parent];
                	var Z = parent ? parent[setting.treeId] : null;
                    parent = Z ? data.getNodeCache(setting, Z.tId) : null;
                    if (parent) {
                        view.expandCollapseParentNode(setting, parent, true, false, showNodeFocus); parent = null;
                    } else if (!isSilent) {
                        try {
                            $$(node, setting).focus().blur();
                        } catch(e) {}
                    }
                    view.selectNode(setting, node);

                    function showNodeFocus() {
                        if (isSilent) {
                            return;
                        }
                        var a = $$(node, setting).get(0);
                        view.scrollIntoView(setting, a);
                    }
                },
                transformTozTreeNodes: function(simpleNodes) {
                    return data.transformTozTreeFormat(setting, simpleNodes);
                },
                transformToArray: function(nodes) {
                    return data.transformToArrayFormat(setting, nodes);
                },
                updateNodeName: function(node) {
                    var Z = node[setting.treeId];
                    Z && Z.dom && view.setNodeName(setting, node);
                    return !!(Z && Z.dom);
                },
                updateNodeIcon: function(node) {
                	var Z = node[setting.treeId];
                	Z && Z.dom && view.setNodeLineIcos(setting, node, Z);
                    return !!(Z && Z.dom);
                },
                updateNodeTitle: function(node) {
                	var Z = node[setting.treeId];
                	Z && Z.dom && view.setNodeTitle(setting, node);
                    return !!(Z && Z.dom);
                },
                updateNodeHide: function(node) {
                	var Z = node[setting.treeId];
                	Z && Z.dom && view.setNodeHide(setting, node, Z);
                    return !!(Z && Z.dom);
                },
                updateNode: function(node) {
                	var Z = node[setting.treeId];
                    if (Z && Z.dom) {
                        view.setNodeLineIcos(setting, node, Z);
                        view.setNodeName(setting, node);
                        view.setNodeTitle(setting, node);
                        view.setNodeHide(setting, node, Z);
                    }
                    return !!(Z && Z.dom);
                },
                getA: function(node) {
                	return $$(node, consts.id.A, setting);
                }
            };
            root.treeTools = zTreeTools;
            data.setZTreeTools(setting, zTreeTools);
            var children = root[setting.data.key.children];
            if (children && children.length > 0) {
                view.createNodes(setting, 0, children, null, -1);
            } else if (setting.async.enable && setting.async.url && setting.async.url !== '') {
                view.asyncNode(setting);
            }
            return zTreeTools;
        }
    };
    var zt = $.fn.zTree,
    $$ = tools.$,
    consts = zt.consts;
})(jQuery);