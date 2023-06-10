<template>
  <div :class="[$style.container,isFullScreen&&$style.fullScreen]" :style="{width: width>0 && (width+'px'), left:left+'px', top:top+'px'}">
    
    <!--弹出窗的头部-->
    <div :style="{backgroundColor:titleColor||theme.color, height:titleHeight+'px', cursor:movable?'move':''}" @mousedown="movable && onDragStart($event)" v-if="showHead" style="z-index: 2;">
      <!--头部标题-->
      <slot name="title"> <span :class="$style.title" :style="{lineHeight:titleHeight+'px'}">{{ title }}</span> </slot>
      <!--头部关闭按钮-->
      <button type="button" :class="$style.closebtn" :style="{width:titleHeight+'px'}" v-if="showClose" @click="close">
        <i class="el-icon-close"></i>
      </button>
      <!--头部最大化按钮-->
      <button type="button" :class="$style.fullScreenbtn" :style="{width:titleHeight+'px'}" v-if="showFullScreen" @click="isFullScreen?restoreScreen():fullScreen()" :title="isFullScreen?'还原':'最大化'">
        <i :class="isFullScreen?'el-icon-copy-document':'el-icon-full-screen'"></i>
      </button>
    </div>

    <!--窗体内容-->
    <div ref="content" style="background-color:#fff;overflow:auto;" :style="contentStyle"><slot></slot></div>

    <!--窗体底部-->
    <div ref="footer" v-if="$slots.footer" :class="$style.footer" :style="{backgroundColor:theme.bg_color, borderTopColor:theme.border_color_light}">
      <slot name="footer"></slot>
    </div>

    <div v-if="waiting" :class="$style.waiting"/>
  </div>
</template>

