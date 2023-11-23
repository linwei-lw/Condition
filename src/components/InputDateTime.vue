
<template>
  <div :class="[$style.container, border && $style.border]" :style="containerStyle" tabindex="0" @focus="focused=true" @mouseenter="hover=true" @mouseleave="hover=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle" v-if="label" is-label @click="popup=null">{{label}}</span>

    <!--必填显示-->
    <span :class="[$style.required,'el-icon-star-on']" :style="{backgroundColor:theme.input_label_bg_color}" v-if="required" @click="popup=null"></span>

    <!--图标显示-->
    <span :class="needs.year||needs.month||needs.day?'el-icon-date':'el-icon-shiduan'" @click="setShowDropdown('all')" :style="{color: fontColor}" style="float:right;font-size:18px;padding-right:5px;cursor:pointer;" v-if="showIcon"></span>

    <!--clear按钮显示-->
    <i :class="$style.clear" :style="{lineHeight:lineHeight+'px', visibility:(value&&hover)?'visible':'hidden', color: fontColor}" v-if="clearable" class="el-icon-close" @click="clear"></i>

    <!--日期时间显示-->
    <div ref="datatime" :style="[{minWidth: textMinWidth+'px', color: fontColor}, inputStyle]" :class="$style.datatime" @click="$event.target==$refs.datatime&&setShowDropdown('all')">
      <span v-if="placeholder && !value" style="color:#B0B0B0;" @click.stop="setShowDropdown('all')"> {{placeholder}} </span>

      <span v-if="needs.year"   :class="$style.text" @click="yearStep=0;setShowDropdown('year')">   {{values.year}}   </span>
      <span v-if="needs.month && needs.year" v-show="values.month && values.year"> - </span>
      <span v-if="needs.month"  :class="$style.text" @click="setShowDropdown('month')">  {{fillzero(values.month)}}  </span>
      <span v-if="needs.day && needs.month"  v-show="values.day && values.month"> - </span>
      <span v-if="needs.day"    :class="$style.text" @click="setShowDropdown('day')">    {{fillzero(values.day)}}    </span>

      <span v-if="needs.hour && needs.day"> &nbsp;&nbsp; </span>

      <span v-if="needs.hour"   :class="$style.text" @click="setShowDropdown('hour')">   {{fillzero(values.hour)}}   </span>
      <span v-if="needs.minute && needs.hour"   v-show="values.minute!==null && values.hour!==null"> : </span>
      <span v-if="needs.minute" :class="$style.text" @click="setShowDropdown('minute')"> {{fillzero(values.minute)}} </span>
      <span v-if="needs.second && needs.minute" v-show="values.second!==null && values.minute!==null"> : </span>
      <span v-if="needs.second" :class="$style.text" @click="setShowDropdown('second')"> {{fillzero(values.second)}} </span>
    </div>

    <div v-if="disabled" :class="$style.disabled" :style="{borderRadius: radius}"/>

    <!--弹出年选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:150px;" v-if="popup == 'year'" ref="dropdown">
      <span style="width:calc(100% + 10px);" :style="{backgroundColor:theme.color}"> {{$_L.get('年')}} </span>
      <i class="el-icon-arrow-left"  :class="$style.arrow" @click="yearStep-=9" style="color:#fff;position:absolute;top:2.5px;left:10px;font-size:16px;"/>
      <i class="el-icon-arrow-right" :class="$style.arrow" @click="yearStep+=9" style="color:#fff;position:absolute;top:2.5px;right:10px;font-size:16px;"/>
      <span v-for="index in 9" :key="index" @click="setValueClick(values.year + index - 5 + yearStep,'year','month')" :class="$style.drop_item" style="width:33.3%;" :style="[(values.year + index - 5 + yearStep) == nows[0] && {fontWeight:'bold', color:'#f00'}, (index + yearStep) == 5 && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}]">
          {{values.year + index - 5 + yearStep}}
        </span>
    </div>

    <!--弹出月选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:150px;"  v-if="popup == 'month'" ref="dropdown">
      <span style="width:calc(100% + 10px);" :style="{backgroundColor:theme.color}"> {{$_L.get('月')}} </span>
      <span v-for="index in 12" :key="index" @click="setValueClick(index,'month','day')" :class="$style.drop_item" style="width:25%;" :style="[index == nows[1] && {fontWeight:'bold', color:'#f00'}, index == values.month && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}]">
          {{index}}
        </span>
    </div>

    <!--弹出日选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:180px;" v-if="popup == 'day'" ref="dropdown">
        <span style="width:calc(100% + 10px);padding:0 5px;" :style="{backgroundColor:theme.color}">
          <span v-for="day in [$_L.get('日'),$_L.get('一'),$_L.get('二'),$_L.get('三'),$_L.get('四'),$_L.get('五'),$_L.get('六')]" :key="day" style="width:14.28%;float:left;margin:0">
            {{day}}
          </span>
        </span>
      <span v-for="(day,index) in days" :key="index" @click="day&&setValueClick(day,'day','hour')" :class="$style.drop_item" style="width:14.28%;" :style="[day == nows[2] && {fontWeight:'bold', color:'#f00'}, day == values.day && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}, !day && {backgroundColor:'#fff',cursor:'default'}]">
          {{day||'&nbsp;'}}
        </span>
    </div>

    <!--弹出时选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:166px;" v-if="popup == 'hour'" ref="dropdown">
      <span style="width:calc(100% + 10px);" :style="{backgroundColor:theme.color}"> {{$_L.get('时')}} </span>
      <span v-for="index in 24" :key="index" @click="setValueClick(index-1,'hour','minute')" :class="$style.drop_item" style="width:16.6%;" :style="[(index-1) == nows[3] && {fontWeight:'bold', color:'#f00'}, (index-1) == values.hour && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}]">
          {{index-1}}
        </span>
    </div>

    <!--弹出分选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:270px;" v-if="popup == 'minute'" ref="dropdown">
      <span style="width:calc(100% + 10px);" :style="{backgroundColor:theme.color}"> {{$_L.get('分')}} </span>
      <span v-for="index in 60" :key="index" @click="setValueClick(index-1,'minute','second')" :class="$style.drop_item" style="width:10%;" :style="[(index-1) == nows[4] && {fontWeight:'bold', color:'#f00'}, (index-1) == values.minute && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}]">
          {{index-1}}
        </span>
    </div>

    <!--弹出秒选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:270px;" v-if="popup == 'second'" ref="dropdown">
      <span style="width:calc(100% + 10px);" :style="{backgroundColor:theme.color}"> {{$_L.get('秒')}} </span>
      <span v-for="index in 60" :key="index" @click="setValueClick(index-1,'second')" :class="$style.drop_item" style="width:10%;" :style="[(index-1) == values.second && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}]">
          {{index-1}}
        </span>
    </div>

    <!--弹出选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="width:200px;padding-bottom:0px" v-if="popup == 'all'" ref="dropdown">
      <div v-if="needs.year" :style="{width:needs.month?'calc(50% + 5px)':'calc(100% + 10px)'}" style="display:inline-block;text-align:center;line-height:30px;padding-bottom:5px">
        <i :class="$style.arrow" class="el-icon-arrow-left" @click="allArrowClick('year',-1)"></i>
        <span style="position:relative;top:-2px;font-size:14px;">&nbsp;{{values.year}}{{$_L.get('年')}}&nbsp;</span>
        <i :class="$style.arrow" class="el-icon-arrow-right" @click="allArrowClick('year',1)"></i>
      </div>
      <div v-if="needs.month" :style="{width:needs.year?'calc(50% + 5px)':'calc(100% + 10px)'}" style="display:inline-block;text-align:center;line-height:30px;padding-bottom:5px">
        <i :class="$style.arrow" class="el-icon-arrow-left" @click="allArrowClick('month',-1)"></i>
        <span style="position:relative;top:-2px;font-size:14px;">&nbsp;{{values.month}}{{$_L.get('月')}}&nbsp;</span>
        <i :class="$style.arrow" class="el-icon-arrow-right" @click="allArrowClick('month',1)"></i>
      </div>
      <div v-if="needs.day" style="display:inline-block; padding-bottom:5px;float:left;">
          <span style="width:calc(100% + 10px);padding:0 5px;margin-left:-5px;margin-bottom:5px;color:#fff;" :style="{backgroundColor:theme.color}">
            <span v-for="day in [$_L.get('日'),$_L.get('一'),$_L.get('二'),$_L.get('三'),$_L.get('四'),$_L.get('五'),$_L.get('六')]" :key="day" style="width:14.28%;margin:0;float:left;">
              {{day}}
            </span>
          </span>
        <span v-for="(day,index) in days" :key="index" @click="day&&(values.day=day)&&onAllChg('day')" :class="$style.drop_item" style="width:14.28%;" :style="[day == nows[2] && {fontWeight:'bold', color:'#f00'}, day == values.day && {backgroundColor:theme.color,color:'#fff',borderRadius:theme.input_radius}, !day && {backgroundColor:'#fff',cursor:'default'}]">
            {{day||'&nbsp;'}}
          </span>
      </div>
      <div style="clear:both;padding:0px 10px 5px 10px;" v-if="needs.hour||needs.minute||needs.second">
        <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.hour"   :tooltip="'{}'+$_L.get('时')" :min="0" :max="23" :signs="[0,12,23]" v-model="values.hour" @change="onAllChg('hour')"/>
        <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.minute" :tooltip="'{}'+$_L.get('分')" :min="0" :max="59" :signs="[0,10,20,30,40,50,59]" v-model="values.minute" @change="onAllChg('minute')"/>
        <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.second" :tooltip="'{}'+$_L.get('秒')" :min="0" :max="59" :signs="[0,30,59]" v-model="values.second" @change="onAllChg('second')"/>
      </div>
      <div v-if="needs.day||needs.hour" style="clear:both;line-height:30px;text-align:center;border-top-width:1px;border-top-style:solid;border-top-color:#eee;">
        <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(-1)"> {{$_L.get('昨天')}} </a>
        <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(0)">  {{$_L.get('今天')}} </a>
        <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(1)">  {{$_L.get('明天')}} </a>
        <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('00')">  00 </a>
        <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('12')">  12 </a>
        <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('24')">  24 </a>
        <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('now')"> {{$_L.get('现在')}}</a>
      </div>
    </div>

  </div>
