<template>
  <div class="breadcrumb-panel">
    <span v-for="item in pathArry" :key="item.path">
      <span class="breadcrumb-item" :title="item.name" @click="onClickItem(item)">
          {{item.label}}
      </span>
      <span class="breadcrumb-separtor" v-if="!useIconFlag">{{separtorSymbol}}</span>
      <span class="breadcrumb-separtor" v-if="useIconFlag"><i :class="separtorClass"></i></span>
    </span>
  </div>
</template>
<script>
import Vue from 'vue'
export default {
  name: 'Breadcrumb',
  props: ["pathList", "separtor", "separtorClass"],
  data() {
    return {
      pathArry: [],
      useIconFlag: false,
      separtorSymbol: ""
    }
  },
  computed: {
  },
  watch: {
    pathList: {
      handler: function (rows, oldVal) {
        this.reset();
      },
      deep: true
    }
  },
  mounted() {
    this.useIconFlag = false;
    if (this.separtorClass) {
      this.useIconFlag = true;
    }
    if (!this.separtor) {
      this.separtorSymbol = "/";
    } else {
      this.separtorSymbol = this.separtor;
    }
    this.reset();
  },
  methods: {
    reset() {
      this.pathArry = [];
      if (this.pathList.length <= 4) {
        this.pathArry = this.pathList;
      }
      if (this.pathList.length > 4) {
        let temp = this.pathList.slice(-4);//截取数组的后四位
        temp = JSON.parse(JSON.stringify(temp));
        temp[0]["label"] = "..."
        this.pathArry = [this.pathList[0], ...temp];
      }
    },
    onClickItem(item) {
      this.$emit("select-change", item);
    }
  }
}
</script>
<style scoped>
.breadcrumb-panel {
  margin: 10px;
}
.breadcrumb-separtor{
  display: inline-block;
  overflow: hidden;
  margin: 0px 2px;
}
.breadcrumb-item {
  color: #0087ed;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 30%;
}
.breadcrumb-item:hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>
