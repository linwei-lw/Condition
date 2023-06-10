<template>
  <Window ref="w" :title="$_L.get('工况规则维护')" :width="1000" :waiting="waiting">
    <div :class="$style.content">
      <InputText :label="$_L.get('工况名称')" trim v-model="item.name" required style="width:100%;"/>
<!--      <InputTree :label="$_L.get('车辆')" v-model="cars" :getTreeRoots="getTreeRoots" hasOwnField="carId" :setting="{view:{iconCssFunction:iconCssFunction}}" required style="width:calc(50% - 2.5px);float:right"/>-->
<!--      <InputText :label="$_L.get('所在地区')" readonly trim v-model="item.area" style="width:calc(50% - 2.5px);float:right;" required/>-->
<!--      <InputSelect :label="$_L.get('所在地区')" trim :options="areas" labelField="name" valueField="name" v-model="item.area" style="width:calc(50% - 2.5px);float:right;" required/>-->

      <InputText :label="$_L.get('描述')" trim v-model="item.des"  style="width:100%;margin-top: 5px"/>
      <vxe-table ref="grid" :data="regions" style="border:1px solid;margin-top:5px;height:300px;" :style="{borderColor:theme.border_color_light}">
        <vxe-table-column type="index"      :title="$_L.get('序号')"    width="50"/>
        <vxe-table-column field="type"      :title="$_L.get('区域')" width="240" align="left">
          <template v-slot="{ row }">
              <InputTree v-model="row.regionId" :getTreeRoots="getTreeRoots2" :setting="{type:'all',callback:{beforeClick:o=>o.type!='0'&&o.pid!='0'},view:{iconCssFunction:iconCssFunction1}}" style="margin:5px -5px;width:calc(100% + 10px);"/>
          </template>
        </vxe-table-column>
        <vxe-table-column field="target"    :title="$_L.get('速度')">
          <template v-slot="{ row }">
           <InputText v-model="row.speed" :reg="/\D/g" style="margin:5px -5px;width:calc(100% + 10px);" />
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('里程')">
          <template v-slot="{ row }">
            <InputText v-model="row.mile" :reg="/\D/g" style="margin:5px -5px;width:calc(100% + 10px);" />
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('转速')">
          <template v-slot="{ row }">
            <InputText v-model="row.rev" :reg="/\D/g" style="margin:5px -5px;width:calc(100% + 10px);" />
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('档位')">
          <template v-slot="{ row }">
            <InputText v-model="row.gear" :reg="/\D/g" style="margin:5px -5px;width:calc(100% + 10px);" />
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('油门开合度')">
          <template v-slot="{ row }">
            <InputText v-model="row.appPid" :reg="/\D/g" style="margin:5px -5px;width:calc(100% + 10px);" />
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   width="40">
          <template v-slot="{ row, rowIndex }">
              <i @click="regions.splice(rowIndex,1)" class="el-icon-close" style="margin:5px 0;font-size:16px;height:32px;cursor:pointer;padding-top:8px;"/>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>

    <template slot="footer">
      <div style="position:absolute;">
        <Button style="margin:8px" @click="addAiItemClick()" icon="el-icon-plus">{{$_L.get('添加区域')}}</Button>
      </div>
      <Button style="margin:8px 4px;min-width:80px;" @click="$refs.w.close()">{{$_L.get('取消')}}</Button>
      <Button style="margin:8px 4px;min-width:80px;" @click="submit()" type="primary">{{$_L.get('确定')}}</Button>
    </template>
  </Window>
</template>

<script>
import { arrayToTree }                              from '@/common/util/Trees.js';
export default {
  data: function() {
    return {
      waiting:false,
      item: {
        name:null,
        cars:[],
        area:null,
        des:null,
        regions:[],
        auser:$_main.userId,
      },
      cars:[],
      regions:[],
      callback: null,
    };
  },
  mounted() {
    if(this.item.id){
      this.regions=JSON.parse(this.item.regions)
    }
  },
  methods:{
    iconCssFunction(node, open) {
      return !node.carId ? (open ? 'ico_open' : 'ico_close') : null;
    },
    iconCssFunction1(node, open) {
      return node.type=='0' ? (open ? 'ico_open' : 'ico_close') : null;
    },
    getTreeRoots(callback){
      $_main.http.get('data/getCars',{ sessionId: $_main.sessionId }).then(result=>{
        result.carList.forEach(el=>{
          el.id=el.carId;
          el.pid=el.teamId;
          el.name=el.carName
        })
        result.teamList.forEach(el=>{
          el.id=el.teamId;
          el.name=el.teamName
        })
        let root={id:'0',name:$_L.get('所有车辆'),children:[]}
        let children= arrayToTree(result.teamList.concat(result.carList))
        children.forEach(node => node.parent = root);
        root.children=children
        callback(root);
      })

    },
    getTreeRoots1(callback){
      $_main.http.get('data/getPois',{ sessionId: $_main.sessionId }).then(result=>{
        let root={id:'0',name:$_L.get('所有标注'),children:[]}
        let children= arrayToTree(result)
        children.forEach(node => node.parent = root);
        root.children=children
        callback(root);
      })

    },
    getTreeRoots2(callback){
      $_main.http.get('data/getRegions',{ sessionId: $_main.sessionId }).then(result=>{
        let root={id:'0',name:$_L.get('所有区域'),children:[]}
        let children= arrayToTree(result)
        children.forEach(node => node.parent = root);
        root.children=children
        callback(root);
      })

    },

    addAiItemClick() {
      this.regions.push({regionId:null,speed:null,mile:null,rev:null,gear:null,appPid:null});
    },

    submit() {
      if (!this.item.name) return $_alert.warn($_L.get('请输入工况名称！'));
      // if(!this.item.area)return $_alert.warn($_L.get('请填写所在地区！'));
      if(!this.regions||this.regions.length==0)return $_alert.warn($_L.get('请添加标注，标注不能小于1个！'));
      for (let k in this.regions){
        if(!this.regions[k].regionId)return $_alert.warn($_L.get('请选择标注点！'));
      }
      let isadd=this.item.id?false:true;
      let url=this.item.id?'rule/update':'rule/add'
      // this.item.cars=this.cars.toString()
      this.item.regions=JSON.stringify(this.regions)
      $_main.http.post(url,this.item).then(result => {
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
