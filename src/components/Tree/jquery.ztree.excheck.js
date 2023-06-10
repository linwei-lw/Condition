/*
 * JQuery zTree excheck v3.5.40
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
    var _consts = {
        event: {
            CHECK: "ztree_check"
        },
        id: {
            CHECK: "_check"
        },
        checkbox: {
            DEFAULT: "chk"
        }
    },
    _setting = {
        check: {
            enable: false,        //是否是多选树
            P: true,            //是否级联勾选父结点
            PX: false,             //是否级联勾选父结点（只半勾选）
            S: true,               //是否级联勾选子结点
            hasChecked:true,//是否需要勾选上搜索的结点
            hasOwnField: null    //是否只对具有该属性的结点才可勾选
        },
        callback: {
            beforeCheck: null,
            onCheck: null
        }
    },
    _bindEvent = function(setting) {
        var o = setting.treeObj, c = consts.event;
        o.bind(c.CHECK, function(event, node, chgs, value, srcEvent) {
            event.srcEvent = srcEvent;
            tools.apply(setting.callback.onCheck, [node, chgs, value, event]);
        });
    },
    _unbindEvent = function(setting) {
        setting.treeObj.unbind(consts.event.CHECK);
    },
    _eventProxy = function(e) {
        var target = e.target,
        setting = data.getSetting(e.data.treeId),
        node = null,
        nodeEventType = "",
        treeEventType = "",
        nodeEventCallback = null,
        treeEventCallback = null;
        if (setting.check.enable && tools.eqs(e.type, "click")) {
            if (tools.eqs(target.tagName, "span") && target.getAttribute("treeNode" + consts.id.CHECK) !== null) {
                var tId = tools.getNodeMainDom(target).id;
                nodeEventType = "checkNode";
                node = data.getNodeCache(setting, tId);
                nodeEventCallback = _handler.onCheckNode;
            }
        }
        var proxyResult = {
            stop: false,
            //nodeEventType === "checkNode",
            node: node,
            nodeEventType: nodeEventType,
            nodeEventCallback: nodeEventCallback,
            treeEventType: treeEventType,
            treeEventCallback: treeEventCallback
        };
        return proxyResult
    },
    // add dom for check
    _beforeA = function(setting, node, html) {
        if (setting.check.enable) {
            html.push("<span ID='", node[setting.treeId].tId, consts.id.CHECK, "' class='", view.makeChkClass(setting, node), "' treeNode", consts.id.CHECK, "></span>");
        }
    },
    // update zTreeObj, add method of check
    _zTreeTools = function(setting, zTreeTools) {

        zTreeTools.checkNode = function(node, value, checkTypeFlag, callbackFlag) {
            callbackFlag = !!callbackFlag;
            value = !!value ? 1 : 0;
            if (!node[this.setting.treeId]) return;
            if ((node[this.setting.treeId].value || 0) === value) {
                return;
            } else if (callbackFlag && tools.apply(this.setting.callback.beforeCheck, [node], true) == false) {
                return;
            }
            if (this.setting.check.enable) {
                node[this.setting.treeId].value = value;
                view.setChkClass(this.setting, node);
                var hasOwnField = this.setting.check.hasOwnField;
                var chgs = !hasOwnField || node.hasOwnProperty(hasOwnField) ? [node] : [];
                if (checkTypeFlag) view.checkNodeRelation(this.setting, node, value, chgs);
                if (callbackFlag) {
                    this.setting.treeObj.trigger(consts.event.CHECK, [node, chgs, value]);
                }
            }
        }

        zTreeTools.checkAllNodes = function(value) {
            view.repairAllChk(this.setting, !!value ? 1 : 0);
        }

        /*
       * @param onlyChecked 只取全勾选，半勾选不要
       * @param onlyTop     只取顶级勾选结点，子孙勾选不要
       * @param field       取指定字段，为空表示取整个勾选结点
       * @param hasOwnField 指定拥有该属性的结点，为空表示所有结点
       * @param children    从这些结点中查找
       * @param ignoreFun   忽略回调，返回true则忽略该结点（子结点不忽略，继续递归)
       */
        zTreeTools.getCheckedNodes = function(onlyChecked = true, onlyTop = false, field = null, hasOwnField = null, children = null, ignoreFun = null, result = null) {
            result = result || [];
            children = children || data.getRoot(this.setting)[this.setting.data.key.children];
            if (!children || children.length == 0) return result;
            for (var i = 0, len = children.length, node, added, ignore, nodes, Z; i < len; i++) {
                added = ignore = false;
                node = children[i];
                ignoreFun && (ignore = ignoreFun(node));
                Z = node[this.setting.treeId];
                if (Z && this.setting.view.hideFunction) {
                    if (Z.hide === true || (Z.hide == undefined && this.setting.view.hideFunction(node) === true)) {
                        continue;
                    }
                }
                if (Z && !ignore && (!hasOwnField || node.hasOwnProperty(hasOwnField))) {
                    if (Z.value === 1 || (!onlyChecked && Z.value === 2)) {
                        result.push(field ? node[field] : node);
                        added = true;
                    }
                }
                if (Z && !ignore && Z.value === 1 && onlyTop) continue;//如果结点选中，但又是只取选中顶点，直接跳过子结点
                if (added == false || onlyTop == false) {
                    nodes = node[this.setting.data.key.children];
                    if (nodes && nodes.length > 0) {
                        zTreeTools.getCheckedNodes(onlyChecked, onlyTop, field, hasOwnField, nodes, ignoreFun, result);
                    }
                }
            }
            return result;
        }

        var _updateNode = zTreeTools.updateNode;
        zTreeTools.updateNode = function(node, checkTypeFlag) {
            if (_updateNode) _updateNode.apply(zTreeTools, arguments);
            if (!node || !this.setting.check.enable) return;
            var nObj = $$(node, this.setting);
            if (nObj.get(0)) {
                view.setChkClass(this.setting, node);
                if (checkTypeFlag == true) view.checkNodeRelation(this.setting, node, node[this.setting.treeId].value);
            }
        }
    },
    _data = {},
    _event = {},
    _handler = {
        onCheckNode: function(event, node) {
            var setting = data.getSetting(event.data.treeId);
            if (tools.apply(setting.callback.beforeCheck, [node], true) == false) return true;
            var value = node[setting.treeId].value;
            value = (value == 1 || value == 2) ? 0 : 1;
            node[setting.treeId].value = value;
            view.setChkClass(setting, node);
            var hasOwnField = setting.check.hasOwnField;
            var chgs = !hasOwnField || node.hasOwnProperty(hasOwnField) ? [node] : [];
            view.checkNodeRelation(setting, node, value, chgs);
            setting.treeObj.trigger(consts.event.CHECK, [node, chgs, value, event]);
            return true;
        }
    },
    _tools = {},
    _view = {
        checkNodeRelation: function(setting, node, value, chgs) {
            if (setting.check.S && node[setting.data.key.children]) {
                view.setSonNodeCheckBox(setting, node, node[setting.data.key.children], value, chgs);
            }
            if (setting.check.P) {
                view.setParentNodeCheckBox(setting, node, value, chgs);
            } else if (setting.check.PX) {
                view.setParentNodeCheckBox2(setting, node, value);
            }
        },
        setParentNodeCheckBox: function(setting, node, value, chgs) {
            var parent = node[setting.data.key.parent];
            if (!parent) return;
            var Z = node[setting.treeId], allChecked = value === 1, allUnchecked = value === 0;
            if (value !== 2) {
                var children = parent[setting.data.key.children];
                for (var i = 0, l = children.length; i < l; i++) {
                    Z = children[i][setting.treeId];
                    if (Z && Z.value !== 1) {
                        allChecked = false;
                        if (!allUnchecked) break;
                    }
                    if (Z && (Z.value || 0) !== 0) {
                        allUnchecked = false;
                        if (!allChecked) break;
                    }
                }
            }
            Z = parent[setting.treeId];
            if (!Z) return;
            var chg = false;
            if (allChecked) {
                chg = Z.value !== 1;
                Z.value = 1;
                if (chg && chgs && (!setting.check.hasOwnField || parent.hasOwnProperty(setting.check.hasOwnField))) chgs.push(parent);
            } else if (allUnchecked) {
                chg = (Z.value || 0) !== 0;
                Z.value = 0;
                if (chg && chgs && (!setting.check.hasOwnField || parent.hasOwnProperty(setting.check.hasOwnField))) chgs.push(parent);
            } else if (Z.value !== 2) {
                if (Z.value === 1 && chgs && (!setting.check.hasOwnField || parent.hasOwnProperty(setting.check.hasOwnField))) chgs.push(parent);
                chg = true;
                Z.value = 2;
            }
            if (chg) {
                view.setChkClass(setting, parent);
                view.setParentNodeCheckBox(setting, parent, Z.value, chgs);
            }
        },
        setParentNodeCheckBox2: function(setting, node, value) {
            var parent = node[setting.data.key.parent];
            if (!parent) return;
            var Z = node[setting.treeId], allChecked = value === 1,  allUnchecked = value === 0;
            if (value !== 2) {
                var children = parent[setting.data.key.children];
                for (var i = 0, l = children.length; i < l; i++) {
                    Z = children[i][setting.treeId];
                    if (Z.value !== 1) {
                        allChecked = false;
                        if (!allUnchecked) break;
                    }
                    if ((Z.value || 0) !== 0) {
                        allUnchecked = false;
                        if (!allChecked) break;
                    }
                }
            }
            Z = parent[setting.treeId];
            if (!Z) return;
            var chg = true;
            if (allUnchecked) {
                chg = (Z.value || 0) !== 0;
                Z.value = 0;
            }else if (Z.value !== 2) {
                chg = true;
                Z.value = 2;
            }
            if (chg) {
                view.setChkClass(setting, parent);
                view.setParentNodeCheckBox2(setting, parent, Z.value);
            }
        },
        setSonNodeCheckBox: function(setting, parent, children, value, chgs) {
            var hasOwnField = setting.check.hasOwnField, p;
            for (var i = 0, l = children.length, node, Z; i < l; i++) {
                node = children[i];
                Z = node[setting.treeId];
                if (setting.view.hideFunction && value == 1) {// value == 1, 是解决结点未隐藏时被勾上了，然后被隐藏了，上级去勾时要带上这个结点。
                    if (Z.hide === true || (Z.hide == undefined && setting.view.hideFunction(node) === true)) {
                        continue;
                    }
                }
                if ((Z.value || 0) !== value) {
                    if (chgs && (!hasOwnField || node.hasOwnProperty(hasOwnField))) {
                        chgs.push(node);
                    }
                    Z.value = value;
                    view.setChkClass(setting, node);
                    node[setting.data.key.children] && view.setSonNodeCheckBox(setting, node, node[setting.data.key.children], value, chgs);
                }
                p = node[setting.data.key.parent];
                if (p && p != parent) view.setParentNodeCheckBox(setting, node, value, chgs);
            }
        },
        repairAllChk: function(setting, value) {
            if (setting.check.enable) {
                var root = data.getRoot(setting), children = root[setting.data.key.children], node;
                for (var i = 0, l = children.length; i < l; i++) {
                    node = children[i];
                    node[setting.treeId].value = value;
                    view.setChkClass(setting, node);
                    node[setting.data.key.children] && view.setSonNodeCheckBox(setting, node, node[setting.data.key.children], value);
                }
            }
        },
        setChkClass: function(setting, node) {
            var obj = $$(node, consts.id.CHECK, setting);
            obj && obj.attr('class', view.makeChkClass(setting, node));
        },
        makeChkClass: function(setting, node) {
            return consts.className.BUTTON + " " + consts.checkbox.DEFAULT + " checkbox_" + (node[setting.treeId].value || 0);
        }
    },
    _z = {
        tools: _tools,
        view: _view,
        event: _event,
        data: _data
    };

    $.extend(true, $.fn.zTree.consts, _consts);
    $.extend(true, $.fn.zTree._z, _z);

    var zt = $.fn.zTree,
    tools = zt._z.tools,
    consts = zt.consts,
    view = zt._z.view,
    data = zt._z.data,
    event = zt._z.event,
    $$ = tools.$;

    data.exSetting(_setting);
    data.addInitBind(_bindEvent);
    data.addInitUnBind(_unbindEvent);
    data.addInitProxy(_eventProxy, true);
    data.addInnerAfterIcon(_beforeA);
    data.addZTreeTools(_zTreeTools);

})(jQuery);