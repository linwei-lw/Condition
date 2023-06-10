<template>
  <div :class="[$style.container, border && $style.border]" :style="containerStyle">
    <!--label显示-->
    <span :class="$style.label" style="width:1px;" :style="labelStyle" is-label>
      <span :class="$style.label_text">{{label}}<span :class="[$style.required]" style="width:1px;" v-if="required">*</span></span>
    </span>
    <slot></slot>
    <span v-if="!$slots.default"></span>
    
  </div>
</template>

<script>
  
  export default {
    name: "InputLabel",
    props: {
      label: String,                                                  // 标题文本
      required: Boolean,                                              // 是否必填
      border:       { type: Boolean, default: false },                 // 是否显示边框
      borderColor:  { type: String,  default: $_theme.border_color_light },
      minHeight:    { type: Number,  default: $_theme.inputHeight },  // 高度数值，单位是px
      labelMinWidth:{ type: Number,  default: 10 },               // lable宽度最小数值，单位是px
    },
    computed: {
      containerStyle() {
        return {
          minHeight: this.minHeight + 'px',
          borderColor: this.borderColor
        };
      },
      labelStyle() {
        return {
          minWidth: this.labelMinWidth + 'px',
          borderRightColor: this.theme.border_color_light
        };
      }
    }
  };
</script>

<style module>
  .container {
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
    padding: 0 10px 0 6px;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    text-align: justify;
    text-align-last: justify;
  }
  .label_text{
    position: relative;

  }
  /* 必填 */
  .required {
    position: absolute;
    top: -10px;
    right: -3px;
    /* padding: 0 5px 0 2px; */
    font-size: 18px;
    font-weight: 700;
    color: #f00;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }
</style>
