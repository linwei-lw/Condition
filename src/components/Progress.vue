<template>
  <div :class="[border && $style.border]" style="width:100%;text-align:center;padding:1px;position:relative;" :style="containerStyle">
    <div style="height:100%;" :style="{backgroundColor:theme.color, width:value+'%'}"/>
    <span style="position:absolute;" :style="{top:(height-18)/2 + 'px'}"> {{value + '%'}} </span>
  </div>
</template>

<script>

  export default {
    name: "Progress",
    props: {
      value: { type: Number, default: 0},
      border: { type: Boolean, default: true }, // 是否显示边框
      borderColor: { type: String,  default: $_theme.border_color_light },
      height: { type: Number,  default: $_theme.inputHeight },        // 高度数值，单位是px
    },
    
    computed: {
      containerStyle() {
        return {
          height: this.height + 'px',
          borderColor: this.borderColor
        }
      },
    }
  };
</script>

<style module>
  .border {
    border-style: solid;
    border-width: 1px;
  }
</style>
