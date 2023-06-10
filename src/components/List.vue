<template>
  <div :class="[$style.container, border && $style.border]" @dragover="onDrag($event);" :style="{borderColor:theme.border_color_dark}" tabindex="0" @blur="blur()">
    <!--transition-group :class="$style.ul" tag="ul", _dragging && $style.move-->
    <ul :class="$style.ul">
      <li :draggable="draggable" v-for="(item, index) in list" :key="index" :class="$style.item" :style="[{lineHeight: `${lineHeight}px`}, 
       divider ? {borderBottomColor: theme.border_color_light, borderBottomWidth: '1px'} : null, _itemStyle(item, index, selectedIndex), itemStyle]" @dragstart="onDragStart($event,item,index)" @dragend="onDragEnd" @mouseenter="_dragend ? (_dragend=false) : _dragging ? null : (hoverItem = item)" @mouseleave="hoverItem = null" @mousedown="draggable && itemClick(item, index, false)" @click="itemClick(item, index)" @dblclick="itemDbClick(item, index)">

        <!--URL的图标显示-->
        <img v-if="iconUrlFunction" :src="iconUrlFunction(item)" :class="$style.icon_url" :style="iconStyle" draggable="false" />
        <!--CSS的图标显示-->
        <span v-if="iconCssFunction" :class="[iconCssFunction(item), $style.icon_css]" :style="iconStyle">&nbsp;</span>
        <!--文本显示-->
        <span v-html="labelFunction ? labelFunction(item) : labelField ? item[labelField] : item"></span>

        <div v-if="item.disabled" :class="$style.disabled" />
        <!--鼠标经过显示关闭按钮-->
        <div v-if="closable && hoverItem==item" :class="$style.btn_close" @click.stop="$emit('close', item)" />
      </li>
    </ul>

    <div v-if="disabled" :class="$style.disabled" />
  </div>
</template>

<script>
/*
* 使用例子
* <List :list="[{label:'吃饭'},{label:'睡觉'}]" labelField="label" :iconUrlFunction="getIconUrl" @click="onItemClick" @change="onSelectChg" @dragend="onDragEnd" divider draggable/>
*
*  methods: {
*    getIconUrl(item) {// item是列表项对象
*      return 'http://xxxxxxxx.png';
*    },
*    onItemClick(item)) {// 点击某项触发，item是列表项对象
*    },
*    onSelectChg(item)) {// 选择不同项触发，item是列表项对象
*    },
*    onDragEnd(dragItem, newIndex, oldIndex) {// 拖动某项结束后触发
*    }
*  }
*/

import { domTop } from '@/components/util/Dom.js';

let drags;

export default {
  name: "List",
  props: {
    list: { type: Array, default: [] },              // 数据列表
    labelField: { type: String, default: '' },              // 文本字段
    labelFunction: Function,                                  // 文本函数
    iconUrlFunction: Function,                                  // 图标地址函数
    iconCssFunction: Function,                                  // 图标样式函数
    border: { type: Boolean, default: true },              // 是否有边框
    divider: { type: Boolean, default: false },              // 是否有分割线
    draggable: { type: Boolean, default: false },              // 是否可拖动排序
    closable: { type: Boolean, default: false },              // 按钮是否可关闭
    disabled: { type: Boolean, default: false },              // 是否可操作
    lineHeight: { type: Number, default: $_theme.inputHeight },// 每行高度数值，单位是px
    itemStyle: { default: null },
    iconStyle: { default: null },
  },
  data() {
    return {
      selectedItem: null,
      selectedIndex: -1,
      hoverItem: null,
    }
  },
  watch: {
    selectedItem: function (v) {
      this.selectedIndex = this.list.indexOf(v);
    },
  },
  created() {
    this._dragend = this._dragging = false;
  },
  methods: {
    wxClick(item) {
      this.$emit('wxCopy', item)
    },
    blur() {
      this.$emit("blur");
    },
    _itemStyle(item, index) {// 每项的背景颜色
      if (item == this.selectedItem || index == this.selectedIndex) return { backgroundColor: this.theme.selected_color };
      if (item == this.hoverItem) return { backgroundColor: this.theme.list_hover_color };
      return { backgroundColor: this.theme.alternate_colors[index % 2] };
    },
    itemClick(item, index, click = true) {// 点击该项处理
      let oitem = this.selectedItem;
      if (this.selectedItem != item) {
        this.selectedItem = item;
        this.selectedIndex = index;
        click && this.$emit('click', item, oitem, index);
        this.$emit('change', item, oitem, index);
      } else {
        click && this.$emit('click', item, oitem, index);
      }
    },
    itemDbClick(item, index) {
      this.$emit('dbclick', item, index);
    },
    onDragStart({ target }, item, index) {// 开始拖动处理
      this._dragging = true;
      this._dragend = false;
      this.hoverItem = null;
      this.selectedItem = item;
      this.selectedIndex = -1;
      drags = { dom: target, y: domTop(this.$el), oldIndex: index, newIndex: index };
    },
    onDrag(e) {// 拖动中处理
      let newIndex = this.getIndex(e);
      if (newIndex != drags.newIndex) {
        this.list.splice(newIndex, 0, this.list.splice(drags.newIndex, 1)[0]);
        drags.newIndex = newIndex;
      }
      e.preventDefault();
    },
    onDragEnd() {// 拖动结束处理
      this._dragend = true;
      this._dragging = false;
      if (drags.oldIndex != drags.newIndex) {
        this.$emit('dragend', this.selectedItem, drags.newIndex, drags.oldIndex);
      }
      drags = null;
    },
    getIndex(e) {// 根据Y位置，算出是第几个项
      let y = e.clientY || e.y;
      let index = Math.floor((y + this.$el.scrollTop - drags.y) / drags.dom.offsetHeight);
      return index < 0 ? 0 : Math.min(index, this.list.length - 1);
    }
  }
}
</script>

<style module>
.container {
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: auto;
  position: relative;
}
.border {
  border-style: solid;
  border-width: 1px;
}
.ul {
  display: inline-block;
  min-width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  white-space: nowrap;
  width: 100%;
  padding: 0 10px;
  border: 0;
  border-bottom-style: solid;
  position: relative;
}
.wxImg {
  display: flex;
  align-items: center;
  position: absolute;
  top: 3px;
  right: 0;
  width: 42px;
  height: 25px;
  margin-right: 3px;
  z-index: 99999;
}
/*
  .move {
    transition: all 0.3s;
  }*/
.icon_url {
  vertical-align: middle;
  padding-right: 10px;
  margin: 5px 0;
  width: auto;
}
.icon_css {
  display: inline-block;
  background-position: center;
  background-repeat: no-repeat;
  margin-right: 10px;
}
.btn_close {
  position: absolute;
  height: 12px;
  width: 16px;
  top: 0;
  right: 0;
  cursor: pointer;
  background: url("@/assets/main/menu-close.png") no-repeat;
  background-size: 100% 100%;
}
/* 禁止操作 */
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
