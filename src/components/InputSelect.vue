
<template>
  <div :class="[$style.container, border && $style.border]" :style="containerStyle" tabindex="0" @focus="focused=true" @blur="focused=false" @mouseenter="selectorHover=true" @mouseleave="selectorHover=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle" v-if="label" is-label>{{label}}</span>

    <!--必填显示-->
    <span :class="[$style.required,'el-icon-star-on']" :style="{backgroundColor:theme.bg_color}" v-if="required"></span>

    <!--单位显示-->
    <span :class="$style.unit" v-if="unit">{{unit}}</span>

    <!--下拉图标和清除图标显示-->
    <i :class="[$style.icon,showDropDown?'el-icon-arrow-up':'el-icon-arrow-down']" :style="{lineHeight:lineHeight+'px'}" v-show="!showClear" v-if="showArrow" @click.stop="toggleDropDown($event)"></i>
    <i :class="$style.icon" :style="{lineHeight:lineHeight+'px'}" v-show="showClear"  v-if="clearable" class="el-icon-close" @click.stop="clear"></i>
    
    <!--selector显示-->
    <div ref="selector" :class="$style.selector" :title="text" @click="toggleDropDown($event)" :style="[inputWidth && {width:inputWidth},{lineHeight:lineHeight+'px',paddingRight:'5px'},contentStyle]"><!--marginRight:showArrow||showClear?'24px':'8px'-->
        <span :class="$style.placeholder" v-if="!text && placeholder">{{placeholder}}</span>
        <span v-if="text" :style="[selectorHover && !label && {color:theme.color}]">{{text}}</span>
    </div>

    <!--弹出selector显示-->
    <ul ref="dropdown" :class="$style.dropdown" :style="dropdownStyle" v-show="showDropDown" v-if="createDropDown">
        <li :class="$style.option_item" :style="optionItemStyle(item, index)"
        v-for="(item,index) in options" :key="index+'_'+item[valueField]" 
        @mouseenter="hoverItem=item" @mouseleave="hoverItem=null"
        @click.stop="onSelectItem(item,$event)" :title="item[labelField]">
          <Checkbox v-if="checkbox" :label="item[labelField]" :value="!!checkMap[item[valueField]]" @input="v=>onCheck(item,v)" style="width:100%"/>
          <span v-if="!checkbox">{{item[labelField]}}</span>
        </li>
    </ul>
    <div v-show="showDropDown" v-if="checkbox && showCheckAll && createDropDown" :style="[checkAllStyle,{backgroundColor:theme.bg_color}]" style="border:1px solid;position:fixed;height:30px;line-height:30px;padding-left:8px;">
      <Checkbox label="全选" v-model="checkAll" @change="onCheckAll"/>
    </div>

    <div v-if="disabled" :class="$style.disabled"/>
  </div>
</template>

