<template>
  <Button :title="'快捷时间选择'" padding="0 2px" :iconStyle="{marginRight: '0px'}" v-bind="$attrs" :icon="icon" type="primary" :height="height" style="position:relative" @click="showDropDown=!showDropDown">
    <slot></slot>
    <div ref="dropdown" :class="$style.dropdown" :style="dropdownStyle" v-if="showDropDown">
      <div style="border-bottom:1px solid #EDEDED;" :class="$style.dropdownDiv">
        <div v-for="item in date1" :key="item.label" :class="$style.item" @click="select(item, true)">
          <p>{{item.label}}</p>
        </div>
      </div>
      <div style="background-color: #F6F6F6;" :class="$style.dropdownDiv">
        <div v-for="item in date2" :key="item.label" :class="$style.item" @click="select(item, false)" :style="{borderColor:theme.border_color_dark}">
          <p>{{item.label}}</p>
        </div>
      </div>
      <div v-if="showDropDown&&showTriangle2" :class="[$style.triangle, getTriangleClass()]" :style="{zIndex: theme.zindex()}"></div>
    </div>
    <div v-if="showDropDown&&showTriangle" :class="[$style.triangle, getTriangleClass()]" :style="{zIndex: theme.zindex()}"></div>
  </Button>
</template>

<script>
import { addDateTime, getDays } from '@/common/util/Dates.js';
import { domPosition } from '@/components/util/Dom.js';

