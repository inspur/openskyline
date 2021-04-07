<template src="./timeout.html"></template>
<style src="./timeout.css"></style>
<script>
export default {
  data() {
    return {
      time:5,
      timeoutFlg:false,
      serFlg:false
    }
  },
  mounted() {
    this.timeoutFlg = false;
    this.serFlg = false;
    let me = this;
    if (location.href.indexOf('serialnumber=no')>-1) { //序列号过期
      this.serFlg = true;
    } else {
      this.timeoutFlg = true;
    }
    me.time = 5;
    setInterval(() => {
      if (me.time<1) {
        document.location.href = "login.html";
      } else {
        me.time = me.time - 1;
      }
    }, 1000)
  },
  methods: {
    quickEnter() {
      document.location.href = "login.html";
    }
  }
}
</script>



