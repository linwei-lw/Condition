
<template>
  <div
    :class="[$style.container, border && $style.border]" 
    :style="{height:`${height}px`, borderColor:borderColor, borderRadius:radius}" 
    tabindex="0"
    @mouseenter="showOrHideClearBtn(true)"
    @mouseleave="showOrHideClearBtn(false)">
    
    <!--搜索图标显示-->
    <i :class="$style.search_icon" class="el-icon-search" v-if="showSearchIcon"></i>

    <slot></slot>

    <!--clear按钮显示-->
    <div :class="$style.clear" style="display:none;" ref="clearBtn">
      <i></i> <i @click="clear" class="el-icon-close"></i>
    </div>

    <!--input显示-->
    <div style="overflow:hidden;">
      <input
        type="text"
        :class="$style.input"
        :placeholder="placeholder || $_L.get('输入进行查询')"
        :value="value"
        :title="mytitle"
        @focus="$el.style['border-color'] = theme.color;$el.style['z-index'] = theme.zindex()"
        @blur="$el.style['border-color'] = borderColor;$el.style['z-index'] = ''"
        @click="handleClick"
        @input="handleInput"
        @keypress="handleKeypress($event)">
    </div>

    <!--弹出搜索结果显示-->
    <ul ref="dropdown" v-show="showDropDown" :class="$style.dropdown" class="ztree" style="padding:0; min-width:0;" :style="[{borderColor:theme.border_color_dark}, theme.popup, {'overflowY':'auto'}]"></ul>

    <!--弹出提示-->
    <ul ref="tip" v-if="tip" :class="$style.dropdown" style="text-align:center; height:32px; line-height:31px;" :style="[{borderColor:theme.border_color_dark}, theme.popup]">
        {{tip}}
    </ul>

  </div>
</template>

