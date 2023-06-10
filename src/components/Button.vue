<template>

  <button type="button" :class="[$style.btn,type=='transparent'&&$style.transparent]" :style="[type!='transparent'&&buttonColor, buttonStyle, {borderRadius: radius}]"
    @mouseenter="!disabled_&&(hover=true)" @mouseleave="hover=false" 
    @mousedown="!disabled_&&(down=true);$emit('mousedown',$event)" @mouseup="!disabled_&&(down=false);$emit('mouseup',$event)" @click="!disabled_&&handleClick($event)">
    <i :class="icon_" v-if="icon_" style="font-size:16px;" :style="[istyle,iconStyle]"></i>
    <span v-if="$slots.default" :style="slotStyle" style="display:inline-block;margin-top:-1px;vertical-align:middle;"><slot></slot></span>
    <div v-if="disabled_" :class="$style.disabled" :style="[border && {left:'-1px',top:'-1px',width:'calc(100% + 2px)',height:'calc(100% + 2px)'}]"/>
  </button>

</template>

<script>
  /*
  * 使用例子
  * <Button type="primary" icon="el-icon-setting" :height="40" :border="false" :disabled="false" @click="onClick"">点我呀笨</Button>
  *  
  *  methods: {
  *    onClick(event) {
  *      alert('窝草，还真点了！');
  *    }
  *  }
  */

  export default {
    name: "Button",
    props: {
      type:   { type: String,  default: 'plain' },             // 风格样式 plain:朴素(用于关闭，取消等) primary:主要(用于确认，提交等) light:浅色(用于紧挨输入框边的按钮) transparent:透明样式 custom:自定义(用于窗口右上角关闭等按钮)
      customs:{ type: Array,   default: null},                 // 自定义设置 [正常状态[背景色，边框色，文字色]，hover状态[背景色，边框色，文字色]，按下状态[背景色，边框色，文字色]]
      border: { type: Boolean, default: true },                // 是否有边框
      borderColor: { type: String, default: null},             // 边框颜色
      height: { type: Number,  default: $_theme.inputHeight }, // 高度数值，单位是px
      padding: String,
      radius: { type: String,  default: '0px'},                // 边框圆角
      disabled: Boolean,                                       // 是否禁用
      icon: String,                                            // 图标样式
      iconStyle: { default: null },
      slotStyle: { default: null },
    },
    data() {
      return {
        hover: false,
        down: false,
        disabled_: this.disabled,
        icon_: this.icon,
      };
    },
    watch: {
      disabled: function(v) {
        this.disabled_ = v;
        v && (this.hover = false);
      },
      icon: function(v) {
        this.icon_ = v;
      }
    },
    methods: {
      handleClick(event) {
        this.$emit('click', event);
      },
      setIcon(icon) {
        this.icon_ = icon;
      },
      setDisabled(v) {
        this.disabled_ = v;
      }
    },
    computed: {
      istyle() {
        return this.$slots.default ? { marginRight: '5px', verticalAlign:'middle'} : null;
      },
      buttonStyle() {
        return {
          height: this.height + 'px',
          padding: this.padding || ('0 ' + Math.max(this.height/2-6, 0) + 'px'),
          borderWidth: this.border ? '1px' : '0',
          cursor: this.disabled ? 'not-allowed' : 'pointer'
        }
      },
      buttonColor() {
        return this[this.type][this.down ? 'down' : (this.hover ? 'hover' : 'normal')];
      },
      plain() {
        return {
          down:   { backgroundColor: this.theme.bg_color, borderColor: this.borderColor || this.theme.color, color: this.theme.color },
          hover:  { backgroundColor: '#fff', borderColor: this.borderColor || this.theme.border_color_dark, color: this.theme.color },
          normal: { backgroundColor: '#fff', borderColor: this.borderColor || this.theme.border_color_dark, color: this.disabled ? '#707070' : null }
        };
      },
      primary() {
        return {
          down:   { color: '#fff', borderColor: this.theme.color, backgroundColor: this.theme.color },
          hover:  { color: '#fff', borderColor: this.theme.rgba(this.theme.color, 0.1), backgroundColor: this.theme.rgba(this.theme.color, 0.8) },
          normal: { color: '#fff', borderColor: this.theme.color, backgroundColor: this.theme.color }
        };
      },
      light() {
        return {
          down:   { borderColor: this.borderColor || this.theme.border_color_light, color: this.theme.color, backgroundColor: this.theme.selected_color },
          hover:  { borderColor: this.borderColor || this.theme.border_color_light, color: this.theme.color, backgroundColor: '#fff' },
          normal: { borderColor: this.borderColor || this.theme.border_color_light, backgroundColor: this.theme.bg_color }
        };
      },
      custom() {
        return this.customs ? {
          down:   { backgroundColor: this.customs[2][0], borderColor: this.customs[2][1], color: this.customs[2][2] },
          hover:  { backgroundColor: this.customs[1][0], borderColor: this.customs[1][1], color: this.customs[1][2] },
          normal: { backgroundColor: this.customs[0][0], borderColor: this.customs[0][1], color: this.customs[0][2] },
        } : {};
      }
    }
  };
</script>

<style module>
  .btn {
    position: relative;
    display: inline-block;
    white-space: nowrap;
    text-align: center;
    border-style: solid;
    outline: 0;
    margin: 0;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }
  .transparent {
    color:#fff;
    font-size: 16px;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .transparent:hover {
    background-color: rgba(255,255,255,0.2);
  }
  .transparent:active {
    background-color:rgba(0,0,0,0.2);
  }
  .disabled {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(235, 235, 235, 0.6);
    opacity: 0.6;
    filter: alpha(opacity=60); 
    cursor: not-allowed;
  }
</style>
