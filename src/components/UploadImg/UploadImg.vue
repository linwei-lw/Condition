<template>
  <div>
    <div :class="$style.image_wrapper" style="padding:5px 0">
      <div :class="$style.img_wrapper">
        <!-- 图片展示div -->
        <div :class="[$style.item,$style.dis_item]" v-for="(item, index) in imgsback" :key="index" >
          <img :class="$style.dis_image" :src="item.src" alt ref="img"/>
          <div :class="$style.set_btn" :style="{backgroundColor:theme.bg_color,borderColor:theme.border_color_light}" v-if="setBtn" :title="$_L.get('点击设置图片信息')" @click="SetImgMessage(index,item)"><i class="el-icon-setting"></i></div>
          <div :class="$style.span_div" @mouseover="isShowImg(index)" @mouseout="leaveImg" :style="{opacity:isShow&&ImgIndex==index?1:0}">
            <div @click="bigImg(index,item)" :title="$_L.get('点击预览图片')"><i class="el-icon-zoom-in"></i></div>
            <div @click="delimgback(index,item)" v-if="lookOver" :title="$_L.get('点击删除图片')"><i class="el-icon-delete"></i></div>
          </div>
          <div :class="$style.bottom_div" v-if="setBottom">{{setBotname}}</div>
          <div :class="$style.bottom_div" v-if="note" style="background-color:#fff">
            <InputText  style="height:28px;margin-left:-2px;width:calc(100% + 4px);color:#000;" v-model.trim="item.note" :maxlength="50" :required="required" :disabled="item.id&&disabled"/>
          </div>
        </div>
        <!-- 上传图片div -->
        <div :class="[$style.item,$style.upload_icon]" @click="lookOver&&preSelect()" v-if="imgsback.length < fileCount">
          <span :class="$style.look" v-if="!lookOver">{{$_L.get('暂无图片')}}</span>
          <span :class="$style.heng" v-if="lookOver"></span>
          <span :class="$style.su" v-if="lookOver"></span>
          <div :class="$style.bottom_div"  v-if="setBottom&&lookOver">{{setBotname}}</div>
        </div>
      </div>
    </div>
    <div :class="$style.inputer" v-if="imgsback.length < fileCount">
      <input type="file" id="files" @change="fileChangeback($event)" ref="input" multiple="multiple" :accept="fileType"/>
      <label for="files"></label>
    </div>
  </div>
</template>

<script>
import ImgPreview              from "./ImgPreview.vue"
import SetImgMessage           from "./SetImgMessage.vue"
import { objCopyTo }           from "@/common/util/Objects.js";


export default {
  name: "UploadImg",
  props: {
    src: Array,         // image url
    //上传图片数量
    fileCount: {
      type: Number,
      required: false,
      default: 6,
    },
    //上传文件类型
    fileType: {
      type: String,
      required: false,
      default: "image/png,image/jpg,image/jpeg,image/gif",
    },
    //设置上传图片信息
    setBtn:{
      type: Boolean,
      required: false,
      default: false,
    },
    setBottom:{
      type: Boolean,
      required: false,
      default: false,
    },
    note:{
      type: Boolean,
      required: false,
      default: false,
    },
    setBotname:String,
    lookOver:{
      type: Boolean,
      required: false,
      default: true,
    },
    required:{
      type: Boolean,
      default: true,
    },
    disabled:{
      type: Boolean,
      default: false,
    },
    maxSize:{
      typeof:Array,
      default:null
    },
  },
  data() {
    return {
      deleteImg:null,
      imgsback: [], // 图片预览地址
      imgfilesback: [],
      isShow:false,
      ImgIndex:null,
      isdel:false
    };
  },
  mounted() {
    this.$nextTick(() => {this.$nextTick(() => {
        this.src.length!==0&&this.src.map(item=>{this.imgsback.push(item);})
    })});
  },
  methods: {
    preSelect(){
      this.$refs.input.click();
      this.$refs.input.value="";
      // this.isdel=false;
    },
    isShowImg(i){
      this.isShow=true;
      this.ImgIndex=i;
    },
    leaveImg(){
      this.isShow=false;
    },
    /* 图片上传 */
    fileChangeback(event) {
      var _this = this;
      var event = event || window.event;
      var file = event.target.files;
      var leng = file.length;
      var fileType=_this.fileType.split(',');
      if(this.imgsback.length+leng>this.fileCount)return $_alert.warn($_L.get('最多上传{0}张图片!',this.fileCount));
      for (var i = 0; i < leng; i++) {
        let ImgFile=file[i];
        let Type=ImgFile.type.indexOf('/');
        let ImgFormat =ImgFile.name.substring(ImgFile.name.lastIndexOf('.') + 1)||ImgFile.type.slice(Type+1)
        let typeflag=false,newFileType=[];
        fileType.map(item=>{
          if(item.split('/').length>=2){
            newFileType.push(item.split('/')[1]);
            if(item.split('/')[1]==ImgFormat){typeflag=true;}
          }else{
            newFileType.push(item.split('/')[0]);
            if(item.split('/')[0]==ImgFormat){typeflag=true;}
          }
        })
        if(!typeflag)return  $_alert.warn($_L.get('请选择图片,图片的格式为{0}',newFileType.toString()));
        let ImgType=ImgFormat=='jpg'||ImgFormat=='jpeg'?'00':ImgFormat=='png'?'01':'02';
        var reader = new FileReader(); // 使用 FileReader 来获取图片路径及预览效果
        reader.readAsDataURL(file[i]);
        reader.onload = function (e) {
          ImgFile.src = e.target.result;
          var image = new Image();
          image.src=ImgFile.src
          _this.$nextTick(()=>{
            if (_this.maxSize&&_this.maxSize[2]) {
              let size = _this.maxSize[2].toUpperCase();
              size = size.indexOf('M') > 0 ? parseFloat(size.substr(0,size.length-1)) * 1024 * 1024 : parseFloat(size.substr(0,size.length-2)) * 1024;
              if (size&&ImgFile.size > size) return $_alert.warn($_L.get('图片不能大于{0}', _this.maxSize[2].toUpperCase()));
            }
            if(_this.maxSize&&((_this.maxSize[0]&&image.width>_this.maxSize[0])||(_this.maxSize[1]&&image.height>_this.maxSize[1]))){return  $_alert.warn($_L.get('图片尺寸太大!图片最大的大小为{0}px*{1}px',_this.maxSize[0],_this.maxSize[1]))};
            let name= ImgFile.name.length>10?ImgFile.name.slice(0,10):ImgFile.name;
            _this.imgfilesback.push(ImgFile);
            _this.imgsback.push({src:e.target.result,name:name,size:ImgFile.size,type:ImgType,ratio: "04",format:ImgFormat,note:name});
            _this.$emit("uploadImg");
          })
        }
      }
      this.isShow=false;
    },
    //删除图片的方法
    delimgback(i,item) {
      $_alert.comfirm($_L.get('确认要删除选中的图片吗？'), yes => {
        if (!yes) return;
        this.imgsback.splice(i, 1);
        this.imgfilesback.splice(i,1)
        this.isdel=true;
        this.deleteImg=item;
        this.$emit("delImg");
      })
    },
    //预览图片
    bigImg(i,item){
      $_popup.open(ImgPreview, {ImgSrc:item});
    },
    getImg(){
      return this.imgsback;
    },
    getFile() {
      return this.imgfilesback;
    },
    //设置图片信息
    SetImgMessage(i,item){
      let ImgType = item.format=='jpg'||item.format=='jpeg'?'00':item.format=='png'?'01':'02';
      let imgObj={src:item.src,name:item.name,size:item.size,type:ImgType,ratio:item.ratio}
      $_popup.open(SetImgMessage, {Img:imgObj,callback:this.SetImgCallback});
    },
    SetImgCallback(result){
      this.imgsback.map(item=>{
        if(item.src==result.src){
          objCopyTo(result, item);
        }
      })
    }
  },
};
</script>

