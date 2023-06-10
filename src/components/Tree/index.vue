
<template>
  
  <div :class="[$style.container, border && $style.border]" :style="{borderColor:borderColor}">
    <Toolbar v-if="searchable" :border="false" small :mini="miniBar" style="border-bottom-width:1px;border-bottom-style:solid;" :style="{borderColor:theme.border_color_light}">
      <SearchBox :searchFun="searchFun" :searchMax="searchMax" :placeholder="placeholder" :style="{width:miniBar?'calc(100% - 6px)':'calc(100% - 10px)'}" :height="miniBar?25:theme.inputHeight" :treeBorder="border" :showSearchIcon="showSearchIcon" :onItemSelected="onSearchItemSelected" ref="searchBox"/>
    </Toolbar>
    
    <div style="overflow:auto;width:100%;" :style="{height: searchable ? (miniBar ? 'calc(100% - 32px)' : 'calc(100% - 42px)') : '100%'}">
      <ul :id="treeId" :class="['ztree', frozenRoot && 'ztree_frozen']" ref="treeUl"></ul>
      <div v-if="disabled" :class="$style.disabled"/>
      <div v-if="loading||loading2" :class="$style.loading"/>
    </div>
  </div>

</template>

<script>
  /*
  * 单选树使用例子
  * <Tree ref="tree" style="width:100px;height:100%;" :setting="{view:{nameFunction:nameFunction,iconUrlFunction:iconUrlFunction,iconCssFunction:iconCssFunction},callback:{onClick:onTreeClick}}"/>
  *  mounted() {
  *    let list = [{id:'1',name:'a',pid:'0'},{id:'11',name:'a1',pid:'1'},{id:'12',name:'a2',pid:'1'},...];//id和pid相互关联，形成树的关系
  *    let roots = common.util.Trees.arrayToTree(list);
  *    this.$refs.tree.init(roots);
  *  }
  *  methods: {
  *    nameFunction(node) {// 返回当前结点的显示值，如果不设置该回调函数，默认取node.name
  *      return node.name + '(' + node.count + ')';
  *    },
  *    iconUrlFunction(node, open) {// 返回当前结点的图标绝对路径，如果该结点图标不需要URL，直接返回null
  *        return 'http://wwww.xxxxx/'+node.state+'.png';
  *    },
  *    iconCssFunction(node, open) {// 返回当前结点的图标CSS样式名，如果该结点图标不需要css，直接返回null
  *        return node.isDir ? (open ? 'ico_open' : 'ico_close') : $style.my_leaf_css;
  *    },
  *    onTreeClick(node) {
  *       alert('你点了+node.name+'，找死呀！');
  *    }
  *  }

  *  多选树使用例子，P:true是指级联勾父结点,　S:true是指级联勾子结点
   * <Tree style="width:100px;height:100%;" :setting="{check:{enable:true,P:true,S:true},callback:{onCheck:onTreeCheck}}"/>
  * 
  *  methods: {
  *    onTreeCheck(node, chgs, value) {// node是当前结点，chgs是级联的所有结点，value:1是打勾，0是去勾
  *    }
  *  }
 */

  import SearchBox from "@/components/Tree/SearchBox.vue";

  export default {
    name: "Tree",
    components: { SearchBox },
    props: {
      setting:        { type: Object,  default: ()=>{return {}} },           // 参考ztree的setting配置
      getTreeRoots: Function,                                                // 调用该方法获取树结点
      frozenRoot:     { type: Boolean, default: false },                     // 冻结根结点，不显示根结点的+-图标
      disabled:       { type: Boolean, default: false },                     // 是否可操作
      border:         { type: Boolean, default: true  },                     // 是否显示边框
      borderColor:    { type: String,  default: $_theme.border_color_dark},  // 边框颜色
      loading:        { type: Boolean, default: false },                     // 是否显示加载中
      searchable:     { type: Boolean, default: true  },                     // 是否显示搜索栏
      searchFun:      Function,                                             // 查询回调函数 参数(node, searchText) 返回true(符合条件)|false(不符合条件)
      placeholder:    String,
      miniBar:        { type: Boolean, default: false },                     // 是否显示mini搜索栏
      showSearchIcon: { type: Boolean, default: true  },                     // 是否显示搜索图标
      onSearchItemSelected: Function,                                        // 选中了搜索栏查出的某个结点的回调函数，参数(node)
      searchMax:      { type: Number, default: 200  },                       // 搜索栏显示的最多数量
      onTreeInited:   Function
    },

    _tree: null,

    data() {
      return {
        treeId: 'tree_' + $_theme.zindex(),
        loading2: false,
      };
    },

    mounted() {
      this._tree = this._tree || null;
      this.getTreeRoots && (this.loading2 = true, this.getTreeRoots(this.init));
    },

    methods: {
      init(roots, open = true) {
        this.loading2 = false;
        this.destroy();
        if (open || this.frozenRoot) {
          if (Array.isArray(roots)) {
            for (let i=0,len=roots.length; i<len; i++) {
              roots[i][this.treeId] = {open: true};
            }
          } else {
            roots[this.treeId] = {open: true};
          }
        }
        this._tree = $.fn.zTree.init($(this.$refs.treeUl), this.setting, roots);
        this.searchable && (this.$refs.searchBox.setTree(this._tree));
        this.onTreeInited && this.onTreeInited(this._tree);
        return this._tree;
      },
      getCheckedNodes(onlyChecked=true, onlyTop=false, field=null, hasOwnField=null, nodes=null) {
        return this._tree.getCheckedNodes(onlyChecked, onlyTop, field, hasOwnField, nodes);
      },
      checkNodes(nodes, checked=true, checkTypeFlag, callbackFlag) {
        for (let i=0,len=nodes.length; i<len; i++) {
          this._tree.checkNode(nodes[i], checked, checkTypeFlag, callbackFlag);
        }
      },
      selectNode(node, isSilent=false) {
        this._tree.selectNode(node, false, isSilent);
      },
      getTree() { return this._tree; },
      getTreeId() { return this.treeId; },
      destroy() {
        if (this._tree === null) return;
        this._tree.destroy();
        this._tree = null;
        if (this.searchable) {
          this.$refs.searchBox.clear();
          this.$refs.searchBox.setTree(null);
        }
      }
    },

    beforeDestroy() {
      this.destroy();
    }
  }
</script>

<style>
  .ztree_frozen li span.button.switch.level0 { display:none; }
  .ztree_frozen li ul.level0 { padding:0; background:none; }
</style>

<style module>
  .container {
    position: relative;
    background-color: #fff;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .border {
    border-style: solid;
    border-width: 1px;
  }
  .loading {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0.3;
    filter: alpha(opacity=30);
    cursor: not-allowed;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url("@/assets/icon/loading.gif");
  }
  .disabled {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.6);
    opacity: 0.6;
    filter: alpha(opacity=60); 
    cursor: not-allowed;
  }
</style>
<style>
  /* @import './zTreeStyle.css'; */
</style>