<script>
  /*
  * 使用例子
  * <InputSelect label="你要选择哪一个" :options="[{label:'吃饭',value:1},{label:'睡觉',value:2}]" v-model="like" @change="onSelectChg"/>
  * 
  *  data: {like: 1},
  *  methods: {
  *    onSelectChg(value, item) {// value值是1或2, item是{label:'吃饭',value:1}
  *    }
  *  }
  */
  
  import { domLeftTop } from '@/components/util/Dom.js';
  import { arrayFindItem } from '@/common/util/Arrays.js';
  import { arrayRemoveValue } from '@/common/util/Arrays.js';
  import { arrayGetValue } from '@/common/util/Arrays.js';

  export default {
    name: "InputSelect",
    props: {
      label: String,                                                      // 标题文本
      value: { default: null},                                            // 当前值(v-model)
      options: Array,                                                     // 多个选项 [{lable:xxx,value:xxx}...]
      labelField: { type: String,  default: 'label' },                    // 显示字段
      valueField: { type: String,  default: 'value' },                    // 值字段
      checkbox:   { type: Boolean, default: false   },                    // 是否多选
      showCheckAll: { type: Boolean, default: true  },                    // 是否显示全选
      splitter:   { type: String,  default: null    },                    // 如果是多选，而value是字符串"1,2,3,4" 则需要定义拆分符为逗号
      placeholder: String,
      unit: String,                                                       // 单位
      required:  Boolean,                                                 // 是否显示必填
      disabled:  Boolean,                                                 // 是否可操作
      clearable: Boolean,                                                 // 是否显示可清除图标
      showArrow:  { type: Boolean, default: true },                       // 是否显示箭头图标
      border:     { type: Boolean, default: true },                       // 是否显示边框
      borderColor:{ type: String,  default: $_theme.border_color_light },
      focusColor: { type: String,  default: $_theme.color },
      height:     { type: Number,  default: $_theme.inputHeight },        // 高度数值，单位是px
      maxListNum: { type: Number,  default: 10 },                         // 下拉框最多显示10个选项，多出10个选项会出现滚动条
      afterOpen: Function,
      beforeClose: Function,
	    labelMinWidth:{ type: Number,  default: 10 },  		  	              // lable宽度最小数值，单位是px
      inputWidth:   { type: String,  default: null },                     // 输入框的宽度
      contentStyle: { default: null},
    },
    data() {
      return {
        selectedItem: null,
        hoverItem: null,
        focused: false,
        selectorHover: false,
        createDropDown: false,
        showDropDown: false,
        dropdownStyle: null,
        checkAllStyle: null,
        checkedItems: null,
        checkMap: {},
        checkAll: false,
      };
    },
    watch: {
      value: function(v) {
        if (this._myself) return this._myself=false;
        this.checkbox ? this.setCheckedItems(v) : this.setSelectedItem(v);
      },
      focused: function(v) {
        this.$emit('focused', v);
      }
    },
    mounted() {
      if (this.value === null || this.value == undefined) return;
      this.checkbox ? this.setCheckedItems(this.value) : this.setSelectedItem(this.value);
    },
    methods: {
      setSelectedItem(v) {
        if (v === null || v == undefined) return this.selectedItem = null;
        if (!this.selectedItem || this.selectedItem[this.valueField] != v) {
          this.selectedItem = arrayFindItem(this.options, this.valueField, v);
        }
      },
      toggleDropDown(event) {// 显示或隐藏选项列表
        if (!this.options || this.options.length == 0) return;
        this.focused = true;
        if (this.showDropDown) return this.hideDropDown(event);
        this.showDropDown = this.createDropDown = true;
        
        // 自动判断是显示在下面还是上面
        let {left, top} = domLeftTop(this.$refs.selector), listHeight = 30 * Math.min(this.maxListNum, this.options.length) + 1 + (this.border ? 0 : 1);
        let this_height = this.$el.offsetHeight, isbottom = true;
        let down = document.documentElement.clientHeight - top - this_height;
        if (down > listHeight) {// 下面空间充足，显示在下面
          top += this_height - (this.border ? 1 : 0);
        } else if (top > listHeight) {// 上面空间足够，显示在上面
          top -= listHeight + (this.border ? 1 : 0);
          isbottom = false;
        } else {// 上面和下面的空间都不够
          if (down > top) {// 下面的空间大，显示在下面
            listHeight = down - 5;
            top += this_height - (this.border ? 1 : 0);
          } else {// 上面的空间大，显示在上面
            listHeight = top - 5;
            top -= listHeight + (this.border ? 1 : 0);
            isbottom = false;
          }
        }
        this.border && (left--);
        this.dropdownStyle = {
          borderColor: this.borderColor,
          zIndex: window.$_theme.zindex(),
          top: top + 'px',
          left: left + 'px',
          height: listHeight + 'px',
          width: (this.$el.offsetWidth - this.$refs.selector.offsetLeft) + 'px'
        };
        this.border && (this.dropdownStyle[isbottom?'border-top-width':'border-bottom-width'] = 0);
        if (this.checkbox && this.showCheckAll) {
          this.checkAllStyle = {
            borderColor: this.borderColor,
            zIndex: window.$_theme.zindex(),
            top: isbottom ? ((top+listHeight-1) + 'px') : ((top-30+1) + 'px'),
            left: left + 'px',
            width: this.dropdownStyle.width,
          };
        }
        this.afterOpen && this.$nextTick(this.afterOpen);
        document.addEventListener('click', this.onMouseClick);
      },
      onMouseClick(event) {
        !this.$el.contains(event.target) && this.hideDropDown(event);
      },
      hideDropDown(event) {// 隐藏弹出的选项列表
        if (this.beforeClose && this.beforeClose(event) === false) return;
        this.showDropDown = false;
        document.removeEventListener('click', this.onMouseClick);
      },
      onSelectItem(item,event) {
        if (this.checkbox) return;
        this.selectorHover = false;
        if (!this.selectedItem || this.selectedItem[this.valueField] !== item[this.valueField]) {
          let old = this.value, value = item[this.valueField];
          this.selectedItem = item;
          this._myself = true;
          this.$emit('input',  value);
          this.$emit('change', value, item, old);
        }
        this.hideDropDown(event);
      },
      onCheck(item, checked) {
        this.checkMap[item[this.valueField]] = checked;
        this.checkedItems = this.checkedItems || [];
        checked ? this.checkedItems.push(item) : arrayRemoveValue(this.checkedItems, this.valueField, item[this.valueField]);
        let values = arrayGetValue(this.checkedItems, this.valueField);
        if (this.splitter) values = values.join(this.splitter);
        this._myself = true;
        let oldValue = this.value;
        this.$emit('input',  values);
        this.$emit('change', {value:values,text:this.text,item:item,checked:checked,oldValue:oldValue});
      },
      onCheckAll(checked) {
        if (!checked) {
          this.checkMap = {};
          this.checkedItems = null;
          let old = this.value;
          this._myself = true;
          this.$emit('input', null);
          this.$emit('change', {value:null,text:null,oldValue:old});
        } else {
          this.checkedItems = [...this.options];
          let values = arrayGetValue(this.checkedItems, this.valueField);
          let map = {};
          values.forEach(v => map[v] = true);
          this.checkMap = map;
          if (this.splitter) values = values.join(this.splitter);
          this._myself = true;
          let oldValue = this.value;
          this.$emit('input',  values);
          this.$emit('change', {value:values,text:this.text,checked:checked,oldValue:oldValue});
        }
      },
      setCheckedItems(v) {
        if (v === null || v == undefined) {
          this.checkMap = {};
          this.checkedItems = null;
          return;
        }
        let values = Array.isArray(v) ? v : (this.splitter ? v.split(this.splitter) : []);
        let map = {}, list = [], item;
        values.forEach(value => {
          map[value] = true;
          item = arrayFindItem(this.options, this.valueField, value);
          item && list.push(item);
        });
        this.checkMap = map;
        this.checkedItems = list;
      },
      getSelectedItem() {
        return this.selectedItem;
      },
      getCheckedItems() {
        return this.checkedItems;
      },
      clear() {
        this.showDropDown && this.hideDropDown();
        if (this.checkbox) {
          this.checkedItems = null;
          this.checkMap = {};
        } else {
          this.selectedItem = null;
        }
        let old = this.value;
        this._myself = true;
        this.$emit('input', null);
        this.checkbox ? this.$emit('change', {value:null,text:null,checked:false,oldValue:old}) : this.$emit('change', null, old);
      },
      optionItemStyle(item, index) {
        if (!this.showDropDown) return null;
        if (item == this.hoverItem) {
          return { backgroundColor: this.theme.list_hover_color };
        } else if (this.selectedItem && this.selectedItem[this.valueField] === item[this.valueField]) {
          return { backgroundColor: this.theme.selected_color };
        } else {
          return { backgroundColor: this.theme.alternate_colors[index % 2] };
        }
      }
    },
    computed: {
      text: function() {
        if (!this.checkbox) return this.selectedItem ? this.selectedItem[this.labelField] : null;
        if (!this.checkedItems || this.checkedItems.length == 0) return null;
        return arrayGetValue(this.checkedItems, this.labelField).join(',');
      },
      showClear() {// 判断是否要显示清除按钮
        return this.clearable && this.selectorHover && this.text;
      },
      containerStyle() {
        return {
          height: this.height + 'px',
          borderColor: this.focused ? this.focusColor : this.borderColor,
          zIndex: this.focused ? this.theme.zindex() : ''
        }
      },
      lineHeight() {// 获取除边框外的高度
        return this.height - (this.border ? 2 : 0);
      },
      labelStyle() {
        return {
          minWidth: this.labelMinWidth + 'px',
          borderRightColor: this.theme.border_color_light, 
          backgroundColor: this.theme.bg_color
        };
      }
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
  .container:hover {
    background-color: #fff !important;
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
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .placeholder {
    color: #B0B0B0;
  }
  .icon {
    float: right;
    width: 22px;
    padding-left: 2px;
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
    box-shadow: 0px 0px 5px 0px RGBA(0, 0, 0, 0.1);
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

  /* 单位 */
  .unit {
    float: right;
    padding-right: 8px;
    white-space: nowrap;
  }
  /* 必填 */
  .required {
    float: right;
    padding: 0 2px;
    color: #f00;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
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
