<template>
  <div :class="$style.container" @click="onBarClick($event)" @wheel.prevent="wheelBar($event)" @mousemove="showtip && onMouseMove($event)" @mouseleave="showMouseTip=false">
    <div :class="$style.bar" :style="{backgroundColor: barColor||theme.border_color_light}" ref="bar">
      <div :class="$style.value_bar" :style="{width: brate+'%', backgroundColor: valueColor||theme.color}" v-if="showValueBar"></div>
     
      <div :class="$style.sign" v-for="v in signs" :key="v" @mousemove.stop="!showButtonTip && (showMouseTip=true) && (mouseValue=v)" @click.stop="onSignClick(v)" :style="{left:((v-min)*100/rang)+'%', borderColor: barColor||theme.border_color_light}"></div>

      <div :class="$style.btn" :style="{left: brate+'%', borderColor: theme.color}" @mousedown="onDragStart($event)" @mouseenter="showButtonTip=true;showMouseTip=false" @mouseleave="!draging&&(showButtonTip=false)"></div>

      <span @mousemove.stop="showMouseTip=false" :class="$style.tooltip" ref="buttonTip" :style="{left: `calc(${brate}% - ${buttonTipWidth/2}px)`, borderColor: valueColor||theme.color}" v-show="showtip && showButtonTip"> {{getTooltip ? getTooltip(buttonValue) : tooltip.replace(reg,buttonValue)}} </span>
      <span @mousemove.stop="showMouseTip=false" :class="$style.tooltip" ref="mouseTip"  :style="{left: `calc(${mrate}% - ${mouseTipWidth/2}px)`, borderColor: valueColor||theme.color}"  v-show="showtip && showMouseTip">  {{getTooltip ? getTooltip(mouseValue) : tooltip.replace(reg,mouseValue)}} </span>
    </div>

    <!--禁止操作层-->
    <div v-if="disabled" :class="$style.disabled"/>
  </div>
</template>

