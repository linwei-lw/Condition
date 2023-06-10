<template>
  <Window ref="w" :title="$_L.get('分配工况')" :width="300" :waiting="waiting">
    <div :class="$style.content">
      <InputText :label="$_L.get('任务名称')" trim v-model="taskName" required style="width:100%;"/>
      <InputSelect :label="$_L.get('工况')" labelField="name" valueField="id" :options="options" trim v-model="cdId" required style="width:100%;margin-top: 5px;float: left"/>
      <InputTree :label="$_L.get('车辆')"  valueField="carId" v-model="carId" required :getTreeRoots="getTreeRoots" hasOwnField="carId" :setting="{view:{iconCssFunction:iconCssFunction}}" required style="width:100%;margin-top: 5px"/>
      <InputText :label="$_L.get('执行次数')" trim v-model="taskNum" required style="width:100%;margin-top: 5px;" :reg="/[^\d]/g" :maxlength="3"/>
    </div>

    <template slot="footer">
      <Button style="margin:8px 4px;min-width:80px;" @click="$refs.w.close()">{{$_L.get('取消')}}</Button>
      <Button style="margin:8px 4px;min-width:80px;" @click="submit()" type="primary">{{$_L.get('确定')}}</Button>
    </template>
  </Window>
</template>

<script>
import { arrayToMap }  from '@/common/util/Arrays.js';
import { arrayToTree } from '@/common/util/Trees.js';

export default {
  data: function() {
    return {
      taskName: null,
      taskNum:null,
      options:[],
      carId:null,
      cdId:null,
      callback: null,
      waiting:false,
    };
  },
  mounted() {
    this.options=$_main.http.syncGet('rule/get',{ sessionId: $_main.sessionId,userId:$_main.userId })||[]
  },
  methods:{
    iconCssFunction(node, open) {
      return !node.carId ? (open ? 'ico_open' : 'ico_close') : null;
    },
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
    submit() {
      if (!this.taskName) return $_alert.warn($_L.get('请输入任务名称！'));
      if (!this.cdId) return $_alert.warn($_L.get('请选择工况！'));
      if(!this.carId)return $_alert.warn($_L.get('请选择关联车辆！'));
      if (!this.taskNum) return $_alert.warn($_L.get('请输入执行次数！'));
      let item={cdId:this.cdId,carId:this.carId,taskName:this.taskName,taskNum:this.taskNum,auser:$_main.userId}
      $_main.http.post('info/allot',item).then(result => {
        this.callback(result);
        $_alert.success( $_L.get('操作成功'));
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
