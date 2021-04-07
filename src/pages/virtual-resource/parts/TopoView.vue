<template>
  <div style="height: 100%;width:100%;position: relative;">
    <div class="screen_b_part_t"></div>
      <div class="screen_b_part_b"></div>
      <div class="screen_b_part_l"></div>
      <div class="screen_b_part_r"></div>
      <div class="screen_b_part_lt"></div>
      <div class="screen_b_part_lb"></div>
      <div class="screen_b_part_rt"></div>
      <div class="screen_b_part_rb"></div>
      <div class="screen_b_part_title">
        <div>{{$t('base.resourceTopo')}}</div>
      </div>
      <div class="top-view-iamge">
        <div><span class="top-view-iamge-project"></span><span class="top-view-iamge-title">{{$t('base.project')}}</span></div>
        <div><span class="top-view-iamge-vmnormal"></span><span class="top-view-iamge-title">{{$t('calcStorLang.instance')}}({{$t('base.normal')}})</span></div>
        <div><span class="top-view-iamge-vmexception"></span><span class="top-view-iamge-title">{{$t('calcStorLang.instance')}}({{$t('base.abnormal')}})</span></div>
        <div><span class="top-view-iamge-ironic"></span><span class="top-view-iamge-title">{{$t('calcStorLang.physicalHost')}}</span></div>
      </div>
      <div class="screen_b_part_c">
        <div style="height:100%;width:100%;" id="myChart"></div>
        <!-- <IEcharts :option="option" style="height:100%;"></IEcharts> -->
      </div>
  </div>
