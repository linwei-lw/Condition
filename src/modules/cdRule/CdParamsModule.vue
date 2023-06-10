<template>
  <div height="auto" style="background: #fff">
    <div :class="$style.content">
      <div :class="$style.main">
        <div :class="$style.header" :style="{color:theme.color}">{{$_L.get('工况参数设置：')}}</div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel" :label="$_L.get('终端设备标识')" required/>
          <InputText  :class="$style.Input" :maxlength="100" trim v-model="type.tmnKey"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel"  :label="$_L.get('时间')" required/>
          <InputText  :class="$style.Input" :maxlength="100" trim v-model="type.so01"/>

        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel"  :label="$_L.get('经度')" required/>
          <InputText  :class="$style.Input" :maxlength="100"  trim v-model="type.so02"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel" :label="$_L.get('纬度')" required/>
          <InputText  :class="$style.Input" :maxlength="100"  v-model="type.so03"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel" :label="$_L.get('速度')"/>
          <InputText  :class="$style.Input" :maxlength="100"  v-model="type.so04"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel"  :label="$_L.get('里程')"/>
          <InputText  :class="$style.Input" :maxlength="100"  v-model="type.so05"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel"  :label="$_L.get('转速')"/>
          <InputText  :class="$style.Input" :maxlength="100"  v-model="type.so06"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel"  :label="$_L.get('挡位')"/>
          <InputText :class="$style.Input" :maxlength="100" v-model="type.so07"/>
        </div>
        <div :class="$style.main_div">
          <SysLabel :labelMinWidth="100" :class="$style.InputLabel"  :label="$_L.get('油门开合度')"/>
          <InputText :class="$style.Input" :maxlength="100" v-model="type.so08"/>
        </div>
        <div :class="$style.footer">
          <Button @click="submit()" type="primary" radius="4px">{{$_L.get('确认保存')}}</Button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import SysLabel from "./SysLabel.vue"

export default {
  components:{SysLabel},
  data: function() {
    return {
      type:{},
      callback: null,
    };
  },
  created() {
    $_main.http.get('receive/getParameter').then(result=>{
      this.type=result;
    })
  },
  methods: {
    submit() {
      if(!this.type.tmnKey)return $_alert.warn($_L.get("请填写终端设备标识！"), this.$el);
      if(!this.type.so01)return $_alert.warn($_L.get("请选择时间！"), this.$el);
      if(!this.type.so02)return $_alert.warn($_L.get("请填写经度！"), this.$el);
      if(!this.type.so03)return $_alert.warn($_L.get("请填写维度！"), this.$el);
      let obj={}
      for(let k in this.type){
        if(!!this.type[k]){
          obj[k]=this.type[k]
        }
      }

      console.log(this.type,obj,JSON.stringify(obj))
      $_main.http.post('receive/setParameter',JSON.stringify(obj)).then(result=>{
        $_alert.success($_L.get('保存成功'), this.$el);
      })
      // if (!this.cmp.cnName)return $_alert.warn($_L.get("请填写公司名称！"), this.$el);
      // let cfg = this.cmp.cfg&&JSON.parse(this.cmp.cfg)||{LANG:''};
      // cfg.LANG=this.lang.value
      // this.cmp.cfg=JSON.stringify(cfg)
      // $_http.post("/sys/cmp?addOrUpdateCmp",{cmp:this.cmp,pwd:null}).then(result => {
      //   $_alert.success($_L.get('保存成功'));
      // }).catch(error => {
      //   console.log(error);
      // });
    }
  }
};
</script>

<style module>
.content{
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  overflow: auto;
}
.main{
  width: 400px;
  height: auto;
  margin: auto;
}
.main > * {
  margin-bottom: 10px;
  margin-left: 8px;
}
.main_div{
  display: flex;
}

.main .header {
  height: 35px;
  width: 398px;
  line-height: 35px;
  margin-left: 15px;
  font-size: 16px;
}
.footer {
  position: relative;
  width: 398px;
  height: 32px;
  margin:auto;
}
.footer > * {
  position: absolute;
  left: 50%;
  top: 0;
  width: 80px;
}
.InputLabel{
  float:left;
  margin-right: 5px;
  font-size: 14px;
}
.Input{
  width:400px;
  height:40px!important;
  overflow: hidden!important;
}
.required{
  position:absolute ;
  top: 0;
  right: 0;
  color: red;
}
</style>