<script>

  /*
  * 使用例子 MyWindow.vue
  *
  * <Window title="我是标题" :width="100" @closed="onWindowClosed">
  *   <div v-slot:default>
  *     我是内容
  *   </div>
  *   <template v-slot:footer>
  *     <Button style="margin:5px;"> 取消 </Button>
  *     <Button style="margin:5px;" type="primary"> 保存 </Button>
  *   </template>
  * </Window>
  * 
  * let w = $_popup.open(MyWindow, {data});//打开MyWindow窗口
  * w.close();//关闭MyWindow窗口
  */
  
  import { labelWidthFit } from '@/components/util/LabelWidth.js';

  let divX, divY;

  export default {
    name: "Window",
    props: {
      title: String,                                   // 头部标题文字
      titleHeight: { type: Number,  default: 35 },     // 标题高度
      titleColor:  {type: String, default: null},      // 标题颜色
      width:       { type: Number,  default: 0 },      // 窗体宽度数值，单位px
      fitLabel:    { type: Boolean, default: true},    // 是否对齐标题宽度
      modal:       { type: Boolean, default: true },   // 是否模态
      waiting : Boolean,                               // 是否等待中
      showClose:   { type: Boolean, default: true },   // 是否显示关闭按钮,
      showHead:   { type: Boolean, default: true },   // 是否显示标题栏,
      movable:     { type: Boolean, default: true },   // 是否可移动
      showFullScreen:   { type: Boolean, default: false },   // 是否显示关闭按钮,
      beforeClose: Function,
      afterFullScreen: Function,
      afterRestoreScreen: Function,
      contentStyle: { default: null}
    },

    _modalDom: null,  // 模态层dom对象

    data() {
      return {
        left: 0,    // 窗体x坐标(移动窗口用的)
        top: 0,      // 窗体y坐标(移动窗口用的)
        isFullScreen: false, //是否全屏
      };
    },

    beforeMount() {
      if (this.modal) {
        this._modalDom = document.createElement("div");
        this._modalDom.className = this.$style.modal;
        this._modalDom.style['z-index'] = $_theme.zindex();
        document.body.appendChild(this._modalDom);
      }
    },

    mounted() {// 将dom对象加到document文档流中
      //判断是否超高
      this.$nextTick(()=>{
        this.left = parseInt(this.$el.style.left.replace('px',''));
        this.top = parseInt(this.$el.style.top.replace('px',''));
        
        let maxHeight;
        if (this.contentStyle && this.contentStyle.maxHeight) {
          this._oldMaxHeight = maxHeight = parseInt(this.contentStyle.maxHeight.replace('px',''));
        } else {
          this._oldMaxHeight = maxHeight = document.documentElement.clientHeight - this.titleHeight - (this.$slots.footer ? this.$refs.footer.clientHeight : 0) - this.top;
          this.$refs.content.style['max-height'] = maxHeight + 'px';
        }
        if (this.$refs.content.clientHeight > maxHeight) {
          this.width += 16;
          this.left -= 8;
        }
        
        this.fitLabel && labelWidthFit(this.$refs.content);
      });
    },

    methods: {
      close() {// 关闭窗体
        if (this.beforeClose && this.beforeClose() === false) return;
        document.body.removeChild(this.$el);
        if (this._modalDom != null) {
          document.body.removeChild(this._modalDom);
          this._modalDom = null;
        }
        this.$emit('closed');
        this.$parent.$destroy();
      },
      fullScreen(){
        this._oldLeft = this.left;
        this._oldTop = this.top;
        this.left = 0;
        this.top = 0;
        this.isFullScreen = true;
        let maxHeight = document.documentElement.clientHeight - this.titleHeight - (this.$slots.footer ? this.$refs.footer.clientHeight : 0);
        this.$refs.content.style['max-height'] = maxHeight + 'px';
        this.afterFullScreen && this.$nextTick(this.afterFullScreen);
      },
      restoreScreen(){
        this.left = this._oldLeft;
        this.top = this._oldTop;
        this.isFullScreen = false;
        this.$refs.content.style['max-height'] = this._oldMaxHeight + 'px';
        this.afterRestoreScreen && this.$nextTick(this.afterRestoreScreen);
      },
      onDragStart(e) {// 窗体开始拖动前
        divX = e.clientX - this.$el.offsetLeft;
        divY = e.clientY - this.$el.offsetTop;
        document.addEventListener('mousemove', this.onDraging);
        document.addEventListener('mouseup', this.onDragEnd);
      },
      onDraging(e) {// 窗体正在拖动
        this.left = e.clientX - divX;
        this.top = e.clientY - divY;
      },
      onDragEnd() {// 窗体结束拖动
        document.removeEventListener('mousemove', this.onDraging);
        document.removeEventListener('mouseup', this.onDragEnd);

        this.left = Math.max(this.left, 0);
        this.top = Math.max(this.top, 0);
        if (this.left + 100 > document.documentElement.clientWidth) {
          this.left = document.documentElement.clientWidth - this.$el.clientWidth;
        }
        if (this.top + 30 > document.documentElement.clientHeight) {
          this.top = document.documentElement.clientHeight - this.$el.clientHeight;
        }
      }
    }
  };
</script>

<style module>
  .container {
    position: fixed;
    min-width: 150px;
    background: #fff;
    box-shadow: 0px 0px 10px 0px RGBA(0, 0, 0, 0.2);
  }
  .fullScreen{
    width: 100% !important;
    height: 100% !important;
  }
  .title {
    padding-left: 10px;
    color: #fff;
    font-size: 13px;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
  }
  .closebtn {
    color:#fff;
    font-size: 16px;
    float: right;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .fullScreenbtn {
    color:#fff;
    font-size: 16px;
    float: right;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    transform:rotate(180deg);
    -ms-transform:rotate(180deg); 	/* IE 9 */
    -moz-transform:rotate(180deg); 	/* Firefox */
    -webkit-transform:rotate(180deg); /* Safari 和 Chrome */
    -o-transform:rotate(180deg); 	/* Opera */
  }
  .closebtn:hover, .fullScreenbtn:hover {
    background-color: rgba(255,255,255,0.2);
  }
  .closebtn:active, .fullScreenbtn:active {
    background-color:rgba(0,0,0,0.2);
  }
  .footer {
    min-height: 40px;
    text-align: center;
    border-top-style: solid;
    border-top-width: 1px;
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
  /* 等待禁止操作 */
  .waiting {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.6);
    opacity: 0.6;
    filter: alpha(opacity=60); 
    cursor: not-allowed;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url("@/assets/icon/loading.gif");
  }
</style>
