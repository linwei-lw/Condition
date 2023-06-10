
<template>
  <div :class="[$style.container, border && $style.border]" :style="containerStyle" tabindex="0" @focus="focused=true" @blur="focused=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle" v-if="label" is-label>{{label}}</span>

    <!--必填显示-->
    <span :class="[$style.required,'el-icon-star-on']" :style="{backgroundColor:theme.bg_color}" v-if="required"></span>

    <!--单位显示-->
    <span :class="$style.unit" v-if="unit">{{unit}}</span>

    <!--radio分组显示-->
    <div :class="$style.radioGroup" :style="[{display:vertical?'inline-block':'flex'},groupStyle]">
      <!--遍历每个radio项-->
      <label v-for="item in options" :key="item[valueField]"
        :class="[$style.radioItem, isChecked(item) ? $style.checked : $style.unchecked]"
        :style="[{color: isChecked(item) ? theme.menubar_color : ''}, radioLabelStyle]">
        <!--radio按钮-->
        <input type="radio" :disabled="disabled" :value="item[valueField]" :checked="isChecked(item)" :name="groupName" @change="handleChange($event, item)" style="display:none;">
        <!--radio后面的文字-->
        <span style="margin-left:18px;">{{ item[labelField] }}</span>
      </label>
    </div>

    <slot></slot>

    <div v-if="disabled" :class="$style.disabled"/>
  </div>
</template>

<script>
  /*
  * 使用例子
  * <InputRadio label="你要选择哪一个" :options="[{label:'吃饭',value:1},{label:'睡觉',value:2}]" v-model="want" @change="onRadioChg"/>
  *
  *  data: {want: 1},
  *  methods: {
  *    onRadioChg(value) {// value值是1或2
  *    }
  *  }
  */

  export default {
    name: "InputRadio",
    props: {
      label: String,                                              // 标题文本
      value: [String, Number, Boolean],                           // 当前值(v-model)
      options: Array,                                             // 多个选项 [{lable:xxx,value:xxx}...]
      labelField: { type: String, default: 'label' },             // 显示字段
      valueField: { type: String, default: 'value' },             // 值字段
      unit: String,                                               // 单位
      required: Boolean,                                          // 是否必填
      disabled: Boolean,                                          // 是否可操作
      border:   { type: Boolean, default: true },                 // 是否显示边框
      vertical: { type: Boolean, default: false },                // 是否垂直布局
      height:   { type: Number,  default: $_theme.inputHeight },  // 高度数值，单位是px
      labelMinWidth:{ type: Number,  default: 10 },               // lable宽度最小数值，单位是px
      groupStyle: { default: null },
    },
    data() {
      return { groupName: window.$_uuid('RadioGroup'), focused: false };
    },
    methods: {
      isChecked(item) {
        item = item[this.valueField];
        return item === this.value || (""+item) === (""+this.value);
      },
      handleChange(event, item) {
        if (this.disabled) {
          return false;
        }
        let value = event.target.value;
        if (this.valueType == 'number') {
          value = Number(value);
        } else if (this.valueType == 'boolean') {
          value = value == 'true';
        }
        if (this.value !== value) {
          this.$emit('input',  value);
          this.$emit('change', value, item);
        }
      }
    },
    computed: {
      valueType() {
        if (this.options && this.options.length > 0) {
          return typeof this.options[0][this.valueField];
        }
        return null;
      },
      containerStyle() {
        return {
          height: this.height + 'px',
          borderColor: this.focused ? this.theme.color : this.theme.border_color_light,
          zIndex: this.focused ? this.theme.zindex() : ''
        }
      },
      labelStyle() {
        return {
          minWidth: this.labelMinWidth + 'px',
          borderRightColor: this.theme.border_color_light,
          backgroundColor: this.theme.bg_color
        };
      },
      radioLabelStyle() {
        return { display: this.vertical ? 'block' : 'inline-block' };
      }
    }
  };
</script>

<style module>
  .checked         { background-image: url("@/assets/check/radio-checked.png"); }
  .checked:hover   { background-image: url("@/assets/check/radio-checked-hover.png"); }
  .unchecked       { background-image: url("@/assets/check/radio-unchecked.png"); }
  .unchecked:hover { background-image: url("@/assets/check/radio-unchecked-hover.png"); }

  .container {
    outline: none;
    position: relative;
    display: inline-block;
    white-space: nowrap;
    background-color: #fff;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
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
  }
  /* radio组 */
  .radioGroup {
    overflow: hidden;
    padding-left: 8px;
  }
  /* radio项(按钮+文字) */
  .radioItem {
    margin: 6px 8px 6px 0px;
    white-space: nowrap;
    background-repeat: no-repeat;
    background-position-y: center;
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
    display: flex !important;
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