<script>
  import { domLeftTop } from '@/components/util/Dom.js';
  import { treeSearch } from '@/common/util/Trees.js';
  
  export default {
    props: {
      placeholder: String,
      hasOwnField: String,                                    // 如果指定该属性，查询对象必须有该属性，否则不查询该对象
      searchFun: Function,                                    // 查询回调函数 参数(node, searchText) 返回true(符合条件)|false(不符合条件)
      onItemSelected: Function,                               // 选择某个查询的结果 参数(node)
      border: { type: Boolean, default: false },              // 是否显示边框
      borderColor: { type: String, default: $_theme.border_color_light},            // 边框颜色
      radius: { type: String,  default: $_theme.input_radius},// 边框圆角
      treeBorder: { type: Boolean, default: false },          // 树是否显示边框
      showSearchIcon: { type: Boolean, default: true },       // 是否显示搜索图标
      height: { type: Number,  default: $_theme.inputHeight },// 高度数值，单位是px
      searchMax:{ type: Number, default: 200  },              // 搜索栏显示的最多数量
    },

    _timeout: null,
    _tree: null,
    _options: null,
    _selectedInfo: null,// {dom:xxx, index:yyy}

    data() {
      return {
        value: null,
        showDropDown: false,
        tip: null,
        mytitle: null,
      };
    },

    watch: {
      showDropDown: function(v) {
        this.hideDropDown = this.hideDropDown || (e => this.showDropDown = false);
        v ? setTimeout(()=>document.addEventListener('click', this.hideDropDown), 10) : document.removeEventListener('click', this.hideDropDown);
      },
      tip: function(v) {
        this.hideTip = this.hideTip || (e => this.tip = null);
        v ? setTimeout(()=>document.addEventListener('click', this.hideTip), 10) : document.removeEventListener('click', this.hideTip);
      }
    },
    methods: {
      setTree(tree) {
        this._tree = tree;
        if(!tree) return;
        this._check = tree.setting.check && tree.setting.check.enable;
        if (this._check) this.mytitle = $_L.get('用空格、逗号或分号隔开可精确查询多个') +'\n' + $_L.get('按回车键勾选上所有查询结果');
      },
      showOrHideClearBtn(show) {
        this.$refs.clearBtn.style.display = (show && this.value) ? '' : 'none';
      },
      handleClick() {
        if (!this.value) {
          return this.$emit('blankclick', this);
        }
        if (this._options && this._options.length > 0 && !this.showDropDown) {
          this.styleDropDown();
          this.showDropDown = true;
        }
      },
      handleInput(event) {
        this.value = event.target.value;
        this.$emit('input', event.target.value);
        if (!this.value) {
          this.clear();
          this.$emit('blankinput', this);
          return;
        }
        this.showOrHideClearBtn(true);
        this._timeout && clearTimeout(this._timeout);
        this._timeout = setTimeout(this.onSearch, 500);
      },
      openOptions(options) {
        this._options = options;
        this.openDropDown();
      },
      onSearch() {
        this._timeout = null;
        if (!this._tree) return;
        let [text, array] = this.getSearchText(this.value);
        this._options = treeSearch(this._tree, text, array, this.hasOwnField, this.searchFun, array ? array.length : this.searchMax);
        this._selectedInfo = null;
        if (this._options.length == 0) {
          return this.showTip($_L.get('无结果'), '#f00');
        }
        this.tip = null;
        this.openDropDown();
      },
      getSearchText(text) {
        text = (text||'').trim();
        if (!text) return [null, null];
        if (!this._check) return [text, null];
        let array = text.split(/[ |,|;|；|，|　]/);
        if (array.length == 1) return [text.toLowerCase(), null];
        return [null, new Set(array)];
      },
      showTip(tip, color) {
        this.showDropDown = false;
        this.tip = tip;
        this.$nextTick(() => {
          let treeDom = this._tree.setting.treeObj.get(0).parentNode;
          let treeHide = treeDom.offsetWidth == 0;
          let {left, top} = treeHide ? domLeftTop(this.$el.parentNode) : domLeftTop(treeDom);
          treeHide && (top = this.$el.offsetHeight + top);
          !treeHide && left--;
          let style = this.$refs.tip.style;
          style.color = color;
          style['z-index'] = $_theme.zindex();
          style.top = top + 'px';
          style.left = left + 'px';
          style.width = (treeHide ? this.$el.parentNode.offsetWidth : treeDom.offsetWidth + 2) + 'px';
        });
      },
      handleKeypress(event) {
        if ((event.keyCode || event.which) == 13) {
          let setting = this._tree.setting;
          if (setting.check && setting.check.enable && setting.check.hasChecked && this._options && this._options.length) {//hasChecked:是否需要勾选上
            setting = setting.treeId;
            let n;
            this._options.forEach(node=>(!node[setting] || node[setting].value!=1) && this._tree.checkNode(n=node, true, true, true));
            n && this._tree.selectNode(n, false);
            this.showDropDown = false;
          }
        }
      },
      openDropDown() {// 显示或隐藏选项列表
        this.showDropDown = true;
        this.styleDropDown();
        let dom = this.$refs.dropdown;
        dom.innerHTML = '';
        let span = [];
        for (let i=0, len=this._options.length, node, icon_url, icon_css, li, name; i<len; i++) {
          node = this._options[i];
          
          span.push("<span style='width:30px;height:30px;background-position:center;");
          icon_url = this.iconUrl(node);
          icon_url && span.push(icon_url);
          span.push("' class='button");
          icon_css = this.iconCss(node);
          icon_css && span.push(" ", icon_css);
          span.push("'></span>");
          span.push(name = this.nameFunction(node) || '');

          li = document.createElement("li");
          li.className = this.$style.option_item;
          li.style['background-color'] = this.theme.alternate_colors[i%2];
          li.innerHTML = span.join('');
          li.onclick = event => this.onItemClick(event, i, name);
          span.length = 0;

          dom.appendChild(li);
        }
      },
      styleDropDown() {
        let treeDom = this._tree.setting.treeObj.get(0).parentNode;
        let treeHide = treeDom.offsetWidth == 0;
        let {left, top} = treeHide ? domLeftTop(this.$el.parentNode) : domLeftTop(treeDom);
        treeHide && (top = this.$el.offsetHeight + top);
        !treeHide && left--;
        let style = this.$refs.dropdown.style;
        style.color = '';
        style['z-index'] = $_theme.zindex();
        style.top = top + 'px';
        style.left = left + 'px';
        style.height = Math.min(treeHide ? (document.documentElement.clientHeight - top - 21) : (treeDom.offsetHeight-1), this._options.length * 30) + 'px';
        style.width = (treeHide ? this.$el.parentNode.offsetWidth-2 : treeDom.offsetWidth) + 'px';
      },
      iconUrl(node) {
        if (!this._tree.setting.view.iconUrlFunction) return null;
        let iconUrl = this._tree.setting.view.iconUrlFunction(node);
        return iconUrl ? ("background-size:16px 16px;background-image:url(" + iconUrl + ");") : null;
      },
      iconCss(node) {
        if (this._tree.setting.view.iconCssFunction) {
          return this._tree.setting.view.iconCssFunction(node) || null;
        }
        return node[this._tree.setting.treeId].isParent ? 'ico_close' : 'ico_docu';
      },
      nameFunction(node) {
        return this._tree.setting.view.nameFunction ? this._tree.setting.view.nameFunction(node) : node[this._tree.setting.data.key.name];
      },
      onItemClick(event, index, name) {
        this.value = name.split(' ')[0];
        if (this._selectedInfo) {
          this._selectedInfo.dom.style.cssText = 'background-color:' + this.theme.alternate_colors[this._selectedInfo.index%2];
        }
        this._selectedInfo = {dom: event.target, index: index};
        this._selectedInfo.dom.style.cssText = 'background-color:' + this.theme.selected_color + '!important';
        let node = this._options[index];
        this._tree.selectNode(node, false);
        let setting = this._tree.setting, tools = setting.treeObj.zTree._z.tools;
        if (!setting.callback.beforeClick || tools.apply(setting.callback.beforeClick, [node], true) !== false) {
          setting.treeObj.trigger(setting.treeObj.zTree.consts.event.CLICK, [null, node]);
        }
        if (setting.check && setting.check.enable && setting.check.hasChecked) {//hasChecked:是否需要勾选上
          this._tree.checkNode(node, true, true, true);
        }
        this.onItemSelected && this.onItemSelected(node);
      },
      clear() {
        this._timeout && clearTimeout(this._timeout);
        this._timeout = null;
        this.showDropDown = false;
        this.$refs.dropdown.innerHTML = '';
        this.value = this.tip = null;
        this._options = null;
        this._selectedInfo = null;
        this.showOrHideClearBtn(false);
      }
    }
  };
