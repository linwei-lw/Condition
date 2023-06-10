<template>
  <Window ref="w" :title="$_L.get('扣分详情')" :width="1000" :waiting="waiting">
    <InputText :label="$_L.get('工况名称')" trim v-model="name" style="width:calc(100% - 10px);margin: 5px 5px 0;" readonly/>

    <div :class="$style.content">
      <vxe-table ref="grid" :data="deductedDetail" style="border:1px solid;margin-top:5px;height:300px;" :style="{borderColor:theme.border_color_light}">
        <vxe-table-column type="index"    fixed="left"   :title="$_L.get('序号')"    width="50"/>
        <vxe-table-column field="type"    fixed="left"   :title="$_L.get('区域')" width="240" align="left">
          <template v-slot="{ row }">
              <InputTree disabled v-model="row.regionId" :getTreeRoots="getTreeRoots2" :setting="{type:'all',callback:{beforeClick:o=>o.type!='0'&&o.pid!='0'},view:{iconCssFunction:iconCssFunction}}" style="margin:5px -5px;width:calc(100% + 10px);"/>
          </template>
        </vxe-table-column>
        <vxe-table-column field="target"    :title="$_L.get('速度 / 扣分')">
          <template v-slot="{ row }">
            <span>{{row.speed&&row.speed.value||0}}</span>
            <span> / </span>
            <span>{{row.speed&&row.speed.deductionValue||0}}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('里程 / 扣分')">
          <template v-slot="{ row }">
            <span>{{row.mile&&row.mile.value||0}}</span>
            <span> / </span>
            <span>{{row.mile&&row.mile.deductionValue||0}}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('转速 / 扣分')">
          <template v-slot="{ row }">
            <span>{{row.rev&&row.rev.value||0}}</span>
            <span> / </span>
            <span>{{row.rev&&row.rev.deductionValue||0}}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('档位 / 扣分')">
          <template v-slot="{ row }">
            <span>{{row.gear&&row.gear.value||0}}</span>
            <span> / </span>
            <span>{{row.gear&&row.gear.deductionValue||0}}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column field="content"   :title="$_L.get('油门开合度 / 扣分')">
          <template v-slot="{ row }">
            <span>{{row.appPid&&row.appPid.value||0}}</span>
            <span> / </span>
            <span>{{row.appPid&&row.appPid.deductionValue||0}}</span>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>

    <template slot="footer">
      <Button style="margin:8px 4px;min-width:80px;" @click="$refs.w.close()">{{$_L.get('关闭')}}</Button>
    </template>
  </Window>
</template>

<script>
import { arrayToTree }                              from '@/common/util/Trees.js';
export default {
  data: function() {
    return {
      name:null,
      waiting:false,
      deductedDetail:[],
      callback: null,
    };
  },
  mounted() {

  },
  methods:{
    iconCssFunction(node, open) {
      return node.type=='0' ? (open ? 'ico_open' : 'ico_close') : null;
    },
    getTreeRoots2(callback){
      $_main.http.get('data/getRegions',{ sessionId: $_main.sessionId }).then(result=>{
        let root={id:'0',name:$_L.get('所有区域'),children:[]}
        let children= arrayToTree(result)
        children.forEach(node => node.parent = root);
        root.children=children
        callback(root);
      })
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
