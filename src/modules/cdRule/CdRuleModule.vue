<template>
  <div :class="$style.container">
    <div style="width:20%;border:1px solid #AEBAC5;background:#fff;">
      <Button style="width:100%" type="primary" >{{$_L.get('场地')}}</Button>
      <div style="height:calc(100% - 74px);overflow: auto;width: 100%;background-color: #fff;">
        <ul :class="$style.left_ul" >
          <li v-for="(item,index) in place" :key="index" >
            <div :style="!item.children&&cmpIndex.id==item.id&&{backgroundColor:theme.selected_color}" style="margin:0" @click="click(item)" >
              <span :class="!item.children&&cmpIndex.id==item.id&&$style.indexbgc" :style="{backgroundColor:theme.color}"></span>
             {{item.name}}
              <img :src="require('@/assets/main/zhankai.png')" alt="" :class="[item.isopen&&item.children&&$style.isopen||$style.isclose]" v-show="item.children">
            </div>
            <div style="margin:0;padding:0" v-show="item.isopen">
              <div v-for="(item1,index1) in item.children" :key="index1" >
                <li :class="item1.children&&$style.layers" :style="[(cmpIndex.id==item1.id||item1.children)&&{backgroundColor:theme.selected_color},{paddingLeft:item1.children?'40px':'60px'}]" @click="click(item1)">
                  <span :class="cmpIndex.id==item1.id&&$style.indexbgc" :style="{backgroundColor:theme.color}"></span> {{item1.name}}
                </li>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div style="padding:5px;display: flex;border-top:1px solid #ccc;">
        <Button icon="el-icon-plus" style="margin-right:6px;flex: 1" type="primary"  @click="addDirClick()" >{{$_L.get('新增')}}</Button>
        <Button icon="el-icon-edit" style="margin-right:6px;flex: 1" type="primary"  @click="updDirClick()" :disabled="!cmpIndex.id">{{$_L.get('修改')}}</Button>
        <Button icon="el-icon-minus" style="flex: 1" type="primary" @click="delDirClick()" :disabled="!cmpIndex.id">{{$_L.get('删除')}}</Button>
      </div>
    </div>
    <div style="width:calc(80% - 5px);margin-left:5px;display: flex;flex-flow:column;">
      <div >
        <Toolbar>
          <div slot="right">
            <Button icon="el-icon-plus" style="margin-right:6px;" type="primary"  @click="addClick()" :disabled="!cmpIndex.id||(!place||place.length==0)">{{$_L.get('新增')}}</Button>
            <Button icon="el-icon-edit" style="margin-right:6px;" type="primary"  @click="updClick()" :disabled="!selectedItem">{{$_L.get('修改')}}</Button>
            <Button icon="el-icon-minus" style="margin-right:6px;" type="primary" @click="delClick()" :disabled="!selectedItem">{{$_L.get('删除')}}</Button>
          </div>
        </Toolbar>
      </div>
      <div style="flex-shrink:1;height:100%;position:relative">
        <vxe-table :data="datas" :loading="!datas" ref="grid" style="border:1px solid #AEBAC5;border-top:0;position:absolute;left:0;top:0;right:0;bottom:0;" @cell-click="({row})=>selectedItem=row">
          <vxe-table-column type="index" :title="$_L.get('序号')" width="50px" />
          <vxe-table-column field="name" :title="$_L.get('工况名称')"/>
          <vxe-table-column field="state" :title="$_L.get('状态')" :formatter="({cellValue})=>cellValue=='1'?$_L.get('正常'):$_L.get('关闭')"/>
          <vxe-table-column field="des" :title="$_L.get('描述')" />
          <vxe-table-column field="atime" :title="$_L.get('创建时间')" />
          <vxe-table-column field="auser" :title="$_L.get('创建用户')" />
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script>
import AiAddOrUpdateWindow      from './AiAddOrUpdateWindow.vue';
import DirAddOrUpdateWindow     from './DirAddOrUpdateWindow.vue';
import { arrayRemoveItem }      from '@/common/util/Arrays.js';
import { arrayToMap }           from '@/common/util/Arrays.js';
import { objClone, objCopyTo }  from '@/common/util/Objects.js';

