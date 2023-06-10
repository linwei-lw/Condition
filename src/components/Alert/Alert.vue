<template>
  <div :class="$style.container" :style="theme.popup">
    <div style="display:flex;align-items:center;justify-content:center">
      <i :class="icon" style="font-size:36px" :style="{color:theme.color}" v-if="!Iconimg"></i>
      <img :src="Iconimg"  :style="{color:theme.color}" v-if="Iconimg"/>
      <span :class="$style.msgtxt">{{message}}</span>
    </div>
    <div :class="$style.btnbar" v-if="showYesBtn || showNoBtn">
      <Button v-if="showNoBtn" @click="_callback(false,$event)" style="min-width:80px;margin:0 6px;"> {{noText || $_L.get('否')}} </Button>
      <Button v-if="showYesBtn" @click="_callback(true,$event)" style="min-width:80px;margin:0 6px;" type="primary"> {{yesText || $_L.get('是')}} </Button>
    </div>
  </div>
</template>

<script>

  export default {
    name: "Alert",
    _modalDom: null,           // 模态层dom对象

    data() {
      return {
        type: '',               // 提示类型 success成功 warn警告 error异常 comfirm确认
        message: '',            // 提示内容
        showYesBtn: false,     // 是否显示《是》按钮
        showNoBtn: false,      // 是否显示《否》按钮
        callback: null,        // 按钮点击后的回调函数
        yesText: null,         // 更改《是》按钮的文字
        noText: null,          // 更改《否》按钮的文字
        icon:'',               //图标
        Iconimg:null
      };
    },
    created(){
      switch (this.type) {
        case 'success':this.icon = 'el-icon-chenggong';break;
        case 'warn'   :this.icon = 'el-icon-jingqing';break;
        case 'error'  :this.icon = 'el-icon-shibai';break;
        case 'comfirm':this.icon = 'el-icon-tishi';break;
        default: break;
      }
    },
    methods: {
      _callback(yes,event) {
        document.body.removeChild(this.$el);
        if (this._modalDom != null) {
          document.body.removeChild(this._modalDom);
          this._modalDom = null;
          document.removeEventListener('keydown', this.enterKey);
        }
        this.callback(yes,event);
      },
      enterKey() {// 回车键自动关闭
        if (event.keyCode == 13) {
          event.returnValue = false;
          this._callback(this.showNoBtn);
        }
        if(event.keyCode == 32){
          event.returnValue = false;
          this._callback(false)
        }
      }
    },

    beforeMount() {// 将dom对象加到document文档流中
      if (this.showYesBtn || this.showNoBtn) {
        this._modalDom = document.createElement("div");
        this._modalDom.className = this.$style.modal;
        this._modalDom.style['z-index'] = $_theme.zindex();
        document.body.appendChild(this._modalDom);
        document.addEventListener('keydown', this.enterKey);
      }
    }
  }
</script>

<style module>
  .container {
    position: fixed;
    border-top: 5px solid rgba(64,150,209,1) !important;
    min-width: 150px;
    padding: 10px;
    background-color: #fff;
    background-position: 10px 10px;
    background-size: 40px 40px;
    background-repeat: no-repeat;
  }
  .msgtxt{
    padding-left:10px;
    line-height: 15px;
    font-size: 14px;
    font-weight: bold;
    white-space: pre;
  }
  .btnbar {
    width: 100%;
    padding-top: 10px;
    padding-bottom: 5px;
    text-align: center;
  }
  .modal {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    opacity: 0.4;
    filter: alpha(opacity=40);
  }
</style>
