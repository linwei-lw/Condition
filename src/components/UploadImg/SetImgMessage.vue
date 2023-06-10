<template>
  <Window :width="400" ref="w" :title="$_L.get('图片信息')">
    <div :class="$style.content">
        <InputText  :label="$_L.get('图片名称')" v-model="Img.name"/>
        <InputSelect :label="$_L.get('图片分辨率')"  :options="datas" v-model="Img.ratio"/>
    </div>
    <template slot="footer">
      <Button style="margin:8px 4px;width:100px;" @click="$refs.w.close()">{{$_L.get('关闭')}}</Button>
      <Button style="margin:8px 4px;width:100px;" type="primary" @click="submit()">{{$_L.get('保存')}}</Button>
    </template>
  </Window>
</template>

<script>

export default {
  data: function () {
    return {
      Img: {ratio:4},
      datas:[{label:'352*288',value:'01'},{label:'704*288',value:'02'},{label:'704*576',value:'03'},
        {label:'640*480',value:'04'},{label:'1280*720',value:'05'},{label:'1920*1080',value:'06'}],
      callback:null
    };
  },

  created() {
    this.Img.ratio?this.Img.ratio:this.Img.ratio='04'
  },

  methods: {
      submit(){
        this.callback(this.Img);
        this.$refs.w.close();

      }
  },
};
</script>

<style module>
.content {
  width: 100%;
  height: 100%;
  padding: 5px 0 0 5px;
}
.content > * {
  margin: 0 5px 5px 0;
  width: calc(100% - 5px);
  float: left;
}
</style>