export default {
  data () {
    return {
      areas:[{name:'黑龙江省'},{name:'辽宁省'},{name:'吉林省'},{name:'河北省'},{name:'河南省'},{name:'湖北省'},{name:'湖南省'},
        {name:'山东省'},{name:'山西省'},{name:'陕西省'},{name:'安徽省'},{name:'浙江省'},{name:'江苏省'},{name:'福建省'},{name:'广东省'},
        {name:'海南省'},{name:'四川省'},{name:'云南省'},{name:'贵州省'},{name:'青海省'},{name:'甘肃省'},{name:'江西省'},{name:'台湾省'},
        {name:'内蒙古自治区'},{name:'宁夏回族自治区'},{name:'新疆维吾尔自治区'},{name:'西藏自治区'},{name:'广西壮族自治区'},
        {name:'北京市'},{name:'上海市'},{name:'天津市'},{name:'重庆市'},{name:'香港特别行政区'},{name:'澳门特别行政区'}],
      datas: [],
      list:[],
      place:[],
      cmpIndex:{id:null},
      selected:null,
      selectedItem:null,
      index:0
    }
  },

  created(){
  },
  mounted() {
    $_main.http.get('rule/get',{ sessionId: $_main.sessionId,userId:$_main.userId }).then(result=>{
      this.list=result;
    })
    this.getPlace()
  },
  methods: {
    getPlace(){
      $_main.http.get('place/get',{ sessionId: $_main.sessionId,userId:$_main.userId }).then(result=>{
        let areas=this.areas.filter(el=>result.some(item=>item.area==el.name))||[],place=[]
        areas.forEach(el=>{
          el.isopen=false
          el.children=[];
          result.forEach(item=>{
            if(el.name==item.area){
              el.children.push(item)
            }
          })
          place.push(el)
        })
        this.place=place;
      })
    },

    addClick(){
      let item={name:null,cars:[],area:this.cmpIndex.area,des:null,regions:[],auser:$_main.userId,placeId:this.cmpIndex.id}
      $_popup.open(AiAddOrUpdateWindow, {item:item,callback:this.addOrUpdateCallback});
    },
    updClick(){
      $_popup.open(AiAddOrUpdateWindow, {item:objClone(this.selectedItem),callback:this.addOrUpdateCallback});
    },
    addOrUpdateCallback(result,isddd){
      if(isddd){
        this.datas.push(result)
        this.list.push(result)
      }else{
        objCopyTo(result, this.selectedItem);
      }
    },
    delClick(){
      $_alert.comfirm($_L.get('你确定要删除吗？'), yes => {
        if (!yes) return;
        $_main.http.get('rule/delete', {id:this.selectedItem.id}).then(e => {
          arrayRemoveItem(this.datas, this.selectedItem);
          arrayRemoveItem(this.list, this.selectedItem);
          this.selectedItem=null;
          $_alert.success($_L.get('删除成功'));
        });
      }, this.$el);
    },
    addDirClick(){
      $_popup.open(DirAddOrUpdateWindow, {areas:this.areas,callback:this.addOrUpdateDirCallback});
    },
    updDirClick(){
      $_popup.open(DirAddOrUpdateWindow, {areas:this.areas,item:objClone(this.selected),callback:this.addOrUpdateDirCallback});
    },
    addOrUpdateDirCallback(result,isddd){
      if(isddd){
        let place=arrayToMap(this.place,'name')
        if(place[result.area]){
          place[result.area].children.push(result)
          this.$forceUpdate()
        }else{
          this.place.push({name:result.area,isopen:false,children:[result]})
        }
      }else{
        objCopyTo(result, this.selected);
      }
    },
    delDirClick(){
      if(this.datas&&this.datas.length!=0)return $_alert.warn($_L.get('该场地下有工况，请先删除工况？'))
      $_alert.comfirm($_L.get('你确定要删除吗？'), yes => {
        if (!yes) return;
        $_main.http.get('place/delete', {id:this.selected.id}).then(e => {
          let obj
          this.place.forEach(el=>{
            if(el.name==this.selected.area){
              arrayRemoveItem(el.children, this.selected);
              if(el.children==0){obj=el}
            }
          })
          if(obj){arrayRemoveItem(this.place, obj);}
          this.selected=null;
          this.cmpIndex={id:null}
          $_alert.success($_L.get('删除成功'));
        });
      }, this.$el);
    },
    click(item){
      this.index++
      if(!item.children){
        this.cmpIndex=item;
        this.datas=this.list.filter(el=>el.placeId==item.id)
      }else{
        item.isopen=!item.isopen;

      }
      this.$forceUpdate()
      this.selected=item;
    },
  }
}
</script>

<style module>
.container{
  width: 100%;
  height: 100%;
  display:flex;

}
.left_ul{
  height: 100%;
  margin: 0;
  padding:0;
  overflow: auto;
}
.left_ul::-webkit-scrollbar {
  width: 0px;
}
.left_ul li{
  cursor: pointer;
  position: relative;
  height: auto;
  line-height: 50px;
  font-size: 14px;
  min-width: 220px;
}
.left_ul li >div{
  padding-left: 20px;
  padding-right: 10px;
}

.left_ul li >div:first-child:hover{
  background-color: rgb(255, 240, 193);
}
.left_ul li img{
  vertical-align:middle;
  display: inline-block;
  padding-right: 5px;
}
.indexbgc{
  position: absolute;
  width: 5px;
  height: 50px;
  left: 0;
  top: 0px;
  z-index: 2;
}
.isopen{
  max-width:20px;
  float:right;
  margin-top:25px;
}
.isclose{
  max-width:20px;
  float:right;
  margin-top:25px;
  transform:rotate(90deg);
}
.layers{
  opacity: 0.5;
  color: #000;
}
</style>