<style module>
.image_wrapper {
  padding: 5px 10px;
  padding-bottom:0 ;
}
.inputer {
  width: 100px;
  height: 100px;
  display: none;
}
.img_wrapper {
  display: flex;
  flex-direction: row;
  justify-content: left;
  flex-wrap: wrap;
}
.image_wrapper .upload_icon {
  cursor: pointer;
  margin-left: 14px;
  margin-bottom: 10px;
  /* overflow: hidden; */
  width: 150px;
  height: 150px;
  text-align: center;
  border: 1px solid #dbdbdb;
}
.set_btn{
  cursor: pointer;
  position: absolute;
  top: -1px;
  right: -1px;
  width: 25%;
  height: 25%;
  z-index: 9;
  border-radius: 90px 0 0 0;
  transform: rotate(-90deg);
  border: 1px solid;
  border-left: 0;
  border-top: 0;
}
.set_btn i{
  position: absolute;
  top: 35%;
  left: 30%;
  transform: rotate(90deg);
  font-size: 20px;

}
.img_wrapper .item {
  position: relative;
  margin-left: 14px;
  margin-bottom: 10px;
  width: 150px;
  height: 150px;
  text-align: center;
}
.img_wrapper .dis_item{
  height: 150px;
  border: 1px solid #ccc;
  position: relative;
}
.span_div{
  display: flex;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.5);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 1;
}
.span_div div{
  cursor: pointer;
  flex:1;
  width: 50%;
  color: #fff;
  font-size: 30px;
  margin: auto;
}

.img_wrapper .item .dis_image {
  margin: 50%;
  transform: translate(-50%,-50%);
  max-width: 100%;
  max-height: 70px;
}
.image_wrapper .item .delete {
  display: inline-block;
  position: absolute;
  background-color: #dbdbdb;
  width: 20px;
  height: 20px;
  color: #fff;
  font-size: 0.8em;
  border-radius: 50%;
  top: -9px;
  right: -10px;
}

.img_wrapper .item .heng {
  position: absolute;
  display: inline-block;
  width: 30px;
  height: 3px;
  background: #dbdbdb;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.img_wrapper .item .su {
  position: absolute;
  display: inline-block;
  width: 3px;
  height: 30px;
  background: #dbdbdb;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.bottom_div{
  position: absolute;
  bottom: -2px;
  border-bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: rgba(0,0,0,.5);
  color: #fff;
  line-height: 30px;
  z-index: 99;
  border: 1px solid;
  /* bottom: 0; */
}
.look{
  font-size: 20px;
  line-height: 150px;
  color: #ccc;
}
</style>


