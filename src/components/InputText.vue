<template>
  <div :class="[$style.container, border && $style.border, focused && focusClass]" :style="containerStyle" @mouseenter="hovering=true" @mouseleave="hovering=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle" v-if="label" :is-label="isLabel">{{label}}</span>

    <slot :hovering="hovering"></slot>

    <!--必填显示-->
    <span :class="['el-icon-star-on', $style.required]" :style="{backgroundColor:theme.input_label_bg_color}" v-if="required"></span>

    <slot name="required"></slot>

    <!--显示密码按钮显示-->
    <div :class="$style.togglePassword" v-if="password&&passwordButton">
      <i @click="togglePassword" class="el-icon-view" :style="{cursor: 'pointer', color:ishidePassword?'#d0d0d0':theme.color}"></i>
    </div>

    <!--单位显示-->
    <span :class="$style.unit" v-if="unit">{{unit}}</span>

    <!--clear按钮显示-->
    <div :class="$style.clear" v-if="showClear">
      <i></i>
      <i @click="clear" class="el-icon-close"></i>
    </div>

    <!--input显示-->
    <div style="overflow:hidden;">
      <input ref="input"
             :class="$style.input"
             :style="[{width:inputWidth},{paddingRight:password&&passwordButton&&'35px'}, inputStyle]"
             v-bind="$attrs"
             :value="value"
             :type="password && ishidePassword ? 'password' : 'text'"
             :maxlength="maxlength"
             :disabled="disabled"
             :readonly="readonly"
             :autocomplete="autocomplete"
             :placeholder="placeholder"
             @click="handleClick($event)"
             @compositionstart="handleCompositionStart"
             @compositionend="handleCompositionEnd"
             @input="handleInput"
             @focus="handleFocus"
             @blur="handleBlur"
             @change="handleChange"
             @keydown="keydown">
    </div >

    <div v-if="disabled" :class="$style.disabled" :style="{borderRadius: radius}"/>
  </div>
</template>

<script>
/*
* 使用例子
* <InputText label="你想输入啥" v-model="text" @change="onTextChg" unit="km" clearable required/>
*
*  data: {text: ''},
*  methods: {
*    onTextChg(text) {
*    }
*  }
*/
import storage from '@/common/cache/Storage.js';

