<!-- 潘启宝写于2020年2月10日 16:17:56 -->
<template>
  <div class="icos-tabs" :class="{'icos-tabs0':type===0,'icos-tabs1':type===1,'icos-dark':dark}">
    <span
      v-for="i in model"
      :key="i.id"
      :data-id="i.id"
      class="icos-tabs-item"
      :class="{checked:i.select}"
      v-on:click="click"
    >{{i.name}}</span>
  </div>
</template>
<script>
import { utils } from "../utils";

export default {
  name: "IcosTabs",
  watch: {},
  props: {
    options: Array,
    type: { type: Number, default: 0 }
  },
  data() {
    return {
      model: this.options,
      dark: Vue.cookie.get("theme") + "" == "dark"
    };
  },
  computed: {},
  beforeDestroy() {},
  mounted() {},
  methods: {
    init(v) {},
    click(e) {
      let t = e.target;
      this.changeStatus({ id: t.dataset.id });

      let d = this.options.filter(v => {
        return v.id === t.dataset.id;
      });
      d = d[0] || {};
      this.$emit("change", { ...d });
    },
    changeStatus(v = {}) {
      this.options.forEach(v_ => {
        v_.select = v.id === v_.id;
      });
    }
  }
};
</script>


<style scoped>
.icos-tabs {
}
.icos-tabs0 {
}
.icos-tabs0,
.icos-tabs1 {
}
.icos-tabs1 {
  border-bottom: 1px solid rgb(222, 222, 222);
}
.icos-tabs .icos-tabs-item {
  user-select: none;
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 12px 0;
}
.icos-tabs .icos-tabs-item:not(:last-child) {
  margin-right: 20px;
}
.icos-tabs .icos-tabs-item.checked {
  color: #0087ed;
}
.icos-tabs .icos-tabs-item:hover {
  color: #0087ed;
}
.icos-tabs0 .icos-tabs-item {
  opacity: 0.45;
  padding: 0;
}
.icos-tabs0 .icos-tabs-item.checked {
  opacity: 1;
}
.icos-tabs0 .icos-tabs-item:hover {
  opacity: 1;
}
.icos-tabs1 .icos-tabs-item.checked {
}
.icos-tabs1 .icos-tabs-item.checked::after {
  content: "";
  display: block;
  position: relative;
  top: 13px;
  height: 2px;
  width: calc(100% - 10px);
  background-color: #0087ed;
  margin: 0 auto;
}
.icos-dark {
  border: unset;
}
</style>