export default {
  name: "QuickTime",
  props: {
    icon:   { type: String, default:'el-icon-arrow-right' },
    height: { type: Number },
    type:   { type: String, default:'YMDHN' },  //是"YMDHNS"的组合，Y年　M月　D日　H时　N分　S秒
    position: { type: String, default:'br' },   //t:top, b:bottom, r:right, l:left 可两两组合
  },
  data() {
    return {
      date1: [
        {label:$_L.get('今天'),  start:0,            end:0},
        {label:$_L.get('昨天'),  start:-1,           end:-1},
        {label:$_L.get('本周'),  start:1/*-day*/,    end:0},
        {label:$_L.get('上周'),  start:-6/*-day*/,   end:0/*-day*/},
        {label:$_L.get('本月'),  start:1/*-date*/,   end:0},
        {label:$_L.get('上月'),  start:1/*-pmonth*/, end:0/*-date*/}
      ],
      date2: [
        {label:$_L.get('近{0}天',3),  start:-2,  end:0},
        {label:$_L.get('近{0}天',5),  start:-4,  end:0},
        {label:$_L.get('近{0}天',7),  start:-6,  end:0},
        {label:$_L.get('近{0}天',10), start:-9,  end:0},
        {label:$_L.get('近{0}天',15), start:-14, end:0},
        {label:$_L.get('近{0}天',30), start:-29, end:0}
      ],
      showDropDown: false,
      showTriangle: true,
      showTriangle2: false,//为了解决第一个三角形出现被遮挡的情况
      dropdownStyle: {borderColor: $_theme.border_color_dark,zIndex:1},
      triangleStyle: {},
    };
  },
  watch: {
    showDropDown: function(v) {
      this._onMouseClick = this._onMouseClick || (e => this.showDropDown = false);
      setTimeout(()=>document[v?'addEventListener':'removeEventListener']('click', this._onMouseClick), 100);
      if (!v) return;
      
      this.$nextTick(() => {
        let s = this.dropdownStyle, t = this.triangleStyle, eh = this.$el.clientHeight, ew = this.$el.clientWidth, dh = this.$refs.dropdown.clientHeight, dw = this.$refs.dropdown.clientWidth;
        let { top, left, bottom, right } = domPosition(this.$el);
        s.zIndex = window.$_theme.zindex();
        let heightSpace = dh + 14; //弹窗需要的高度空间
        let heightSpace2 = (dh - eh)/2; //弹窗需要的高度空间
        let widthSpace1 = dw - ew - 9; //弹窗需要的宽度空间
        let widthSpace2 = (dw - ew)/2; //弹窗需要的宽度空间
        let widthSpace3 = dw + 14 ; //弹窗需要的宽度空间
        switch (this.position) {
          case 'br':
          case 'rb': if(bottom<heightSpace){this.showTriangle = false} return s.bottom = (bottom>=heightSpace?(bottom -heightSpace):0) + 'px', s.right = (right>=widthSpace1?(right - widthSpace1):0) + 'px';
          case 'tr':
          case 'rt': if(top<heightSpace){this.showTriangle = false} return s.top = (top>=heightSpace?(top - heightSpace):0) + 'px', s.right = (right>=widthSpace1?(right - widthSpace1):0) + 'px';
          case 'bl':
          case 'lb': if(bottom<heightSpace){this.showTriangle = false} return s.bottom = (bottom>=heightSpace?(bottom -heightSpace):0) + 'px', s.left = (left>=widthSpace1?(left - widthSpace1):0) + 'px';
          case 'tl':
          case 'lt': if(top<heightSpace){this.showTriangle = false} return s.top = (top>=heightSpace?(top - heightSpace):0) + 'px', s.left = (left>=widthSpace1?(left - widthSpace1):0) + 'px';
          case 't' : if(top<heightSpace){this.showTriangle = false} return s.top = (top>=heightSpace?(top - heightSpace):0) + 'px', s.left = (left>=widthSpace2?(left - widthSpace2):0) + 'px';
          case 'b' : if(bottom<heightSpace){this.showTriangle = false} return s.bottom = (bottom>=heightSpace?(bottom -heightSpace):0) + 'px', s.left = (left>=widthSpace2?(left - widthSpace2):0) + 'px';
          case 'l' : this.showTriangle = false; this.showTriangle2=true; if(left<widthSpace3){this.showTriangle2=false} return s.top =  (top>=heightSpace2?(top - heightSpace2):0) + 'px', s.left = (left>=widthSpace3?(left - widthSpace3):0) + 'px';
          case 'r' : this.showTriangle = false; this.showTriangle2=true; if(right<widthSpace3){this.showTriangle2=false} return s.bottom = (bottom>=heightSpace2?(bottom - heightSpace2):0) + 'px', s.right = (right>=widthSpace3?(right - widthSpace3):0) + 'px';
        }
      });
    },
    type: function(v) {
      this.onTypeChg(v);
    }
  },
  mounted() {
    this.onTypeChg(this.type);
  },
  methods: {
    getTriangleClass(){
      if(this.position === 'l'){
        return this.$style.triangleLeft;
      }else if(this.position === 'r'){
        return this.$style.triangleRight;
      }else if(this.position.indexOf('t')!=-1){
        return this.$style.triangleTop;
      }else{
        return this.$style.triangleBottom;
      }
    },
    onTypeChg(v) {
      switch (v) {
        case 'YMDHN': this.s_suffix = ' 00:00'; this.e_suffix = ' 23:59'; break;
        case 'YMDHNS': this.s_suffix = ' 00:00:00'; this.e_suffix = ' 23:59:59'; break;
        case 'YMDH': this.s_suffix = ' 00'; this.e_suffix = ' 23'; break;
        default: this.s_suffix = this.e_suffix = '';
      }
    },
    select(item, vars) {
      if (vars) {
        let now = new Date();
        let date = now.getDate();
        let day = now.getDay()==0 ? 7 : now.getDay();
        now.setMonth(now.getMonth()-1);
        let pmonth = getDays(now.getFullYear(), now.getMonth()+1)+date;
        
        this.date1[2].start = 1-day;
        this.date1[3].start = -day-6;   this.date1[3].end = -day;
        this.date1[4].start = 1-date;
        this.date1[5].start = 1-pmonth;  this.date1[5].end = -date;
      }
      let s = addDateTime(item.start, 'YYYY-MM-DD') + this.s_suffix;
      let e = addDateTime(item.end, 'YYYY-MM-DD') + this.e_suffix;
      this.$emit('set', s, e);
    }
  }
};
</script>
<style module>

  /* 下拉容器 */
  .dropdown {
    position: fixed;
    padding: 0;
    margin: 0;
    background-color: #fff;
    box-shadow: 0px 0px 12px 1px RGBA(112, 112, 112, 0.35);
    color: #3A3A3A;
  }
  .dropdown > .dropdownDiv{
    height: 64px;
  }
  .dropdown > .dropdownDiv::after{
    height: 0px;
    content: '';
    clear: both;
    display: block;
  }
  .item {
    height: 100%;
    width: 65px;
    float: left;
    display: flex;
    align-items: center;
  }
  .item:hover {
    background-color: #FCF0C1;
  }
  .item p{
    height: 20px;
    width: 100%;
    font-size: 14px;
    border-right: 1px solid #cecece;
    margin: 0;
  }
  .dropdown > .dropdownDiv > .item:nth-last-child(1) > p{
    border: none;
  }
  .triangle{
    width: 0;
    height: 0;
    border: solid #fff;
    position: absolute;
    border-width: 0px 7px 12px 7px;
  }
  .triangleTop{
    top: -15px;
    left: calc(50% - 7px);
    border: solid #F6F6F6;
    border-width: 12px 7px 0px 7px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
  }
  .triangleBottom{
    bottom: -15px;
    left: calc(50% - 7px);
    border-width: 0px 7px 12px 7px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
  }
  .triangleRight{
    left: -12px;
    top: calc(50% - 7px);
    border-width: 7px 12px 7px 0px;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
  }
  .triangleLeft{
    right: -12px;
    top: calc(50% - 7px);
    border-width: 7px 0px 7px 12px;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
  }
</style>