<template>
  <Window  style="min-width:800px;" id="w"  :title="$_L.get(ImgSrc.name)||$_L.get(ImgSrc.note)">
    <div :class="$style.content" ref="content" id="content" @mousewheel="rollImg()" :style="'max-height:'+(imgMaxHeight-top)+'px;'">
      <img :src="ImgSrc.src" :class="$style.img" ref="img" id="img" :style="'height:'+height+'px;max-height:'+imgMaxHeight+'px;margin:'+margin+'px '+(-margin)+'px'" >
    </div>
  </Window>
</template>

<script>
export default {
  data: function () {
    return {
      ImgSrc: null,
      rotateTimes: 0,
      imgMaxHeight: 800,
      margin: 0,
      top: 0,
      height:0
    };
  },
  created() {
    this.imgMaxHeight = document.body.clientHeight - 85.5 - 87;
    let _this =this;
    let img =new Image();
    img.src=_this.ImgSrc.src;
    img.onload=function () {
      if(img.height>_this.imgMaxHeight||img.height>400){
        _this.height=400;
      }else{
        _this.height=img.height;
      }
    }    
  },
  methods:{
    rollImg(){
      var zoom = parseInt(this.$refs.img.style.zoom) || 100;
      zoom += event.wheelDelta / 12;
      /* 最小范围 和 最大范围 的图片缩放尺度 */
      let top = parseInt(this.$el.style.top.replace('px',''));
      if (zoom >= 35 && zoom*this.$refs.img.height/100 < (this.imgMaxHeight-top)) {
        this.$refs.img.style.zoom = zoom + "%";
      }
      return false;
 
    },
  }
};
</script>

<style module>
  .content {
    width: 100%;
    height: 100%;
    min-height: 400px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }
  .img{
    margin: auto;
    position: relative;
  }

</style>