</script>

<style module>
  .container {
    overflow: hidden;
    outline: none;
    display: inline-block;
    white-space: nowrap;
    position: relative;
    background-color: #fff;
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
  
  /* 搜索图标 */
  .search_icon {
    float: left;
    font-size: 16px;
    padding-left: 6px;
  }
  /* 输入框 */
  .input {
    height: 100%;
    width: 100%;
    display: inline-block;
    border: 0;
    outline: 0;
    padding: 0 8px;
  }
  .input::placeholder {
    color: #B0B0B0;
  }
  .input::-webkit-input-placeholder {
    color: #B0B0B0;
  }
  .input:-ms-input-placeholder {
    color: #B0B0B0;
  }
  .input::-ms-input-placeholder {
    color: #B0B0B0;
  }
  /* 清空按钮 */
  .clear {
    float: right;
    position: relative;
    width: 0px;
  }
  .clear > i {
    position: absolute;
    cursor: pointer;
    left: -20px;
    width: 20px;
    font-size: 16px;
    line-height: 0;
  }
  .clear > i:first-child {
    top: 0;
    background-color: #fff;
    height: calc(100% - 2px);
  }
  /* 下拉容器 */
  .dropdown {
    position: fixed;
    padding: 0;
    margin: 0;
    background-color: #fff;
    margin-block-start: 0;
    border-width: 1px;
    border-style: solid;
    border-top-width: 0;
    box-shadow: 0px 0px 5px 0px RGBA(0, 0, 0, 0.2);
  }
  .option_item {
    height: 30px;
    cursor: default;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .option_item:hover {
    background-color: #FCF0C1 !important;
  }
</style>
