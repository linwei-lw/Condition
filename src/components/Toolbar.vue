<template>
  <div :class="[$style.toolbar, small && $style.toolbar_small, mini && $style.toolbar_mini, zero && $style.toolbar_zero]" :style="[{backgroundColor:bgc}, border ? {borderColor:theme.border_color_dark} : {border: 0}]">
    <div v-if="$slots.default" :class="[$style.left, small && $style.left_small, mini && $style.left_mini, zero && $style.left_zero]" :style="[{width: $slots.right ? '' : '100%'}, leftStyle]">
      <slot></slot>
    </div>
    <span v-if="$slots.right && !$slots.default" >&nbsp;</span>
    <div v-if="$slots.right" :class="[$style.right, small && $style.right_small, mini && $style.right_mini, zero && $style.right_zero]" :style="rightStyle">
      <slot name="right"></slot>
    </div>

    <div v-if="disabled" :class="$style.disabled"/>
  </div>
</template>

<script>

  /*
  * 使用例子
  *
  *  <Toolbar>
  *    <InputText/>
  *    <InputText/>
  *    <Button>查询</Button>
  *
  *    <template slot="right">
  *      <Button>新增</Button>
  *      <Button>修改</Button>
  *      <Button>删除</Button>
  *    </template>
  *  </Toolbar>
  */

  export default {
    name: "Toolbar",
    props: {
      border: { type: Boolean, default: true }, // 是否显示边框
      small:  { type: Boolean, default: false}, // 边距变小
      mini:   { type: Boolean, default: false}, // 边距超小
      zero:   { type: Boolean, default: false}, // 无边距
      leftStyle: { default: null},
      rightStyle: { default: null},
      disabled:  Boolean,                       // 是否可操作
      bgc: { type:String ,default:$_theme.bg_color }
    }
  };
</script>

<style module>
  .toolbar {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 8px 0;
    border-width: 1px;
    border-style: solid;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .toolbar_small {
    padding: 5px 0;
  }
  .toolbar_mini {
    padding: 3px 0;
  }
  .toolbar_zero {
    padding: 0;
  }
  .left, .right {
    display: flex;
    white-space: nowrap;
    flex-shrink: 0;
    align-items: center;
  }
  .left > * {
    float: left;
    margin-left: 8px;
  }
  .left > *:last-child, .right > * {
    margin-right: 8px;
  }

  .left_small > * {
    margin-left: 5px;
  }
  .left_small > *:last-child, .right_small > * {
    margin-right: 5px;
  }

  .left_mini > * {
    margin-left: 3px;
  }
  .left_mini > *:last-child, .right_mini > * {
    margin-right: 3px;
  }

  .left_zero > * {
    margin-left: 0;
  }
  .left_zero > *:last-child, .right_zero > * {
    margin-right: 0;
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
