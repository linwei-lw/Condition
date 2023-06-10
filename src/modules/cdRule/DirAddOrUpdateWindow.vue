<template>
  <Window ref="w" :width="500" :waiting="waiting">
    <div :class="$style.content">
      <InputSelect :label="$_L.get('地区')" trim :options="areas" labelField="name" valueField="name" v-model="item.area" style="width:100%;float: left" required/>
      <InputText :label="$_L.get('场地名称')" trim v-model="item.name"  style="width:100%;margin-top: 5px" required/>
      <InputRadio :label="$_L.get('状态')" :options="[{label:$_L.get('开启'),value:'1'},{label:$_L.get('关闭'),value:'0'}]" v-model="item.state" style="width:100%;margin-top: 5px"/>
      <InputText :label="$_L.get('描述')" trim v-model="item.des"  style="width:100%;margin-top: 5px"/>

    </div>

    <template slot="footer">

      <Button style="margin:8px 4px;min-width:80px;" @click="$refs.w.close()">{{$_L.get('取消')}}</Button>
      <Button style="margin:8px 4px;min-width:80px;" @click="submit()" type="primary">{{$_L.get('确定')}}</Button>
    </template>
  </Window>
</template>

<script>
export default {
  data: function() {
    return {
      waiting:false,
      item: {
        name:null,
        state:'1',
        area:null,
        des:null,
        auser:$_main.userId,
      },
      areas:null,
      callback: null,
    };
  },
  mounted() {
  },
  methods:{
    submit() {
      if(!this.item.area)return $_alert.warn($_L.get('请选择地区！'));
      if (!this.item.name) return $_alert.warn($_L.get('请输入场地名称！'));
      let isadd=this.item.id?false:true;
      this.waiting=true;
      $_main.http.post('place/addOrUpdate',this.item).then(result => {
        this.waiting = false;
        this.callback(result, isadd);
        $_alert.success(isadd ? $_L.get('新增成功') : $_L.get('修改成功'));
        this.$refs.w.close();
      }).catch(error => {
        this.waiting = false;
      });
    }
  }
};
</script>

<style module>
.content {
  width: 100%;
  padding: 5px;
  overflow: hidden;
  position: relative;
}
.item {
  margin: 0 0 0 -10px;
  padding: 0 10px;
  /* border-bottom: 1px solid #E9EBED; */
  width: calc(100% + 20px);
  min-height: 37px;
}
</style>