</template>

<script>

/*
* 使用例子
* <InputDateTime type="YMD" label="你的生日" placeholder="请选择日期" required clearable v-model="date" @change="onDateChg" style="width:300px;"/>
*
*  data: {date: null},
*  methods: {
*    onDateChg(date) {
*    }
*  }
*
* type的值是"YMDHNS"的组合，Y年　M月　D日　H时　N分　S秒
*/

import { domLeftTop } from '@/components/util/Dom.js';
import { getNowDateTime } from '@/common/util/Dates.js';
import { addDateTime } from '@/common/util/Dates.js';
import { getDays } from '@/common/util/Dates.js';
import storage from '@/common/cache/Storage.js';


export default {
  name: "InputDateTime",
  props: {
    label: String,                                                      // 标题文本
    value: String,                                                      // 当前值(v-model)
    type:  { type: String, default: 'YMDHN' },
    placeholder: String,
    required:  Boolean,                                                 // 是否显示必填
    disabled:  Boolean,                                                 // 是否可操作
    clearable: Boolean,                                                 // 是否显示可清除图标
    border:     { type: Boolean, default: true },                       // 是否显示边框
    borderColor:{ type: String,  default: $_theme.border_color_light },
    radius:     { type: String,  default: $_theme.input_radius},        // 边框圆角
    height:     { type: Number,  default: $_theme.inputHeight },        // 高度数值，单位是px
    labelMaxWidth:{ type: Number},  		  		  // lable宽度最小数值，单位是px
    labelMinWidth:{ type: Number},
    searchKey:{ typeof:String, default: null },
    showIcon:{ type: Boolean, default: true },                          //是否显示图标
    fontColor: { type: String, default: '#232323' },                    //除弹出框，所有字体的颜色
    inputStyle:   { default: null },                                    // 输入框的style
    dropdownInsertDom:  { default: null },                              //dropdown弹出框插入到指定dom，解决父元素有设置transform而产生错位
  },
  _format: null,
  data() {
    return {
      values: { year: null,  month: null,  day: null,  hour: null,  minute: null,  second: null  },
      needs:  { year: false, month: false, day: false, hour: false, minute: false, second: false },
      yearStep: 0,
      popup: null,
      nows: null,
      days: [],
      dropdownStyle: {zIndex:0, left:0, top:0, borderColor:$_theme.color},
      focused: false,
      hover: false,
    };
  },
  watch: {
    focused: function(v) {
      document[v?'addEventListener':'removeEventListener']('click', this.checkFocus);
      !v && (this.popup = null);
    },
    popup: function(v) {
      if (!v) return this.hover = false;
      this.focused = true;
      v == 'day' && this.resetDays();
      v == 'all' && !this.value && this.setValue(getNowDateTime());
      v == 'all' && this.needs.day && this.resetDays();
    },
    value: function(v) {
      v ? this.setValue(v, false) : this.clear(false);
    },
    type: function(v) {
      this.typeChg(v);
      this.value && this.setValue(this.value, true);
    }
  },
  beforeDestroy() {
    if(this.dropdownInsertDom && this.$refs.dropdown){
      dropdownInsertDom.removeChild(this.$refs.dropdown);
    }
  },
  mounted() {
    this.typeChg(this.type);
    this.value && this.setValue(this.value, false);
  },

  methods: {
    typeChg(v) {
      this.needs.year   = v.indexOf('Y') > -1;
      this.needs.month  = v.indexOf('M') > -1;
      this.needs.day    = v.indexOf('D') > -1;
      this.needs.hour   = v.indexOf('H') > -1;
      this.needs.minute = v.indexOf('N') > -1;
      this.needs.second = v.indexOf('S') > -1;

      this._format = this.needs.year ? 'YYYY' : '';
      this.needs.month  && (this._format += 'MM');
      this.needs.day    && (this._format += 'DD');
      this.needs.hour   && (this._format += 'HH');
      this.needs.minute && (this._format += 'NN');
      this.needs.second && (this._format += 'SS');
      this._format = this._format.replace('YM','Y-M').replace('MD','M-D').replace('DH','D H').replace('HN','H:N').replace('NS','N:S');
    },
    checkFocus(event) {
      if(this.$refs.dropdown && this.$refs.dropdown.contains(event.target)){ //解决如果设置dropdownInsertDom，而dropdownInsertDom在该组件外部，选择年份什么的不会自动显示下一个
        this.focused = true;
      }else{
        this.focused = this.$el.contains(event.target);
      }
    },
    resetDays() {
      if (!this.needs.day) return;
      let max = getDays(Number(this.values.year||this.nows[0]), Number(this.values.month||this.nows[1]));
      if (Number(this.values.day) > max) {
        this.values.day = max;
        this.submit();
      }
      let days = [], week = new Date(Number(this.values.year||this.nows[0]), Number(this.values.month||this.nows[1])-1, 1).getDay();
      while (days.length % 7 < week) {
        days.push(null);
      }
      for (let i=0; i<max; i++) {
        days.push(i+1);
      }
      this.days = days;
    },
    onAllChg(field) {
      this.submit();
      (field == 'year' || field == 'month') && this.resetDays();
      field == 'day' && !this.needs.hour && !this.needs.minute && !this.needs.second && (this.popup = null);
    },
    allArrowClick(field, step) {
      let v = this.values[field] + step;
      if (field == 'year') {
        this.values[field] = v;
      } else {
        if (v < 1) {
          this.values.year -= 1;
          this.values.month = 12;
        } else if (v > 12) {
          this.values.year += 1;
          this.values.month = 1;
        } else {
          this.values.month = v;
        }
      }
      this.submit();
      this.resetDays();
    },
    setShowDropdown(item) {
      if (this.popup == item) {
        this.popup = null;
        return;
      }
      this.resetNows();
      this.popup = item;
      this.$nextTick(this.setDropdownStyle);
    },
    setDropdownStyle() {
      this.dropdownStyle.zIndex = $_theme.zindex();
      let w = this.$el.children[this.$el.children.length-1];
      let dt = this.$refs.datatime, {left, top} = domLeftTop(dt);
      this.dropdownStyle.left = left + 'px';
      if (top + w.clientHeight + dt.clientHeight < document.documentElement.clientHeight) {
        this.dropdownStyle.top = (top + dt.offsetHeight) + 'px';
      } else {
        this.dropdownStyle.top = (top - w.offsetHeight) + 'px';
      }
      if(this.dropdownInsertDom){
        this.dropdownInsertDom.appendChild(this.$refs.dropdown); //之前一般情况下没问题，但是fixed定位如遇到父元素有设置transform而降为absolute，需单独拎出放在body下
      }
    },
    setValueClick(value, field, next) {
      this.values[field] = value;
      this.submit();
      (!next || !this.needs[next]) && (this.popup = null);
      next && this.needs[next] && (this.popup = next) && this.$nextTick(this.setDropdownStyle);
    },
    setValue(value, emit=true) {
      this.resetNows();
      let ymd_hns = value.split(' ');
      if (this.needs.year || this.needs.month || this.needs.day) {
        let ymd = ymd_hns[0].split('-'), i = 0;
        this.needs.year  && (this.values.year  = Number(ymd.length>i ? (ymd[i++]||this.nows[0]) : this.nows[0]));
        this.needs.month && (this.values.month = Number(ymd.length>i ? (ymd[i++]||this.nows[1]) : this.nows[1]));
        this.needs.day   && (this.values.day   = Number(ymd.length>i ? (ymd[i++]||this.nows[2]) : this.nows[2]));
      }
      if (this.needs.hour || this.needs.minute || this.needs.second) {
        let hns = ymd_hns[ymd_hns.length-1].split(':'), j = 0;
        this.needs.hour   && (this.values.hour   = Number(hns.length>j ? (hns[j++]||this.nows[3]) : this.nows[3]));
        this.needs.minute && (this.values.minute = Number(hns.length>j ? (hns[j++]||this.nows[4]) : this.nows[4]));
        this.needs.second && (this.values.second = Number(hns.length>j ? (hns[j++]||this.nows[5]) : this.nows[5]));
      }
      emit && this.submit();
      this.searchKey&&storage.set(this.searchKey,value);
    },
    quickDate(i) {
      let ymdhns = addDateTime(i).split(/[-| |:]/);
      this.needs.year && (this.values.year  = Number(ymdhns[0]));
      this.needs.month && (this.values.month  = Number(ymdhns[1]));
      this.needs.day && (this.values.day  = Number(ymdhns[2]));
      this.submit();
      this.resetDays();
    },
    quickTime(v) {
      let hns = null;
      if (v == 'now') {
        let date = new Date();
        hns = [date.getHours(), date.getMinutes(), date.getSeconds()];
      } else {
        hns = v == '00' ? [0,0,0] : (v == '12' ? [12,0,0] : [23,59,59]);
      }
      this.needs.hour && (this.values.hour  = hns[0]);
      this.needs.minute && (this.values.minute  = hns[1]);
      this.needs.second && (this.values.second  = hns[2]);
      this.submit();
    },
    resetNows() {
      let nows = getNowDateTime().split(/[-| |:]/);
      for (let i=0,len=nows.legnth; i<len; i++) {
        nows[i] = Number(nows[i]);
      }
      this.nows = nows;
    },
    fillzero(v) {
      return v === null ? '' : (v > 9 || this.type == 'D') ? v : ('0' + v);
    },
    submit() {
      let value = this._format;
      this.needs.year   && (value = value.replace('YYYY', this.values.year));
      this.needs.month  && (value = value.replace('MM',   this.fillzero(this.values.month)));
      this.needs.day    && (value = value.replace('DD',   this.fillzero(this.values.day)));
      this.needs.hour   && (value = value.replace('HH',   this.fillzero(this.values.hour)));
      this.needs.minute && (value = value.replace('NN',   this.fillzero(this.values.minute)));
      this.needs.second && (value = value.replace('SS',   this.fillzero(this.values.second)));
      if (this.value != value) {
        this.$emit('input',  value);
        this.$emit('change', value);
      }
    },
    clear(emit=true) {
      this.values.year = this.values.month = this.values.day = this.values.hour = this.values.minute = this.values.second = null;
      this.popup = null;
      if (emit) {
        this.$emit('input', null);
        this.$emit('change', null);
      }
      this.searchKey&&storage.remove(this.searchKey);
    }
  },
  computed: {
    containerStyle() {
      return {
        borderRadius: this.radius,
        height: this.height + 'px',
        borderColor: this.focused ? this.theme.color : this.borderColor,
        zIndex: this.focused ? this.theme.zindex() : ''
      }
    },
    lineHeight() {// 获取除边框外的高度
      return this.height - (this.border ? 2 : 0);
    },
    textMinWidth() {
      let w = 0;
      this.needs.year   && (w += 28.92);
      this.needs.month  && this.needs.year && (w += 4.34);
      this.needs.month  && (w += 14.47);
      this.needs.day    && this.needs.month && (w += 4.34);
      this.needs.day    && (w += 14.47);
      if (w) return w + 16;
      this.needs.hour   && this.needs.day && (w += 7.23);
      this.needs.hour   && (w += 14.47);
      this.needs.minute && this.needs.hour && (w += 3.63);
      this.needs.minute && (w += 14.47);
      this.needs.second && this.needs.minute && (w += 3.63);
      this.needs.second && (w += 14.47);
      return w + 16;
    },
    labelStyle() {
      return {
        minWidth:this.labelMinWidth + 'px',
        maxWidth:this.labelMaxWidth + 'px',
        borderRightColor: this.theme.border_color_light,
        backgroundColor: this.theme.input_label_bg_color,
        color: this.fontColor,
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
  display: inline-block;
  white-space: nowrap;
  background-color: #fff;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}
.container > *:not(.dropdown) {
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
/* 日期时间容器 */
.datatime {
  padding: 0 8px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}
.datatime > * {
  text-align: center;
  float: left;
}
.text {
  white-space: nowrap;
  cursor: pointer;
}
.text:hover {
  text-decoration: underline;
}
.clear {
  float: right;
  width: 18px;
  line-height: 0;
  font-size: 16px;
  cursor: pointer;
  /* padding-right: 5px; */
  margin-left: -5px;
}
/* 必填 */
.required {
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
.daydisplay{
  background-color: rgba(255, 255, 255, 0.6);
  opacity: 0.6;
  filter: alpha(opacity=60);
  cursor: not-allowed!important;
}
.dropdown {
  position: fixed;
  padding: 5px;
  margin: 0;
  background-color: #fff;
  border-width: 1px;
  border-style: solid;
  overflow: visible!important;
  box-shadow: 0px 0px 5px 0px RGBA(0, 0, 0, 0.2);
  white-space: nowrap;
}
.dropdown span:first-child {
  line-height: 22px;
  margin: -5px -5px 5px -5px;
  float: left;
  text-align: center;
  color: #fff;
}
.drop_item {
  line-height: 26px;
  float: left;
  text-align: center;
  cursor: pointer;
}
.drop_item:hover {
  background-color: var(--list_hover_color);
}
.arrow {
  cursor: pointer;
  font-size: 18px;
}
.arrow:hover {
  font-weight: bold;
}
.quickbtn {
  padding: 0 2px;
}
.quickbtn:hover {
  font-weight: bold;
}
</style>
