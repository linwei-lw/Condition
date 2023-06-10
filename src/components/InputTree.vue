
<template>
  <div :class="[$style.container, border && $style.border]" :style="{height:`${height}px`, borderColor:focused?theme.color:borderColor, zIndex:focused?theme.zindex():''}" tabindex="0" @focus="focused=true" @mouseenter="hover=true" @mouseleave="hover=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle"  v-if="label" is-label>{{label}}</span>

    <!--必填显示-->
    <span :class="[$style.required,'el-icon-star-on']" :style="{backgroundColor:theme.bg_color}" v-if="required"></span>

    <!--下拉图标和清除图标显示-->
    <i :class="[$style.icon,open?'el-icon-arrow-up':'el-icon-arrow-down']" :style="{lineHeight:lineHeight+'px'}" v-show="!showClear" @click="toggleShowTree"></i>
    <i :class="$style.icon" :style="{lineHeight:lineHeight+'px'}" v-show="showClear"  class="el-icon-close" @click.stop="clear"></i>

    <!--selector显示-->
    <div ref="selector" :title="txt" :class="$style.selector" @click="toggleShowTree" :style="[{lineHeight:lineHeight+'px'},inputStyle]">
        <span :class="$style.placeholder" v-if="!txt && placeholder">{{placeholder}}</span>
        <span>{{txt}}</span>
    </div>

    <!--不可操作层-->
    <div v-if="disabled" :class="$style.disabled"/>

  </div>
</template>