<script>

  /*
  * 使用例子
  * <Slider tooltip="{}秒" :min="0" :max="59" :signs="[0,30,59]" v-model="second" @change="onSecondChg()"/>  
  * 
  *  data: {second: 0},
  *  methods: {
  *    onSecondChg(second) {
  *    }
  *  }
  */

  export default {
    name: "Slider",
    props: {
      value: { type: [String, Number],  default: 0 },            // 当前值(v-model)
      min:   { type: Number,  default: 0 },
      max:   { type: Number,  default: 100 },
      step:   { type: Number,  default: 1 },
      signs: Array,
      showtip: { type: Boolean,  default: true },
      tooltip: { type: String, default: '{}'},
      getTooltip: Function,
      barColor: { type: String, default: null},
      valueColor: { type: String, default: null},
      disabled: Boolean,                               // 是否可操作
      showValueBar: { type: Boolean, default: true},   //
    },
    data() {
      return {
        buttonTipWidth: 0,
        showButtonTip: false,
        buttonValue: 0,
        mouseTipWidth: 0,
        showMouseTip: false,
        mouseValue: 0,
        draging: false,
        reg: new RegExp("\\{\\}","g")
      };
    },
    mounted() {
      this.buttonValue = this.validValue(Number(this.value||this.min));
    },
    watch: {
      value: function(v) {
        this.buttonValue = this.validValue(v);
      },
      buttonValue: function(v) {
        this.$nextTick(this.setButtonTipWidth);
      },
      showButtonTip: function(v) {
        v && this.$nextTick(this.setButtonTipWidth);
      },
      mouseValue: function(v) {
        this.$nextTick(this.setMouseTipWidth);
      },
      showMouseTip: function(v) {
        v && this.$nextTick(this.setMouseTipWidth);
      },
      
    },
    methods: {
      onSignClick(v) {
        let oldValue = this.buttonValue;
        this.buttonValue = this.validValue(v);
        this.$emit('input', this.buttonValue);
        this.$emit('change', this.buttonValue, oldValue);
      },
      wheelBar(event) {
        this.showButtonTip = true;
        this.showMouseTip = false;
        let oldValue = this.buttonValue;
        this.buttonValue = this.validValue(event.deltaY < 0 ? (this.buttonValue - this.step) : (this.buttonValue + this.step));
        if (oldValue != this.buttonValue) {
          this.$emit('input', this.buttonValue);
          this.$emit('change', this.buttonValue, oldValue);
        }
      },
      onDragStart(event) {
        this.draging = true;
        document.addEventListener('mousemove', this.onDragging);
        document.addEventListener('mouseup', this.onDragEnd);
        this.$emit('dragstart', this._oldValue = this.buttonValue);
      },
      onDragging(event) {
        let w = event.clientX - this.$refs.bar.getBoundingClientRect().left;
        this.buttonValue = this.validValue(Math.round((w * this.rang / this.$refs.bar.clientWidth + this.min)/this.step) * this.step);
        this.$emit('dragging', this.buttonValue);
      },
      onDragEnd(event) {
        this.draging = this.showButtonTip = false;
        document.removeEventListener('mousemove', this.onDragging);
        document.removeEventListener('mouseup', this.onDragEnd);
        this.$emit('input', this.buttonValue);
        this.$emit('change', this.buttonValue, this._oldValue);
        this.$emit('dragend', this.buttonValue, this._oldValue);
      },
      onBarClick(event) {
        let oldValue = this.buttonValue;
        let w = event.clientX - this.$refs.bar.getBoundingClientRect().left;
        this.buttonValue = this.validValue(Math.round((w * this.rang / this.$refs.bar.clientWidth + this.min)/this.step) * this.step);
        this.$emit('input', this.buttonValue);
        this.$emit('change', this.buttonValue, oldValue);
      },
      onMouseMove(event) {
        if (this.showButtonTip) return;
        let w = event.clientX - this.$refs.bar.getBoundingClientRect().left;
        this.mouseValue = this.validValue(Math.round((w * this.rang / this.$refs.bar.clientWidth + this.min)/this.step) * this.step);
        this.showMouseTip = true;
      },
      setButtonTipWidth() {
        this.buttonTipWidth = this.$refs.buttonTip.clientWidth;
      },
      setMouseTipWidth() {
        this.mouseTipWidth = this.$refs.mouseTip.clientWidth;
      },
      validValue(v) {
        v = Number(v.toFixed(5));
        return v < this.min ? this.min : (v > this.max ? this.max : v);
      }
    },
    computed: {
      brate() {
        return this.rang == 0 ? 0 : ((this.buttonValue - this.min) * 100 / this.rang);
      },
      mrate() {
        return this.rang == 0 ? 0 : ((this.mouseValue - this.min) * 100 / this.rang);
      },
      rang() {
        return this.max - this.min;
      }
    }
  };
</script>

<style module>
  .container {
    position: relative;
    line-height: normal;
    cursor: pointer;
    height: 20px;
    margin: 0;
    padding: 0;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }
  .bar {
    top: 8px;
    width: 100%;
    height: 4px;
    vertical-align: middle;
    position: relative;
  }
  .value_bar {
    height: 4px;
    /*border-radius: 3px;*/
    position: absolute
  }
  .btn {
    position: absolute;
    margin-left: -6px;
    top: -4px;
    width: 12px;
    height: 12px;
    border-width: 2px;
    border-style: solid;
    border-radius: 50%;
    background-color: #fff;
    outline: 0;
  }
  .sign {
    position: absolute;
    margin-left: -5px;
    top: -3px;
    width: 10px;
    height: 10px;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;
    background-color: #fff;
    outline: 0;
  }
  .tooltip {
    position: absolute;
    top: -35px;
    padding: 4px 6px;
    border-width: 1px;
    border-style: solid;
    white-space: nowrap;
    background-color: #FCF0C1;
    z-index: 99999;
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
