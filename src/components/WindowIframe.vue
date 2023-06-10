<template>
  <Window :width="width" :title="title" :modal="modal">
    <iframe :src="url" frameBorder="0" scrolling="auto" style="border:0;overflow:auto;" :style="{width:width+'px',height:height+'px'}"/>
  </Window>
</template>

<script>

  export default {
    data: function() {
      return {
        title: null,
        modal: null,
        width: null,
        height: null,
        url: null,
      };
    },
    created() {
    },
  };
</script>

<style module>
</style>
