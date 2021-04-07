<template>
  <div id="vmNode" style="height: 100%;width:100%;position: relative;padding:8px 8px 14px 8px;">
    <el-carousel :height="height" indicator-position="outside">
      <el-carousel-item v-for="(nodes,index) in nodesArr" :key="index">
        <template v-for="node in nodes">
          <div class="vm-node" :style="node.style" :title="node.title"></div>
        </template>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script>
export default {
  name:"computerNodes",
  data() {
    return {
      nodes:[],
      nodesArr:[],
      height:'',
      sta:{
        // BUSY:{
        //   label:Vue.t('base.busying'),
        //   color:"#59bd4d"
        // },
        ACTIVE:{
          label:Vue.t('calcStorLang.running'),
          color:"#4cc127"
        },
        BUILD:{
          label:Vue.t('calcStorLang.build'),
          color:"#4cc127"
        },
        HARD_REBOOT:{
          label:Vue.t('calcStorLang.hard_reboot'),
          color:"#4cc127"
        },
        REBOOT:{
          label:Vue.t('calcStorLang.reboot'),
          color:"#4cc127"
        },
        PAUSED:{
          label:Vue.t('calcStorLang.paused'),
          color:"#4cc127"
        },
        MIGRATING:{
          label:Vue.t('calcStorLang.migrating'),
          color:"#4cc127"
        },
        REBUILD:{
          label:Vue.t('calcStorLang.rebuild'),
          color:"#4cc127"
        },
        RESCUE:{
          label:Vue.t('calcStorLang.rescue'),
          color:"#4cc127"
        },
        REVERT_RESIZE:{
          label:Vue.t('calcStorLang.revert_resize'),
          color:"#4cc127"
        },
        // SHELVED:{
        //   label:Vue.t('base.shelve'),
        //   color:"#59bd4d"
        // },
        SHELVED_OFFLOADED:{
          label:Vue.t('calcStorLang.shelved_offloaded'),
          color:"#4cc127"
        },
        SUSPENDED:{
          label:Vue.t('calcStorLang.suspended'),
          color:"#4cc127"
        },
        VERIFY_RESIZE:{
          label:Vue.t('calcStorLang.verify_resize'),
          color:"#4cc127"
        },
        PASSWORD:{
          label:Vue.t('calcStorLang.password'),
          color:"#4cc127"
        },
        UNKNOW:{
          label:Vue.t('calcStorLang.unknow'),
          color:"#ff8a00"
        },
        // DELETED:{
        //   label:Vue.t('base.deleted'),
        //   color:"#f16464"
        // },
        ERROR:{
          label:Vue.t('calcStorLang.error'),
          color:"#ff8a00"
        },
        SHUTOFF:{
          label:Vue.t('calcStorLang.closed'),
          color:"#ff8a00"
        }
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods:{
    getData() {
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/nova/v2.1/servers-inspur/detail?all_tenants=1&limit=99999999&not-tags=%40",
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        },
        successFun(data) {
          let nodes = [];
          data.servers.forEach((item) => {
            item.title = item.name + ":" + (me.sta[item.status]?me.sta[item.status].label:Vue.t('base.other'));
            item.style = {background:me.sta[item.status]?me.sta[item.status].color:"#ffe829"}
            nodes.push(item);
          })
          me.computerSize(nodes);
        }
      });
      setTimeout(() => {
        this.getData();
      }, 10000)
    },
    computerSize(nodes) {
      let me = this;
      me.nodesArr = [];
      //计算当前的容器能放多少个节点
      let $c = $('#vmNode');
      let cheight = $c.innerHeight() - 22;
      let cwidth = $c.innerWidth()-16;
      let nodeWidth = 10;
      let nodeHeight = 10;
      this.height = cheight+"px";
      let num = parseInt(cheight/nodeHeight)*parseInt(cwidth/nodeWidth);
      if (num<nodes.length) { //一屏展示不开
        let n = parseInt(nodes.length/num); //n屏
        for (let i=0; i<n+1; i++) {
          me.nodesArr.push(nodes.splice(0, num));
        }
      } else {
        me.nodesArr.push(nodes);
      }
    }
  }
}
</script>