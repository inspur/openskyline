<template>
  <div id="comNode" style="height: 100%;width:100%;position: relative;padding:8px 8px 18px;">
    <el-carousel :height="height" indicator-position="outside">
      <el-carousel-item v-for="(nodes,index) in nodesArr" :key="index">
        <template v-for="node in nodes">
          <div class="computer-node" :style="node.style" :title="node.title"></div>
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
      height:''
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
        url: "api/nova/v2.1/os-hypervisors/detail",
        successFun(data) {
          let nodes = [];
          data.hypervisors.forEach((item) => {
             if (item.hypervisor_type!='ironic') {
              if (item.state=="up") {
                item.style={background:"#4cc127"};
                item.title = item.hypervisor_hostname+':'+Vue.t('lang.activation')
              } else {
                item.style={background:"#ff8a00"};
                item.title = item.hypervisor_hostname+':'+Vue.t('calcStorLang.unActivation')
              }
              nodes.push(item);
            }
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
      //计算当前的容器能放多少个节点
      let $c = $('#comNode');
      me.nodesArr = [];
      let cheight = $c.innerHeight() - 26;
      let cwidth = $c.innerWidth()-16;
      let nodeWidth = 35;
      let nodeHeight = 35;
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