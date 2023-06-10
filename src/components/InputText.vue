<template>
  <div :class="[$style.container, border && $style.border, focused && focusClass]" :style="containerStyle" @mouseenter="hovering=true" @mouseleave="hovering=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle" v-if="label" is-label>{{label}}</span>

    <!--必填显示-->
    <span :class="['el-icon-star-on', $style.required]" :style="{backgroundColor:theme.bg_color}" v-if="required"></span>

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
        :style="[{width:inputWidth}, inputStyle]"
        v-bind="$attrs"
        :type="number ? 'number' : (password ? 'password': 'text')"
        :maxlength="maxlength"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        @click="handleClick"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange">
    </div >

    <div v-if="disabled" :class="$style.disabled"/>
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
  
  export default {
    name: "InputText",
    props: {
      value: [String, Number,Array],                                        // 当前值(v-model)
      label: String,                                                  // 标题文本
      unit: String,                                                   // 单位
      required: Boolean,                                              // 是否必填
      disabled: Boolean,                                              // 是否可操作
      readonly: Boolean,                                              // 是否只读
      reg: RegExp,                                                    // 正则表达式
      maxlength: Number,                                              // 输入的最大长度
      password:     { type: Boolean, default: false },                // 是否是密码输入类型
      number:       { type: Boolean, default: false },                // 是否是数字输入类型
      clearable:    { type: Boolean, default: false },                // 是否显示可清除图标
      autocomplete: { type: String,  default: 'off' },                // 自动补全
      border:       { type: Boolean, default: true },                 // 是否显示边框
      borderColor:  { type: String,  default: $_theme.border_color_light },
      focusClass: String,
      height:       { type: Number,  default: $_theme.inputHeight },  // 高度数值，单位是px
      labelMinWidth:{ type: Number,  default: 10 },  		  		  // lable宽度最小数值，单位是px
      labelMaxWidth:{ type: Number},  		  		  // lable宽度最大数值，单位是px
      inputWidth:   { type: String,  default: '100%' },               // 输入框的宽度
      inputStyle:   { default: null },                                // 输入框的style
      onInput: Function,
    },
    data() {
      return {
        hovering: false,
        focused: false,
        isComposing: false
      };
    },
    methods: {
      focus() {
        this.$refs.input.focus();
      },
      blur() {
        this.$refs.input.blur();
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
        if (!this.onInput && this.isComposing) return;
        let value = event.target.value;
        this.reg && (value = value.replace(this.reg,''));
        this.onInput && this.onInput(value);
        if (this.isComposing) return;
        this.$emit('input', value);
        this.$nextTick(this.setNativeInputValue);
      },
      handleClick() {
        this.$el.focus();
        this.focus();
        this.$emit('click');
      },
      clear() {
        this.$emit('input', '');
        this.$emit('change', '');
        this.$emit('clear');
      },
      handleChange(event) {
        this.$emit('change', event.target.value);
      },
      setNativeInputValue() {
        let input = this.$refs.input;
        if (input && input.value !== this.nativeInputValue) {
          input.value = this.nativeInputValue;
        }
      }
    },
    mounted() {
      this.setNativeInputValue();
    },
    watch: {
      nativeInputValue() {
        this.setNativeInputValue();
      },
      focused: function(v) {
        this.$emit('focused', v);
      }
    },
    computed: {
      nativeInputValue() {
        return this.value === null || this.value === undefined ? '' : String(this.value);
      },
      showClear() {
        return this.clearable && !this.disabled && !this.readonly && this.nativeInputValue && (this.focused || this.hovering);
      },
      containerStyle() {
        return {
          height: this.height + 'px',
          borderColor: this.focused ? this.theme.color : this.borderColor,
          zIndex: this.focused ? this.theme.zindex() : ''
        };
      },
      labelStyle() {
        return {
          minWidth:this.labelMinWidth + 'px',
          maxWidth:this.labelMaxWidth + 'px',
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
