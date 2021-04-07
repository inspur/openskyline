<template>
  <div>
    <icos-dashboard :option="option"></icos-dashboard>
  </div>
</template>
<script>
import { utils } from "../../../../public/utils";
import IcosDashboard from "../../../../public/components/IcosDashboard";

export default {
  components: {
    IcosDashboard
  },
  props: ["hostName", "dockerId"],
  data() {
    let o = {
      percent: 0,
      title: {
        text: Vue.t("monitor.memUnNow")
      },
      progressBar: {
        backgroundColor: "#1991eb",
        backgroundInnerColor: "#fa8c16"
      }
    };
    return {
      option: $.extend(true, JSON.parse(JSON.stringify(utils.echartsOption)), o)
    };
  },
  mounted() {
    this.getData();
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    getData() {
      let me = this;
      clearTimeout(this.timeout);
      this.$ajax({
        type: "post",
        url: "api/pluto/v1/monitor/search/resource",
        data: JSON.stringify({
          params: {
            alias_fields: ["usage_percent"],
            fields: ["last(usage_percent)"],
            filters: [
              {
                field: "host",
                operate: "=",
                value: me.hostName
              },
              {
                field: "container_name",
                operate: "=",
                value: me.dockerId
              }
            ],
            is_list: "0",
            name: "docker",
            table: "docker_container_mem"
          }
        }),
        successFun(obj) {
          let p = obj.docker && obj.docker.usage_percent;
          if (!p || isNaN(p)) {
            p = 0;
          }
          me.option.percent = p.toFixed(2);
        }
      });
      this.timeout = setTimeout(() => {
        me.getData();
      }, 1000 * 60);
    }
  }
};
</script>