</template>
<script>
import IEcharts from 'vue-echarts-v3/src/full.vue';
import echarts from './echarts.min.js'
export default {
  name:"",
  components:{
    IEcharts
  },
  data() {
    return {
      echarts:echarts,
      chart:null,
      activeRegionId:this.$cookie.get('region_id'),
      option:{
        tooltip:{
          trigger:'item',
          triggerOn:"mousemove"
        },
        series:[
          {
            type:"tree",
            initialTreeDepth:5,
            layout:"radial",
            //orient:"vertical",
            left:'5%',
            right:'5%',
            top:'5%',
            bottom:'15%',
            lineStyle:{
              width:0.5,
              color:"#00eaff"
            },
            label:{
              show:false
            },
            leaves:{
              label:{
                show:false
              }
            },
            data:[{
              name:Vue.t('base.mainTitle'),
              symbol:"image://./static/bigScreen/product.png",
              symbolSize:[141, 90],
              children:[]
            }]
          }
        ]
      },
      sta:{
        ACTIVE:{
          label:Vue.t('calcStorLang.running'),
          image:"0"
        },
        BUILD:{
          label:Vue.t('calcStorLang.build'),
          image:"0"
        },
        HARD_REBOOT:{
          label:Vue.t('calcStorLang.hard_reboot'),
          image:"0"
        },
        REBOOT:{
          label:Vue.t('calcStorLang.reboot'),
          image:"0"
        },
        PAUSED:{
          label:Vue.t('calcStorLang.paused'),
          image:"0"
        },
        MIGRATING:{
          label:Vue.t('calcStorLang.migrating'),
          image:"0"
        },
        REBUILD:{
          label:Vue.t('calcStorLang.rebuild'),
          image:"0"
        },
        RESCUE:{
          label:Vue.t('calcStorLang.rescue'),
          image:"0"
        },
        REVERT_RESIZE:{
          label:Vue.t('calcStorLang.revert_resize'),
          image:"0"
        },
        // SHELVED:{
        //   label:Vue.t('base.shelve'),
        //   image:"0"
        // },
        SHELVED_OFFLOADED:{
          label:Vue.t('calcStorLang.shelved_offloaded'),
          image:"0"
        },
        SUSPENDED:{
          label:Vue.t('calcStorLang.suspended'),
          image:"0"
        },
        VERIFY_RESIZE:{
          label:Vue.t('calcStorLang.verify_resize'),
          image:"0"
        },
        PASSWORD:{
          label:Vue.t('calcStorLang.password'),
          image:"0"
        },
        UNKNOW:{
          label:Vue.t('calcStorLang.unknow'),
          image:"1"
        },
        // DELETED:{
        //   label:Vue.t('base.deleted'),
        //   image:"1"
        // },
        ERROR:{
          label:Vue.t('calcStorLang.error'),
          image:"1"
        },
        SHUTOFF:{
          label:Vue.t('calcStorLang.closed'),
          image:"1"
        }
      }
    }
  },
  mounted() {
    this.chart = this.echarts.init(document.getElementById("myChart"));
    //拓扑图层级关系：logo>region>project>云主机
    this.getData();
  },
  methods:{
    getData() {
      let regions = [];
      let me = this;
      let reqList = [];
      let regionName = '';
      Vue.regionList.forEach((item) => {
        if (item.region_id == me.activeRegionId) {
          regionName = item.region;
        }
      })
      reqList.push(me.getProjects(me.activeRegionId));
      Promise.all(reqList).then((data) => {
        data.forEach((item, index) => {
          regions.push({
            name:regionName,
            symbol:"image://./static/bigScreen/region.png",
            symbolSize:[56, 40],
            children:item
          })
        })
        me.option.series[0].data[0].children = regions;
        me.chart.setOption(me.option);
      })
      setTimeout(() => {
        this.getData();
      }, 30000)
      // this.option.series[0].data = [{
      //   name:"云海",
      //   symbol:"image://./static/bigScreen/1.png",
      //   children:regions
      // }];
    },
    getProjects(regionId) {
      let me = this;
      return new Promise((resolve, reject) => {
        if (Vue.roleType!="0") {
          let list = [];
          let vmList = [];
          vmList.push(me.getVms(me.$cookie.get('pid'), regionId));
          Promise.all(vmList).then((arr) => {
            arr.forEach((item, index) => {
              me.$ajax({
                type: "get",
                url: "api/keystone/v3/projects/" + this.$cookie.get("pid"),
                showErrMsg: false,
                successFun(result) {
                  list.push({
                    name:result["project"].name,
                    symbol:"image://./static/bigScreen/project.png",
                    symbolSize:24,
                    children:item
                  })
                  resolve(list)
                }
              });
            })
          })
        } else {
          this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/projects?domain_id=default",
            regionId:regionId,
            successFun(data) {
              let list = [];
              let vmList = [];
              data.projects.forEach((item) => {
                vmList.push(me.getVms(item.id, regionId))
              })
              Promise.all(vmList).then((arr) => {
                arr.forEach((item, index) => {
                  list.push({
                    name:data.projects[index].name,
                    symbol:"image://./static/bigScreen/project.png",
                    symbolSize:24,
                    children:item
                  })
                })
                resolve(list)
              })
            },
            errFun() {
              resolve([])
            }
          })
        }
      })
    },
    getVms(pid, regionId) {
      let me = this;
      return new Promise((resolve, reject) => {
        let novaUrl = "api/nova/v2.1/servers-inspur/detail?project_id=" + pid+"&all_tenants=1&limit=99999&sort_key=created_at&sort_dir=desc&not-tags=%40";
        if (Vue.roleType!="0") {
          novaUrl = "api/nova/v2.1/servers-inspur/detail?limit=99999999&not-tags=%40&project_id="+pid;
        }
        this.$ajax({
          type: 'get',
          url: novaUrl,
          regionId:regionId,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          successFun(data) {
            let arr = [];
            data.servers.forEach((item) => {
              let o = me.sta[item.status];
              if (!o) {
                o = me.sta["UNKNOW"];
              }
              let label = o.label;
              let img = '';
              if (item.name.substr(0, 5)=='Bare@') {
                img = "image://./static/bigScreen/ironic.png";
                label=Vue.t('calcStorLang.physicalHost');
              } else {
                img = o.image==0?"image://./static/bigScreen/vmnormal.png":"image://./static/bigScreen/vmexception.png"
              }
              arr.push({
                name:item.name+"("+label+")",
                symbol:img,
                symbolSize:20
              })
            })
            resolve(arr);
          },
          errFun() {
            resolve([])
          }
        })
      })
    }
  }
}
</script>