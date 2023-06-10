<template>
  <div :class="$style.container">
    <div >
      <Toolbar :bgc="'#fff'">
        <InputRadio :label="$_L.get('任务状态')" :options="[{label:$_L.get('未执行'),value:0},{label:$_L.get('执行中'),value:1},{label:$_L.get('执行完毕'),value:2}]" v-model="taskState" style="width:300px"/>
        <div v-show="taskState==2" style="display: flex">
          <InputTree :label="$_L.get('车辆')"  valueField="carId" v-model="carId" :getTreeRoots="getTreeRoots" hasOwnField="carId" :setting="{view:{iconCssFunction:iconCssFunction}}" clearable style="width:220px;margin-left: 5px"/>
          <InputTree :label="$_L.get('司机')"  valueField="userId" v-model="driverId" :getTreeRoots="getTreeRoots1" hasOwnField="userId" :setting="{view:{iconCssFunction:iconCssFunction1}}" clearable style="width:220px;margin-left: 5px"/>
          <InputSelect :label="$_L.get('工况')" :options="list" v-model="cdId" labelField="name" valueField="id" style="width:220px;margin-left: 5px" clearable/>
          <InputDateTime :label="$_L.get('开始时间')" v-model="stime" type="YMDHNS" style="margin-left:5px" />
          <InputDateTime :label="$_L.get('结束时间')" v-model="etime" type="YMDHNS" style="margin-left:5px"/>
        </div>

        <Button type="primary" :icon="querying?'el-icon-close':'el-icon-search'" @click="querying?toFinish():search()">{{$_L.get('查询')}}</Button>
        <div slot="right">
          <Button icon="el-icon-plus" style="margin-right:6px;" type="primary"  @click="editClick()">{{$_L.get('分配')}}</Button>
        </div>
      </Toolbar>
    </div>
    <div style="flex-shrink:1;height:100%;position:relative">
      <vxe-table :data="datas" :loading="!datas" ref="grid" style="border:1px solid #AEBAC5;border-top:0;position:absolute;left:0;top:0;right:0;bottom:0;" @cell-click="({row})=>selectedItem=row">
        <vxe-table-column type="index" :title="$_L.get('序号')" width="50px" />
        <vxe-table-column field="taskName" :title="$_L.get('工况名称')"/>
        <vxe-table-column field="taskNum" :title="$_L.get('执行次数')"/>
<!--        <vxe-table-column field="taskState" :title="$_L.get('任务状态')" :formatter="({cellValue})=>cellValue=='1'?$_L.get('执行中'):cellValue=='2'?$_L.get('未执行'):''"/>-->
        <vxe-table-column field="startMile" :title="$_L.get('开始里程')" />
        <vxe-table-column field="endMile" :title="$_L.get('结束里程')" />
        <vxe-table-column field="mile" :title="$_L.get('总里程')" />
        <vxe-table-column field="score" :title="$_L.get('得分')" />
        <vxe-table-column field="des" :title="$_L.get('描述')" />
        <vxe-table-column field="atime" :title="$_L.get('创建时间')" />
        <vxe-table-column field="auser" :title="$_L.get('创建用户')" />
        <vxe-table-column field="auser" :title="$_L.get('扣分详情')" width="100px">
          <template v-slot="{row}">
            <Button @click="ClickBtn(row)" style="width:calc(100% - 40px);padding:0 4px" type="primary" :height="28">{{$_L.get('详情')}}</Button>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>
import EditWindow               from './EditWindow.vue';
import deductedWindow           from './deductedWindow.vue';
import { arrayToMap }           from '@/common/util/Arrays.js';
import { arrayToTree }          from '@/common/util/Trees.js';
import { addDateTime }          from '@/common/util/Dates.js';

export default {
  data () {
    return {
      querying:false,
      datas: [],
      taskState:2,
      selectedItem:null,
      carId:null,
      stime:addDateTime(-1),
      etime: addDateTime(0),
      driverId:null,
      cdId:null,
      list:null
    }
  },

  created(){
  },
  mounted() {
    $_main.http.get('rule/get',{ sessionId: $_main.sessionId,userId:$_main.userId }).then(result=>{
      this.list=result;
    })
    this.search()
  },
  methods: {
    getTreeRoots(callback){
      $_main.http.get('data/getCars',{ sessionId: $_main.sessionId }).then(result=>{
        result.carList.forEach(el=>{el.name=el.carName})
        result.teamList.forEach(el=>{el.name=el.teamName })
        let TEAMS={list:null,map:null,root:{id:'0',name:$_L.get('所有车辆'),children:[]}}
        let CARS={list:null,map:null,root:null,}
        TEAMS.list = result.teamList || [];
        TEAMS.map = arrayToMap(TEAMS.list, "teamId");
        TEAMS.tree = arrayToTree(TEAMS.list, "teamId", "pid", TEAMS.map, TEAMS.root, 'teams');

        CARS.list = result.carList || [];
        CARS.map = arrayToMap(CARS.list, "carId");
        CARS.root = TEAMS.root;
        CARS.root.teams && (CARS.root.children = [...CARS.root.teams]);
        for (let i = 0, len = TEAMS.list.length, team; i < len; i++) {
          team = TEAMS.list[i];
          team.teams && (team.children = [...team.teams]);
        }
        CARS.tree = arrayToTree(CARS.list, "carId", "teamId", TEAMS.map, CARS.root, "children");
        callback(CARS.root);
      })
    },
    getTreeRoots1(callback){
      $_main.http.get('data/getSubUser',{ sessionId: $_main.sessionId }).then(result=>{
        result.forEach(el=>{el.name=el.cnName})
        let root={id:'0',name:$_L.get('所有司机'),children:[]}
        let children=arrayToTree(result, "userId","pid");
        root.children=children
        callback(root);
      })
    },
    iconCssFunction(node, open) {
      return !node.carId ? (open ? 'ico_open' : 'ico_close') : null;
    },
    iconCssFunction1(node, open) {
      return !node.userId ? (open ? 'ico_open' : 'ico_close') : null;
    },
    search(){
      if(this.etime<this.stime)return $_alert.warn($_L.get('开始时间不能大于结束时间！'));
      this.datas=[]
      this.querying=true
      let url=this.taskState==2?'info/getInfoByH':'info/getInfo';
      let params=this.taskState==2?{carId:this.carId,stime:this.stime,etime:this.etime,driverId:this.driverId,cdId:this.cdId}:{taskState:this.taskState}
      $_main.http.get(url,Object.assign({ sessionId: $_main.sessionId,userId:$_main.userId},params)).then(result=>{
        this.datas=result;
        this.toFinish()
      })
    },
    toFinish(){
      this.querying=false
      if(!this.datas||this.datas.length==0)return  $_alert.warn($_L.get('暂无数据！'));
    },
    editClick(){
      $_popup.open(EditWindow, {callback:this.addOrUpdateCallback});
    },
    addOrUpdateCallback(){
      this.search()
    },
    ClickBtn(row){
      let exts=row.exts&&(typeof row.exts=='string'?JSON.parse(row.exts):row.exts)||{};
      let deductedDetail=[];
      if(exts.deductedDetail){
        for (let k in exts.deductedDetail){
          deductedDetail.push(Object.assign({'regionId':k},exts.deductedDetail[k]));
        }
      }
      $_popup.open(deductedWindow, {name:row.taskName,deductedDetail:deductedDetail||[]});
    },
  }
}
</script>

<style module>
.container{
  display:flex;
  flex-flow:column;
  width: 100%;
  height: 100%;
}

</style>
