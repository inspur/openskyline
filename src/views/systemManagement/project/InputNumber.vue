<template>
  <div style="display: inline-block;">
    <el-input auto-complete="off" v-model="value" @change="changeFun" @blur="blurFun"></el-input>
  </div>
</template>
<script>
export default {
  name: 'inputNumber',
  props: ["val", "min", "max", "p"],
  watch:{
    val() {
      this.value = parseInt(this.val);
      this.bak = parseInt(this.val);
    }
  },
  data() {
    return {
      arr:[],
      value:parseInt(this.val),
      bak:parseInt(this.val)
    };
  },
  mounted() {
  },
  methods: {
    blurFun() {
      let val = arguments[0].target.value;
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.check(val);
    },
    changeFun(val) {
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.arr.push(setTimeout(() => {
        this.check(val);
      }, 3000));
    },
    check(val) {
      if (val===""||isNaN(val)) {
        this.value = this.bak;
      } else {
        if (val < this.min) {
          this.value = this.min;
        } else if (val > this.max) {
          this.value = this.max;
        }
      }
      this.bak = parseInt(this.value);
      this.$emit("change", this.value, this.p);
    }
  }
}
</script>