<script>
  /*
  * 单选树使用例子
  * <InputTree label="选择地区" valueField="id" :setting="setting" v-model="value" :text="text" :getTreeRoots="getTreeRoots" @change="onSelectChg"/>
  *
  *  data: {value: 0, text: '中国', setting: {参考zTree的setting}},
  *  methods: {
  *    getTreeRoots(callback) {
  *      // 异步或同步取到树根结点roots
  *      callback(roots); //记得调用回调函数，把数据传回去
  *    },
  *    onSelectChg(value, node) {// value是node的valueField值, node是树结点对象
  *    }
  *  }
  * ========================================================================================================
  *  多选树使用例子：车辆树选多部车辆
  *  <InputTree label="选择一部车" :tree="carTree" v-model="carIds" hasOwnField="plate" @change="onCheckChg"/>
  *
  *  import CarTree from '@/common/tree/CarTree.vue';
  *  data: {carIds:[]}, // carIds因为是多选，所以是数组
  *  computed: {
  *    carTree: function() { return CarTree }
  *  },
  *  methods: {
  *    onCheckChg(cars, checked) {// cars是当次勾选发生变化的车辆列表；checked:true勾上,false:去勾
  *    }
  *  }
  *  hasOwnField="plate" 车辆树即有车辆也有车队，plate字段是车辆才有的，表示只允许选上车辆
  */

  import Vue from 'vue';

  import { domLeftTop } from '@/components/util/Dom.js';
  import { arrayGetValue } from '@/common/util/Arrays.js';
  import { arrayRemoveItem } from '@/common/util/Arrays.js';
  import { getNodeByValue } from '@/common/util/Trees.js';
  import { getNodesByValues } from '@/common/util/Trees.js';

  import Tree from '@/components/Tree';

  export default {
    name: "InputTree",
    props: {
      label: String,                                               // 标题文本
      tree:        { default: ()=>{return Tree} },                 // 树组件
      setting:     { default: ()=>{return {}} },                   // 参考ztree的setting配置
      getTreeRoots: Function,                                      // 调用该方法获取树结点
      expandRoot: { type: Boolean,  default: true },               // 显示树时默认展开根结点
      hasOwnField: { type: String,  default: null },               // 只对树有该属性的结点处理
      value: null,                                                 // 当前值(v-model)
      text:  null,                                                 // 初始显示文本
      labelField: { type: String,  default: null },                // 显示字段，如果不指定，将使用tree的显示字段或nameFunction
      valueField: { type: String,  default: 'id' },                // 值字段
      treeWidth:  { type: Number,  default: 0 },                   // 弹出树的宽度px，0则默认InputTree的总宽度
      treeHeight: { type: Number,  default: 350 },                 // 弹出树的高度px
      placeholder: String,
      searchable: { type: Boolean, default: true },                // 是否显示搜索栏
      required:   Boolean,                                         // 是否显示必填
      disabled:   Boolean,                                         // 是否可操作
      clearable:  Boolean,                                         // 是否显示可清除图标
      border:     { type: Boolean, default: true },                // 是否显示边框
      borderColor:{ default: $_theme.border_color_light },
      height:     { type: Number,  default: $_theme.inputHeight }, // 高度数值，单位是px
      inputStyle: { default: null },                                // 输入框的style
      labelMinWidth:{ type: Number,  default: 10 },  		  	   // lable宽度最小数值，单位是px
      labelMaxWidth:{ type: Number},  		  	   // lable宽度最小数值，单位是px
      custom: { type: Boolean, default: false }   // 自定义
    },
    _tree:  null,
    _roots: null,
    _value: null,
    _item:  null,
    _setting: null,

    data() {
      return {
        txt: this.text,
        focused: false,
        hover: false,
        open:  false,
      };
    },
    watch: {
      value: function(v) {
        this._myself ? (this._myself = false) : (this._value = v, this.refresh());
      },
      text: function(v) {
        this.txt = v;
      },
      focused: function(v) {
        document[v?'addEventListener':'removeEventListener']('click', this.checkBlur);
      }
    },
    mounted() {
      this._setting = Object.assign({callback: {}}, this.setting);
      this._setting.check = Object.assign({enable: false, hasOwnField: this.hasOwnField}, this.setting.check||{});
      this._value = this.value;
      if (this.value === null) return;

      if (Array.isArray(this.value)) {//多选
        this._setting.check.enable = true
        if (this.value.length == 0) return;
      }
      // 获取文字出来显示
      !this.text && this.refresh();
      this.txt = this.txt || this.text;
    },
    methods: {
      refresh() {
        this.txt = null;
        this._item = null;
        this._getRoots(this._setItemAndText.bind(this));
      },
      _setItemAndText(roots) {
        if (!roots) return;
        if (this._setting.check.enable === true) {
          this._item = this.valueField ? getNodesByValues(roots, this.value, this.valueField, this.hasOwnField) : [...this.value];
          this._item && this.setTxt(this._item, true);
        } else {
          this._item = this.valueField ? getNodeByValue(roots, this.value, this.valueField, this.hasOwnField) : this.value;
          this._item && this.setTxt(this._item, false);
        }
      },
      setTxt(item, isarray) {
        if (this.labelField) {//如果设置labelField，根据labelField值显示值
          this.txt = isarray ? arrayGetValue(item,this.labelField).join(',') : item[this.labelField];
        } else if (this.tree.getNodeText || (this._setting.view && this._setting.view.nameFunction)) {
          let fun = this.tree.getNodeText || (this._setting.view && this._setting.view.nameFunction);
          if (isarray) {
            let array = [];
            for (let i=0, len=item.length; i<len; i++) {
              array.push(fun(item[i]));
            }
            this.txt = array.join(',');
          } else {
            this.txt = fun(item);
          }
        } else {
          let feild = this._setting.data && this._setting.data.key && this._setting.data.key.name;
          feild = feild || 'name';
          this.txt = isarray ? arrayGetValue(item,feild).join(',') : item[feild];
        }
      },
      _getRoots(callback) {
        if (this._roots) return callback(this._roots);
        this.getTreeRoots ? this.getTreeRoots(roots => {
          this._roots = Array.isArray(roots) ? roots : [roots];
          callback(this._roots);
        }) : (
          this.tree.getTreeRoots ? this.tree.getTreeRoots(callback) : callback(null)
        );
      },
      toggleShowTree() {// 显示或隐藏选项列表
        this.$el.focus();
        this.$emit('click');
        if(this.custom){
          return;
        }
        this.open ? this.hideTree() : this.showTree();
      },
      showTree() {
        if (!this._tree) {
          let onTreeInited = () => {
            if (!this._item && this.value) {
              let roots = this._tree.getTree().getNodes();
              this._setItemAndText(roots);
            }
            if (this._item) {
              if (this._setting.check.enable === true) {//多选
                this._tree.checkNodes(this._item, true, true);
                this._tree.selectNode(this._item[0]);
              } else {
                this._tree.selectNode(this._item);
              }
            }
          };
          this.createTree(onTreeInited);
          this._tree.init && this._getRoots(roots => this._tree.init(roots, this.expandRoot));
        } else {
          this.styleTree();
        }
        this.open = true;
        document.addEventListener('click', this.onMouseClick);
      },
      hideTree() {// 隐藏弹出的选项列表
        this._tree.$el.style.display = 'none';
        this.open = false;
        document.removeEventListener('click', this.onMouseClick);
      },
      onMouseClick(event) {
        if (!this._tree.$el.contains(event.target) && !this.$el.contains(event.target)) {
          this.hideTree();
        }
      },
      checkBlur(event) {
        this.focused = this.$el.contains(event.target);
      },
      createTree(onTreeInited) {
        if (this._setting.check.enable === true) {//多选
          this._setting.callback.onCheck && (this._setting.callback._onCheck = this._setting.callback.onCheck);
          this._setting.callback.onCheck = this.onItemCheck;
        } else {
          this._setting.callback.onClick && (this._setting.callback._onClick = this._setting.callback.onClick);
          this._setting.callback.onClick = this.onItemClick;
        }
        let constructor = Vue.extend(this.tree);
        this._tree = new constructor({propsData: {setting:this._setting, miniBar:true, borderColor:this.borderColor, searchable:this.searchable, onTreeInited:onTreeInited}});
        this._tree.$mount();
        this.styleTree();
        this.$el.appendChild(this._tree.$el);
      },
      styleTree() {
        // 自动判断是显示在下面还是上面
        let {left, top} = domLeftTop(this.$el), isbottom = true, _treeHeight = this.treeHeight;
        let this_height = this.$el.clientHeight + (this.border ? 2 : 0);
        let down = document.documentElement.clientHeight - top - this_height;
        if (down > _treeHeight) {// 下面空间充足，显示在下面
          top += this_height;
        } else if (top > _treeHeight) {// 上面空间足够，显示在上面
          top -= _treeHeight - 0;
          isbottom = false;
        } else {// 上面和下面的空间都不够
          if (down > top) {// 下面的空间大，显示在下面
            _treeHeight = down - 20;
            top += this_height;
          } else {// 上面的空间大，显示在上面
            _treeHeight = top - 5;
            top -= _treeHeight - 0;
            isbottom = false;
          }
        }
        let style = this._tree.$el.style;
        style.position = "fixed";
        style['box-shadow'] = '0px 0px 5px 0px RGBA(0, 0, 0, 0.1)';
        style[isbottom?'border-top-width':'border-bottom-width'] = 0;
        style['z-index'] = $_theme.zindex();
        style.top = top + 'px';
        style.left = left + 'px';
        style.height = _treeHeight + 'px',
        style.width = (this.treeWidth || this.$el.offsetWidth) + 'px';
        style.display = 'block';
      },
      onItemClick(node, event) {
        if (this.hasOwnField && !node.hasOwnProperty(this.hasOwnField)) return;
        this._setting.callback._onClick && this._setting.callback._onClick(node, event);
        if (this._item == node) return this.hideTree();
        this._item = node;
        let value = this.valueField ? node[this.valueField] : node;
        if (this._value === value) return this.hideTree();
        this._value = value;
        this.setTxt(node, false);
        this._myself = true;
        this.$emit('input',  value);
        this.$emit('change', value, node, this.txt);
        this.hideTree();
      },
      onItemCheck(node, chgs, value, event) {
        this._item = this._item || [];
        this._value = this._value || [];
        this._setting.callback._onCheck && this._setting.callback._onCheck(node, chgs, value, event);

        let items = [], roots = value == 0 ? this._tree.getTree().getNodes() : null;
        if (roots && roots.length == 1 && roots[0] == node) {//根结点全不选
          this.txt = '';
          this._item = [];
          this._value = [];
        } else {
          for (let i=0,len=chgs.length; i<len; i++) {
            node = chgs[i];
            items.push(node);
            if (value == 1) {
              this._item.push(node);
              this._value.push(this.valueField ? node[this.valueField] : node);
            } else {
              items.push(node);
              arrayRemoveItem(this._item, node);
              arrayRemoveItem(this._value, this.valueField ? node[this.valueField] : node);
            }
          }
          this.setTxt(this._item, true);
        }
        this._myself = true;
        this.$emit('input',  this._value);
        this.$emit('change', items, value == 1, this.txt);
      },
      getSelectedItem() {
        return this._item;
      },
      clear() {
        this.open && this.hideTree();
        this.txt = null;
        if (this._setting.check.enable && this._tree) {
          if (this._item && this._item.length > 0) {
            this._tree.getTree().checkAllNodes(false);
          }
        }
        this._value = null;
        this._item = null;
        this._myself = true;
        this.$emit('input', null);
        this.$emit('change', null, null, null);
      }
    },
    computed: {
      showClear() {// 判断是否要显示清除按钮
        return this.clearable && this.hover && this.txt;
      },
      lineHeight() {// 获取除边框外的高度
        return this.height - (this.border ? 2 : 0);
      },
      labelStyle() {
        return {
          minWidth:this.labelMinWidth + 'px',
          maxWidth:this.labelMaxWidth + 'px',
          borderRightColor: this.theme.border_color_light,
          backgroundColor: this.theme.bg_color
        };
      },
    },
    beforeDestroy() {
      this.focused = false;
      this.open && this.hideTree();
      this._tree && this._tree.destroy();
      this._tree = null;
      this._roots = null;
      this._item = null;
      this._value = null;
      this._setting = null;
    }
  };
