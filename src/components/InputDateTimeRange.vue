
<template>
  <div :class="[$style.container, border && $style.border]" :style="containerStyle" tabindex="0" @focus="focused=true" @mouseenter="hover=true" @mouseleave="hover=false">

    <!--label显示-->
    <span :class="$style.label" :style="labelStyle" v-if="label" is-label @click="popup=null">{{label}}</span>

    <!--必填显示-->
    <span :class="[$style.required,'el-icon-star-on']" :style="{backgroundColor:theme.input_label_bg_color}" v-if="required" @click="popup=null"></span>

    <!--图标显示-->
    <span :class="needs.year||needs.month||needs.day?'el-icon-date':'el-icon-shiduan'" @click="setShowDropdown('all')" style="float:right;font-size:18px;padding-right:5px;cursor:pointer;"></span>

    <!--clear按钮显示-->
    <i :class="$style.clear" :style="{lineHeight:lineHeight+'px', visibility:(value&&hover)?'visible':'hidden'}" v-if="clearable" class="el-icon-close" @click="clear"></i>
    
    <!--日期时间显示-->
    <div ref="datatime" :style="{minWidth: textMinWidth+'px'}" :class="$style.datatime" @click="setShowDropdown('all')">
        <span v-if="placeholder && !value" style="color:#B0B0B0;"> {{placeholder}} </span>
        
        <span v-if="needs.year" >   {{values[0].year}}   </span>
        <span v-if="needs.month && needs.year" v-show="values[0].month && values[0].year"> - </span>
        <span v-if="needs.month" >  {{fillzero(values[0].month)}}  </span>
        <span v-if="needs.day && needs.month"  v-show="values[0].day && values[0].month"> - </span>
        <span v-if="needs.day"   >    {{fillzero(values[0].day)}}    </span>

        <span v-if="needs.hour && needs.day"> &nbsp;&nbsp; </span>

        <span v-if="needs.hour"  >   {{fillzero(hour)}}   </span>
        <span v-if="needs.minute && needs.hour"   v-show="values[0].minute!==null && values[0].hour!==null"> : </span>
        <span v-if="needs.minute" > {{fillzero(values[0].minute)}} </span>
        <span v-if="needs.second && needs.minute" v-show="values[0].second!==null && values[0].minute!==null"> : </span>
        <span v-if="needs.second" > {{fillzero(values[0].second)}} </span>
        <span style="margin: 0 10px;">至</span>
        <span v-if="needs.year"  >   {{values[1].year}}   </span>
        <span v-if="needs.month && needs.year" v-show="values[1].month && values[1].year"> - </span>
        <span v-if="needs.month" >  {{fillzero(values[1].month)}}  </span>
        <span v-if="needs.day && needs.month"  v-show="values[1].day && values[1].month"> - </span>
        <span v-if="needs.day"   >    {{fillzero(values[1].day)}}    </span>

        <span v-if="needs.hour && needs.day"> &nbsp;&nbsp; </span>

        <span v-if="needs.hour"  >   {{fillzero(hour1)}}   </span>
        <span v-if="needs.minute && needs.hour"   v-show="values[1].minute!==null && values[1].hour!==null"> : </span>
        <span v-if="needs.minute" > {{fillzero(values[1].minute)}} </span>
        <span v-if="needs.second && needs.minute" v-show="values[1].second!==null && values[1].minute!==null"> : </span>
        <span v-if="needs.second" > {{fillzero(values[1].second)}} </span>
    </div>

    <div v-if="disabled" :class="$style.disabled" :style="{borderRadius: radius}"/>

    <!--弹出选择-->
    <div :class="$style.dropdown" :style="[dropdownStyle,theme.popup]" style="padding-bottom:0px" v-if="popup == 'all'">
      <div :class="$style.dateRange">
        <div :class="$style.rangeItem">
          <div v-if="needs.year" :style="{width:needs.month?'calc(50% + 5px)':'calc(100% + 10px)'}" style="display:inline-block;text-align:center;line-height:30px;padding-bottom:5px">
          <i :class="$style.arrow" class="el-icon-arrow-left" @click="allArrowClick('year',-1,0)"></i>
          <span style="position:relative;top:-2px;font-weight:;font-size:14px;">&nbsp;{{values[0].year}}{{$_L.get('年')}}&nbsp;</span>
          <i :class="$style.arrow" class="el-icon-arrow-right" @click="allArrowClick('year',1,0)"></i>
        </div>
        <div v-if="needs.month" :style="{width:needs.year?'calc(50% + 5px)':'calc(100% + 10px)'}" style="display:inline-block;text-align:center;line-height:30px;padding-bottom:5px">
          <i :class="$style.arrow" class="el-icon-arrow-left" @click="allArrowClick('month',-1,0)"></i>
          <span style="position:relative;top:-2px;font-weight:;font-size:14px;">&nbsp;{{values[0].month}}{{$_L.get('月')}}&nbsp;</span>
          <i :class="$style.arrow" class="el-icon-arrow-right" @click="allArrowClick('month',1,0)"></i>
        </div>
        <div v-if="needs.day" style="display:inline-block; padding-bottom:5px;float:left;">
          <span style="width:calc(100% + 10px);padding:0 5px;margin-left:-5px;margin-bottom:5px;color:#fff;" :style="{backgroundColor:theme.color}"> 
            <span v-for="day in [$_L.get('日'),$_L.get('一'),$_L.get('二'),$_L.get('三'),$_L.get('四'),$_L.get('五'),$_L.get('六')]" :key="day" style="width:14.28%;margin:0;float:left;"> 
              {{day}}
            </span>
          </span>
          <span v-for="(day,index) in days" :key="index" @click="day&&(values[0].day=day)&&onAllChg('day')" :class="$style.drop_item" style="width:14.28%;" :style="[day == nows[2] && {fontWeight:'bold', color:'#f00'}, day == values[0].day && {backgroundColor:theme.color,color:'#fff'}, !day && {backgroundColor:'#fff',cursor:'default'}]"> 
            {{day||'&nbsp;'}} 
          </span>
        </div>
        <div style="clear:both;padding:0 10px 5px 10px;" v-if="needs.hour||needs.minute||needs.second">
          <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.hour"   :tooltip="'{}'+$_L.get('时')" :min="0" :max="23" :signs="[0,12,23]" v-model="hour" @change="onAllChg('hour')"/>
          <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.minute" :tooltip="'{}'+$_L.get('分')" :min="0" :max="59" :signs="[0,10,20,30,40,50,59]" v-model="values[0].minute" @change="onAllChg('minute')"/>
          <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.second" :tooltip="'{}'+$_L.get('秒')" :min="0" :max="59" :signs="[0,30,59]" v-model="values[0].second" @change="onAllChg('second')"/>
        </div>
        <div v-if="needs.day||needs.hour" style="clear:both;line-height:30px;text-align:center;border-top-width:1px;border-top-style:solid;border-top-color:#eee;">
          <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(-1,0)"> {{$_L.get('昨天')}} </a>
          <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(0,0)">  {{$_L.get('今天')}} </a>
          <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(1,0)">  {{$_L.get('明天')}} </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('00',0)">  00 </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('12',0)">  12 </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('24',0)">  24 </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('now',0)"> {{$_L.get('现在')}}</a>
        </div>
        </div>
        <div :class="$style.rangeItem">
          <div v-if="needs.year" :style="{width:needs.month?'calc(50% + 5px)':'calc(100% + 10px)'}" style="display:inline-block;text-align:center;line-height:30px;padding-bottom:5px">
          <i :class="$style.arrow" class="el-icon-arrow-left" @click="allArrowClick('year',-1,1)"></i>
          <span style="position:relative;top:-2px;font-weight:;font-size:14px;">&nbsp;{{values[1].year}}{{$_L.get('年')}}&nbsp;</span>
          <i :class="$style.arrow" class="el-icon-arrow-right" @click="allArrowClick('year',1,1)"></i>
        </div>
        <div v-if="needs.month" :style="{width:needs.year?'calc(50% + 5px)':'calc(100% + 10px)'}" style="display:inline-block;text-align:center;line-height:30px;padding-bottom:5px">
          <i :class="$style.arrow" class="el-icon-arrow-left" @click="allArrowClick('month',-1,1)"></i>
          <span style="position:relative;top:-2px;font-weight:;font-size:14px;">&nbsp;{{values[1].month}}{{$_L.get('月')}}&nbsp;</span>
          <i :class="$style.arrow" class="el-icon-arrow-right" @click="allArrowClick('month',1,1)"></i>
        </div>
        <div v-if="needs.day" style="display:inline-block; padding-bottom:5px;float:left;">
          <span style="width:calc(100% + 10px);padding:0 5px;margin-left:-5px;margin-bottom:5px;color:#fff;" :style="{backgroundColor:theme.color}"> 
            <span v-for="day in [$_L.get('日'),$_L.get('一'),$_L.get('二'),$_L.get('三'),$_L.get('四'),$_L.get('五'),$_L.get('六')]" :key="day" style="width:14.28%;margin:0;float:left;"> 
              {{day}}
            </span>
          </span>
          <span v-for="(day,index) in days1" :key="index" @click="day&&(values[1].day=day)&&onAllChg('day')" :class="$style.drop_item" style="width:14.28%;" :style="[day == nows[2] && {fontWeight:'bold', color:'#f00'}, day == values[1].day && {backgroundColor:theme.color,color:'#fff'}, !day && {backgroundColor:'#fff',cursor:'default'}]"> 
            {{day||'&nbsp;'}} 
          </span>
        </div>
        <div style="clear:both;padding:0 10px 5px 10px;" v-if="needs.hour||needs.minute||needs.second">
          <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.hour"   :tooltip="'{}'+$_L.get('时')" :min="0" :max="23" :signs="[0,12,23]" v-model="hour1" @change="onAllChg('hour')" />
          <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.minute" :tooltip="'{}'+$_L.get('分')" :min="0" :max="59" :signs="[0,10,20,30,40,50,59]" v-model="values[1].minute" @change="onAllChg('minute')"/>
          <Slider :showValueBar="false" :valueColor="theme.selected_color" v-if="needs.second" :tooltip="'{}'+$_L.get('秒')" :min="0" :max="59" :signs="[0,30,59]" v-model="values[1].second" @change="onAllChg('second')"/>
        </div>
        <div v-if="needs.day||needs.hour" style="clear:both;line-height:30px;text-align:center;border-top-width:1px;border-top-style:solid;border-top-color:#eee;">
          <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(-1,1)"> {{$_L.get('昨天')}} </a>
          <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(0,1)">  {{$_L.get('今天')}} </a>
          <a :class="$style.quickbtn" v-if="needs.day"  @click="quickDate(1,1)">  {{$_L.get('明天')}} </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('00',1)">  00 </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('12',1)">  12 </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('24',1)">  24 </a>
          <a :class="$style.quickbtn" v-if="needs.hour" @click="quickTime('now',1)"> {{$_L.get('现在')}}</a>
        </div>
        </div>
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
  
  export default {
    name: "InputDateTimeRange",
    props: {
      label: String,                                                      // 标题文本
      value: Array,                                                      // 当前值(v-model)
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
    },
    _format: null,
    data() {
      return {
        values: [{ year: null,  month: null,  day: null,  hour: null,  minute: null,  second: null  },{ year: null,  month: null,  day: null,  hour: null,  minute: null,  second: null  }],
        needs:  { year: false, month: false, day: false, hour: false, minute: false, second: false },
        yearStep: 0,
        popup: null,
        nows: null,
        days: [],
        days1: [],
        dropdownStyle: {zIndex:0, left:0, top:0, borderColor:$_theme.color},
        focused: false,
        hover: false,
        hour: '',
        hour1: ''
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
        v == 'all' && !this.value && this.setValue([getNowDateTime(),getNowDateTime()]);
        v == 'all' && this.needs.day && this.resetDays(0);
        v == 'all' && this.needs.day && this.resetDays(1);
      },
      value: function(v) {
        v ? this.setValue(v, false) : this.clear(false);
      },
      type: function(v) {
        this.typeChg(v);
        // this.value && this.setValue(this.value, true);
      },
      hour (val) {
        this.values[0].hour = val
      },
      hour1 (val) {
        this.values[1].hour = val
      }
    },

    mounted() {
      this.typeChg(this.type);
      if (this.value[0]) {
        this.setValue(this.value, false);
      } else {
        this.setValue([getNowDateTime(),getNowDateTime()], false);
      }
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
        this.focused = this.$el.contains(event.target);
      },
      resetDays(index) {
        if (!this.needs.day) return;
        let max = getDays(Number(this.values[index].year||this.nows[0]), Number(this.values[index].month||this.nows[1]));
        if (Number(this.values[index].day) > max) {
          this.values[index].day = max;
          this.submit();
        }
        let days = [], week = new Date(Number(this.values[index].year||this.nows[0]), Number(this.values[index].month||this.nows[1])-1, 1).getDay();
        while (days.length % 7 < week) {
          days.push(null);
        }
        for (let i=0; i<max; i++) {
          days.push(i+1);
        }
        if (index == 1) {
          this.days1 = days
        }
        if (index == 0) {
          this.days = days
        }
      },
      onAllChg(field) {
        this.submit();
        (field == 'year' || field == 'month') && (this.resetDays(0) && this.resetDays(1));
        field == 'day' && !this.needs.hour && !this.needs.minute && !this.needs.second && (this.popup = null);
      },
      allArrowClick(field, step,index) {
        let v = this.values[index][field] + step;
        if (field == 'year') {
          this.values[index][field] = v;
        } else {
          if (v < 1) {
            this.values[index].year -= 1;
            this.values[index].month = 12;
          } else if (v > 12) {
            this.values[index].year += 1;
            this.values[index].month = 1;
          } else {
            this.values[index].month = v;
          }
        }
        this.submit();
        this.resetDays(index);
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
      },
      setValue(value, emit=true) {
        this.resetNows();
        let ymd_hns = value[0].split(' ');
        let ymd_hns1 = value[1].split(' ');
        if (this.needs.hour || this.needs.minute || this.needs.second) {
          let hns = [], j = 0;
          if (ymd_hns[1]) {
            hns = ymd_hns[1].split(':')
          }
          let hours = Number(hns.length>j ? (hns[j++]||this.nows[3]) : this.nows[3])
          if (!this.value[0]) {
            this.hour = hours
          }
          if (!this.value[1]) {
            this.hour1 = hours
          }
          // this.needs.hour   && (this.hour   = Number(hns.length>j ? (hns[j++]||this.nows[3]) : this.nows[3]));
          // this.needs.minute && (this.values[0].minute = Number(hns.length>j ? (hns[j++]||this.nows[4]) : this.nows[4]));
          // this.needs.second && (this.values[0].second = Number(hns.length>j ? (hns[j++]||this.nows[5]) : this.nows[5]));
        }
        if (this.needs.year || this.needs.month || this.needs.day) {
          let ymd = ymd_hns[0].split('-'), i = 0;
          this.needs.year  && (this.values[0].year  = Number(ymd.length>i ? (ymd[i++]||this.nows[0]) : this.nows[0]));
          this.needs.month && (this.values[0].month = Number(ymd.length>i ? (ymd[i++]||this.nows[1]) : this.nows[1]));
          this.needs.day   && (this.values[0].day   = Number(ymd.length>i ? (ymd[i++]||this.nows[2]) : this.nows[2]));
        }
        if (this.needs.year || this.needs.month || this.needs.day) {
          let ymd = ymd_hns1[0].split('-'), i = 0;
          this.needs.year  && (this.values[1].year  = Number(ymd.length>i ? (ymd[i++]||this.nows[0]) : this.nows[0]));
          this.needs.month && (this.values[1].month = Number(ymd.length>i ? (ymd[i++]||this.nows[1]) : this.nows[1]));
          this.needs.day   && (this.values[1].day   = Number(ymd.length>i ? (ymd[i++]||this.nows[2]) : this.nows[2]));
        }
        // if (this.needs.hour || this.needs.minute || this.needs.second) {
        //   // let hns = ymd_hns1[1][ymd_hns1[1].length-1].split(':'), j = 0;
        //   let hns = [], j = 0;
        //   if (ymd_hns1[1]) {
        //     hns = ymd_hns[1].split(':')
        //   }
        //   console.log(hns)
        //   this.needs.hour   && (this.hour1   = Number(hns.length>j ? (hns[j++]||this.nows[3]) : this.nows[3]));
        //   this.needs.minute && (this.values[1].minute = Number(hns.length>j ? (hns[j++]||this.nows[4]) : this.nows[4]));
        //   this.needs.second && (this.values[1].second = Number(hns.length>j ? (hns[j++]||this.nows[5]) : this.nows[5]));
        // }
        emit && this.submit();
      },
      quickDate(i,index) {
        let ymdhns = addDateTime(i).split(/[-| |:]/);
        this.needs.year && (this.values[index].year  = Number(ymdhns[0]));
        this.needs.month && (this.values[index].month  = Number(ymdhns[1]));
        this.needs.day && (this.values[index].day  = Number(ymdhns[2]));
        this.submit();
        this.resetDays(index);
      },
      quickTime(v,index) {
        let hns = null;
        if (v == 'now') {
          let date = new Date();
          hns = [date.getHours(), date.getMinutes(), date.getSeconds()];
        } else {
          hns = v == '00' ? [0,0,0] : (v == '12' ? [12,0,0] : [23,59,59]);
        }
        if (index == 1) {
          this.needs.hour && (this.hour1 = hns[0]);
        } else {
          this.needs.hour && (this.hour = hns[0]);
        }
        
        this.needs.minute && (this.values[index].minute  = hns[1]);
        this.needs.second && (this.values[index].second  = hns[2]);
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
        return v === null ? '' : ((v < 10 ? '0' : '') + v);
      },
      submit() {
        let value = [this._format,this._format];
        // value = JSON.parse(JSON.stringify(values))
        let start = ''
        let end = ''
        // this.needs.year   && (value[0] = value[0].replace('YYYY', values[0].year));
        // this.needs.month  && (value[0] = value[0].replace('MM',   this.fillzero(values[0].month)));
        // this.needs.day    && (value[0] = value[0].replace('DD',   this.fillzero(values[0].day)));
        // this.needs.hour   && (value[0] = value[0].replace('HH',   this.fillzero(values[0].hour)));
        // this.needs.minute && (value[0] = value[0].replace('NN',   this.fillzero(values[0].minute)));
        // this.needs.second && (value[0] = value[0].replace('SS',   this.fillzero(values[0].second)));
        // this.needs.year   && (value[1] = value[1].replace('YYYY', values[1].year));
        // this.needs.month  && (value[1] = value[1].replace('MM',   this.fillzero(values[1].month)));
        // this.needs.day    && (value[1] = value[1].replace('DD',   this.fillzero(values[1].day)));
        // this.needs.hour   && (value[1] = value[1].replace('HH',   this.fillzero(values[1].hour)));
        // this.needs.minute && (value[1] = value[1].replace('NN',   this.fillzero(values[1].minute)));
        // this.needs.second && (value[1] = value[1].replace('SS',   this.fillzero(values[1].second)));
        start = this.values[0].year+ '-'+ this.fillzero(this.values[0].month) + '-' + this.fillzero(this.values[0].day) + ' ' + this.fillzero(this.hour)
        end = this.values[1].year+ '-'+ this.fillzero(this.values[1].month) + '-' + this.fillzero(this.values[1].day) + ' ' + this.fillzero(this.hour1)
        value = [start,end]
        if (this.value.join() != value.join()) {
          this.$emit('input',  value);
          this.$emit('change', value);
        }
      },
      clear(emit=true) {
        this.values[0].year = this.values[0].month = this.values[0].day = this.values[0].hour = this.values[0].minute = this.values[0].second = null;
        this.values[1].year = this.values[1].month = this.values[1].day = this.values[1].hour = this.values[1].minute = this.values[1].second = null;
        this.popup = null;
        if (emit) {
          this.$emit('input', null);
          this.$emit('change', null);
        }
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
  .dropdown {
    position: fixed;
    padding: 5px;
    margin: 0;
    background-color: #fff;
    border-width: 1px;
    border-style: solid;
    box-shadow: 0px 0px 5px 0px RGBA(0, 0, 0, 0.2);
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
    background-color: #FCF0C1;
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
  .dateRange {
    display: flex;
    align-items: center;
  }
  .rangeItem {
    width: 200px;
  }
</style>
