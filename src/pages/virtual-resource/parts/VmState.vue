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
        <div>{{$t('base.cloudHostState')}}</div>
      </div>
      <div class="screen_b_part_c">
        <el-row style="height:100%;">
          <el-col :span="15" style="height:100%;">
            <IEcharts ref="" :option="option" style="height:100%;"></IEcharts>
          </el-col>
          <el-col :span="9" style="height:100%;padding-bottom:20px;">
            <ul :class="scrollClass" id="cloudHostState">
              <template v-for="item in arr">
                <li style="height: 34px;">
                  <div style="float: left;"><span class="screen-circle" :style="item.style"></span>{{item.name}}：{{item.value}}</div>
                </li>
              </template>
            </ul>
          </el-col>
        </el-row>
        
      </div>
  </div>
</template>
<script>
import IEcharts from 'vue-echarts-v3/src/full.vue';
export default {
  name:"",
  components:{
    IEcharts
  },
  data() {
    return {
      scrollClass:"screen-right-c",
      option:{
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.percent+'%';
          }
        },
        calculable : false,
        series : [{
          type: 'pie',
          radius : '76%',
          center: ['53%', '47%'],
          data:[
          ],
          itemStyle:{
            normal:{
              label:{
                position:"outer"
              }
            },
            emphasis:{
              label:{
                show:false
              }
            }
          },
          label:{
            normal:{
              show:false
            }
          }
        }]
      },
      sta:{
        // BUSY:{
        //   label:Vue.t('base.busying'),
        //   color:"#59bd4d"
        // },
        ACTIVE:{
          num:0,
          label:Vue.t('calcStorLang.running'),
          color:"#4cc127"
        },
        BUILD:{
          num:0,
          label:Vue.t('calcStorLang.build'),
          color:"#eba08d"
        },
        HARD_REBOOT:{
          num:0,
          label:Vue.t('calcStorLang.hard_reboot'),
          color:"#77b8b8"
        },
        REBOOT:{
          num:0,
          label:Vue.t('calcStorLang.reboot'),
          color:"#6f7c85"
        },
        PAUSED:{
          num:0,
          label:Vue.t('calcStorLang.paused'),
          color:"#e06a67"
        },
        MIGRATING:{
          num:0,
          label:Vue.t('calcStorLang.migrating'),
          color:"#7ccaa9"
        },
        REBUILD:{
          num:0,
          label:Vue.t('calcStorLang.rebuild'),
          color:"#42a1a2"
        },
        RESCUE:{
          num:0,
          label:Vue.t('calcStorLang.rescue'),
          color:"#2e4650"
        },
        REVERT_RESIZE:{
          num:0,
          label:Vue.t('calcStorLang.revert_resize'),
          color:"#649e7d"
        },
        // SHELVED:{
        //   label:Vue.t('base.shelve'),
        //   color:"#59bd4d"
        // },
        SHELVED_OFFLOADED:{
          num:0,
          label:Vue.t('calcStorLang.shelved_offloaded'),
          color:"#c79f91"
        },
        SUSPENDED:{
          num:0,
          label:Vue.t('calcStorLang.suspended'),
          color:"#dc7f15"
        },
        VERIFY_RESIZE:{
          num:0,
          label:Vue.t('calcStorLang.verify_resize'),
          color:"#c79f91"
        },
        PASSWORD:{
          num:0,
          label:Vue.t('calcStorLang.password'),
          color:"#e77b5a"
        },
        UNKNOW:{
          num:0,
          label:Vue.t('calcStorLang.unknow'),
          color:"#649e7d"
        },
        // DELETED:{
        //   label:Vue.t('base.deleted'),
        //   color:"#f16464"
        // },
        ERROR:{
          num:0,
          label:Vue.t('calcStorLang.error'),
          color:"#f16464"
        },
        SHUTOFF:{
          num:0,
          label:Vue.t('calcStorLang.closed'),
          color:"#a1d3bb"
        }
      },
      arr:[]
    }
  },
  mounted() {
    this.getData();
    setInterval(() => {
      this.scroll();
    }, 2600)
    //this.scroll();
  },
  methods:{
    getData() {
      let me = this;
      let novaUrl = "api/nova/v2.1/servers-inspur/detail?all_tenants=1&limit=99999999&not-tags=%40";
      if (Vue.roleType!="0") {
        novaUrl = "api/nova/v2.1/servers-inspur/detail?limit=99999999&not-tags=%40&project_id="+ this.$cookie.get('pid');
      }
      this.$ajax({
        type: 'get',
        url: novaUrl,
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        },
        successFun(data) {
          me.arr = [];
          me.option.series[0].data = [];
          for (let key in me.sta) {
            me.sta[key].num = 0;
          }
          data.servers.forEach((item) => {
            if (me.sta[item.status]) {
              me.sta[item.status].num = me.sta[item.status].num+1;
            }
          })
          for (let key in me.sta) {
            me.option.series[0].data.push({
              name:me.sta[key].label,
              value:me.sta[key].num,
              itemStyle:{
                normal:{
                  color:me.sta[key].color
                }
              }
            })
            if (me.sta[key].num>0) {
              me.arr.push({
                name:me.sta[key].label,
                value:me.sta[key].num,
                style:{
                  backgroundColor:me.sta[key].color
                }
              })
            }
          }
        }
      })
      setTimeout(() => {
        this.getData();
      }, 10000)
    },
    scroll() {
      let $t = $("#cloudHostState");
      let children = $t.children();
      let cheight = 0;
      for (let i=0; i<children.length; i++) {
        cheight += 30;
      }
      if ($t.height()<cheight) {
        this.scrollClass = "screen-right-c-scroll";
        let $first = $t.children('li:first');
        $first.animate({
          height:0
        }, 1000, function() {
          $first.css('height', '30px');
          $first.appendTo($first.parent())
        })
      } else {
        this.scrollClass = "screen-right-c";
      }
    }
  }
}
</script>