export default {
  name: "InputText",
  props: {
    value: [String, Number, Array],                                   // 当前值(v-model)
    label: String,                                                    // 标题文本
    unit: String,                                                     // 单位
    required: Boolean,                                                // 是否必填
    disabled: Boolean,                                                // 是否可操作
    readonly: Boolean,                                                // 是否只读
    reg: RegExp,                                                      // 正则表达式
    maxlength: Number,                                                // 输入的最大长度
    password:       { type: Boolean, default: false },                // 是否是密码输入类型
    passwordButton: { type: Boolean, default: true },                 // 是否显示密码显示按钮
    trim:           { type: Boolean, default: false},                 // 是否不允许输入空格
    number:         { type: Boolean, default: false },                // 是否是数字输入类型
    point_num:      { type: Number,  default: null },                 // 如果是数字输入类型时，允许的小数点最多后几位
    integer:        { type: Boolean, default: false },                // 是否是整数输入类型
    range:          { type: Array,   default: null },                 // 如果是数字或整数，允许的最小和最大值，[最小值，最大值]
    clearable:      { type: Boolean, default: false },                // 是否显示可清除图标
    autocomplete:   { type: String,  default: 'off' },                // 自动补全
    border:         { type: Boolean, default: true },                 // 是否显示边框
    borderColor:    { type: String,  default: $_theme.border_color_light },
    radius:         { type: String,  default: $_theme.input_radius},  // 边框圆角
    focusClass:     { type: String,  default: null },
    placeholder:    { type: String,  default: null },
    height:         { type: Number,  default: $_theme.inputHeight },  // 高度数值，单位是px
    labelMinWidth:  { type: Number,  default: 10 },  		  		        // lable宽度最小数值，单位是px
    labelMaxWidth:  { type: Number},  		  		                      // lable宽度最大数值，单位是px
    inputWidth:     { type: String,  default: '100%' },               // 输入框的宽度
    inputStyle:     { default: null },                                // 输入框的style
    labelColor:     { type: String,  default: null },                 // lable颜色
    onInput: Function,
    searchKey:      { type: String,  default: null },
    isLabel:        { type: Boolean, default: true },
    inputLength:    { type: Boolean, default: false },               //输入数字时限制输入长度
  },
  data() {
    return {
      hovering: false,
      focused: false,
      isComposing: false,
      ishidePassword: true,
    };
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    },
    blur() {
      this.$refs.input.blur();
    },
    keydown(event){
      if(event.keyCode==13){
        this.$emit('keydown', event);
      }
    },
    handleFocus(event) {
      this.focused = true;
      this.$emit('focus', event);
    },
    handleBlur(event) {
      this.focused = false;
      this.$emit('blur', event);
    },
    handleCompositionStart() {
      this.isComposing = true;
    },
    handleCompositionEnd(event) {
      this.isComposing = false;
      this.handleInput(event);
    },
    handleInput(event) {
      if (this.isComposing) return;
      let value = event.target.value;
      window.$_XSS && (value = window.$_XSS(value));
      this.reg && (value = value.replace(this.reg,''));
      if (this.trim) value = value.replace(/\s+|　/g,'');
      if (this.integer) {
        value = value.replace(/[^0-9\-]/g,'');
        let _ = value.indexOf('-') == 0;
        value = value.replace(/\-/g, '');//移除所有-号
        while (value.length > 1 && value.indexOf('0') == 0) value = value.substr(1);//移除多余前缀0
        _ && (value = '-' + value);//加回-号
      } else if (this.number) {
        let reg=this.inputLength&&/[^0-9.]/g||/[^0-9|\-|\.]/g//inputLength为true时只能输入数字
        value = value.replace(reg,'');//移除[0123456789-.]以外的字符
        let _ = value.indexOf('-') == 0;
        value = value.replace(/\-/g, '');//移除所有-号
        value = value.replace(/^\./g, '').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');//移除多余的.号
        if (this.point_num !== null) {//移除多余小数位
          let i = value.indexOf('.'), n = this.point_num > 0 ? (this.point_num + 1) : 0;
          i != -1 && (value = value.substr(0, i + n));
        }
        while (value.length > 1 && value.indexOf('0') == 0 && value.indexOf('0.') != 0) value = value.substr(1);//移除多余前缀0
        _ && (value = '-' + value);//加回-号
      }
      //inputLength为true时限制输入的长度
      if (this.inputLength&&((this.integer || this.number) && this.range != null && value)) {
        this.range[0] !== null && ((value == '-' && this.range[0] >= 0) || (value != '-' && Number(value) < this.range[0])) && (value = this.value);
        this.range[1] !== null && (value != '-' && Number(value) > this.range[1]) && (value = this.value);
      }
      event.target.value = value;
      this.onInput && this.onInput(value);
      this.$emit('input', value);
      this.searchKey && storage.set(this.searchKey,value);
    },
    handleClick(event) {
      this.$el.focus();
      this.focus();
      this.$emit('click',event);
    },
    clear() {
      this.$emit('input', '');
      this.$emit('change', '');
      this.$emit('clear');
      this.searchKey && storage.remove(this.searchKey);
    },
    togglePassword(){
      this.ishidePassword = !this.ishidePassword;
    },
    handleChange(event) {
      let value = event.target.value;
      if ((this.integer || this.number) && this.range != null && value) {
        this.range[0] !== null && ((value == '-' && this.range[0] >= 0) || (value != '-' && Number(value) < this.range[0])) && (value = this.range[0]);
        this.range[1] !== null && (value != '-' && Number(value) > this.range[1]) && (value = this.range[1]);
        if (Number(event.target.value) !== value) {
          this.$emit('input', value);
        }
      }
      this.$emit('change', value);
    }
  },
  watch: {
    focused: function(v) {
      this.$emit('focused', v);
    }
  },
  computed: {
    showClear() {
      return this.clearable && !this.disabled && !this.readonly && this.value && (this.focused || this.hovering);
    },
    containerStyle() {
      return {
        borderRadius: this.radius,
        height: this.height + 'px',
        borderColor: this.focused ? this.theme.color : this.borderColor,
        zIndex: this.focused ? this.theme.zindex() : ''
      };
    },
    labelStyle() {
      return {
        minWidth: this.labelMinWidth + 'px',
        maxWidth: this.labelMaxWidth + 'px',
        borderRightColor: this.theme.border_color_light,
        backgroundColor: this.labelColor?this.labelColor:this.theme.input_label_bg_color
      };
    }
  }
};
</script>

<style module>
.container {
  overflow: hidden;
  vertical-align: top;
  outline: none;
  position: relative;
  display: inline-block;
  white-space: nowrap;
}
.container > * {
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
  user-select: none;
}
/* 输入框 */
.input {
  height: 100%;
  display: inline-block;
  border: 0;
  outline: 0;
  padding: 0 8px;
  background-color: #fff;
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
/* 显示密码按钮 */
.togglePassword{
  float: right;
  position: relative;
  width: 0px;
  text-align: center;
}
.togglePassword > i {
  position: absolute;
  left: -35px;
  width: 35px;
  font-size: 18px;
  line-height: 0;
}
/* 单位 */
.unit {
  float: right;
  padding-right: 8px;
  white-space: nowrap;
  background-color: #fff;
  user-select: none;
}
/* 必填 */
.required {
  display: flex!important;
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
