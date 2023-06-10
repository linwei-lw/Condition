<template>
  <div :class="[$style.container, border && $style.border]" :style="containerStyle">
    <!--label显示-->
    <span :class="$style.label" style="width:1px;" :style="labelStyle" is-label>{{label}}</span>
    <slot></slot>
    <span v-if="!$slots.default"></span>
    <!--必填显示-->
    <span :class="[$style.required,'el-icon-star-on']" style="width:1px;" :style="{backgroundColor:theme.input_label_bg_color}" v-if="required"></span>
    <div v-if="disabled" :class="$style.disabled" :style="{borderRadius: radius}"/>
  </div>
</template>

<script>
  
  export default {
    name: "InputLabel",
    props: {
      label: String,                                                  // 标题文本
      required: Boolean,                                              // 是否必填
      border:       { type: Boolean, default: true },                 // 是否显示边框
      borderColor:  { type: String,  default: $_theme.border_color_light },
      radius:       { type: String,  default: $_theme.input_radius},  // 边框圆角
      minHeight:    { type: Number,  default: $_theme.inputHeight },  // 高度数值，单位是px
      labelMinWidth:{ type: Number,  default: 10 },                   // lable宽度最小数值，单位是px
      disabled: Boolean,                                              // 是否可操作
    },
    computed: {
      containerStyle() {
        return {
          borderRadius: this.radius,
          minHeight: this.minHeight + 'px',
          borderColor: this.borderColor
        };
      },
      labelStyle() {
        return {
          minWidth: this.labelMinWidth + 'px',
          borderRightColor: this.theme.border_color_light, 
          backgroundColor: this.theme.input_label_bg_color
        };
      }
    }
  };
</script>

<style module>
  .container {
    overflow: hidden;
    vertical-align: top;
    position: relative;
    background-color: #fff;
    outline: none;
    white-space: nowrap;
    display: table;
    table-layout: auto;
  }
  .container > * {
    height: 100% !important;
    display: table-cell !important;
    vertical-align: middle !important;
  }
  .border {
    border-style: solid;
    border-width: 1px;
  }
  /* 标题文本 */
  .label {
    padding: 0 6px;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }
  /* 必填 */
  .required {
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
