<template>
  <div v-if="!ready" :class="$style.waiting"/>

  <div v-else :class="$style.container" :style="{backgroundColor:theme.bg_color}">
    <keep-alive>
      <router-view style="width:100%;height:100%;"/>
    </keep-alive>
    <div v-if="loading" :class="$style.waiting"/>
  </div>

</template>

<script>

  export default {
    data() {
      return {
        ready: false,
        loading: true,
      }
    },
    created() {
      let gps_web_url = "http://"+location.host;
      let gps_xhyc_url = window.location.href;
      if (location.host == 'localhost:8081'||location.host == '192.168.2.25:8081') {// 本地测试
        let hash=location.hash.replace('#/','')
        // 演示
        gps_web_url = 'http://47.92.193.174/:8085';
        gps_xhyc_url = `http://47.92.193.174/:8085?userId=admin&page=${hash}`;
      }
      window.$_main.init(gps_web_url, gps_xhyc_url);
    },
    beforeDestroy() {
      window.$_main.exit();
    },
    mounted() {
      this.ready = true;
      this.$router.push({path: window.$_main.page}).catch(err => err);
      this.$router.onReady(()=>this.loading=false);
    },

  };
</script>

<style>
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
*::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
*::-webkit-scrollbar {
  width: 11px;
  height: 11px;
  background-color: rgba(0, 0, 0, 0);
}
*::-webkit-scrollbar-thumb {
  border-radius: 5.5px;
  border: 2px solid rgba(0, 0, 0, 0);
  box-shadow: 7px 7px 0 #eee inset;
}
*::-webkit-scrollbar-thumb:hover {
  box-shadow: 7px 7px 0 #c1c1c1 inset;
}
html, body {
  overflow: hidden;
  height: 100%;
  width: 100%;
  margin: 0;
  color: #232323;
  font-size: 12px;
  font-family: "Microsoft YaHei", 微软雅黑, "Microsoft JhengHei", 华文细黑, STHeiti, MingLiu;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
input {
  color: inherit;
  font-size: inherit;
  font: inherit;
}
input::-ms-clear {
  width: 0;
  height: 0;
}
button {
  color: inherit;
  font-size: inherit;
  font: inherit;
}
a {
  text-decoration: none;
  cursor: pointer;
}
img {
  border: 0;
  margin: 0;
  width: auto;
  height: auto;
}
.el-carousel__button {
  width: 32px;
  height: 4px;
  border-radius: 2px;
}
.el-carousel__container {
  position: relative;
  height: 100%;
}
</style>

<style module>
.container {
  height: 100%;
  width: 100%;
  position: relative;
  background-color: var(--bg_color);
}
.waiting {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #e8eaed;
  opacity: 0.4;
  filter: alpha(opacity=40);
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("@/assets/icon/loading.gif");
}
</style>