</script>

<style module>
  .container {
    outline: none;
    display: inline-block;
    white-space: nowrap;
    background-color: #fff;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }
  .container > *:not(ul) {
    height: 100%;
    display: flex;
    align-items: center;
  }
  .border {
    border-style: solid;
    border-width: 1px;
  }
  /* 标题文本 */
  .label {
    float: left;
    padding: 0 6px;
    border-right-style: solid;
    border-right-width: 0px;
    white-space: nowrap;
  }

  /* select容器 */
  .selector {
    padding-left: 8px;
    margin-right: 24px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .placeholder {
    color: #B0B0B0;
  }
  .icon {
    float: right;
    width: 20px;
    line-height: 0;
    font-size: 16px;
    cursor: pointer;
  }
  /* 下拉容器 */
  .dropdown {
    position: fixed;
    padding: 0;
    margin: 0;
    list-style: none;
    background-color: #fff;
    margin-block-start: 0;
    border-width: 1px;
    border-style: solid;
    overflow-y: auto;
  }
  .option_item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    cursor: pointer;
  }

  /* 必填 */
  .required {
    float: right;
    padding: 0 2px;
    color: #f00;
  }
  /* 禁止操作 */
  .disabled {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.6);
    opacity: 0.6;
    filter: alpha(opacity=60);
    cursor: not-allowed;
  }
</style>
