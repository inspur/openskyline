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
        <div>{{$t('base.network')}}(IPv4)</div>
      </div>
      <div class="screen_b_part_c">
        <el-row style="height: 100%;">
          <el-col :span="15" style="height: 100%;">
            <IEcharts :option="option" style="height:100%;"></IEcharts>
          </el-col>
          <el-col :span="9" style="height: 100%;">
            <div class="screen-right-c">
              <div>
                <div><span class="network-used"></span>{{$t('base.used')}}：{{netWorkIPUsed}}</div>
              </div>
              <div>
                <div><span class="network-notused"></span>{{$t('base.notUsed')}}：{{netWorkIPNotUsed}}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
  </div>
</template>
<script>
import IEcharts from 'vue-echarts-v3/src/full.js';
export default {
  name:"",
  components:{
    IEcharts
  },
  data() {
    return {
      netWorkIPNotUsed:"",
      netWorkIPUsed:"",
      option:{
        color:['#ff8a00', "#4cc127"],
        tooltip : {
          show:true,
          formatter:function(params, ticket, callback) {
            return params.name+":"+params.percent+'%';
          }
        },
        calculable : false,
        series : [{
          type: 'pie',
          radius : ['50%', '80%'],
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
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods:{
    getData() {
      let me = this;
      let pid = me.$cookie.get('pid');
      let url = "api/neutron/v2.0/inspur/statistic-network/get_statistic_network";
      if (Vue.roleType!="0") {
        url = "api/neutron/v2.0/inspur/statistic-network/get_statistic_network?project_id="+pid;
      } else {
        url = "api/neutron/v2.0/inspur/statistic-network/get_statistic_network";
      }
      this.$ajax({
        type: 'get',
        url: url,
        errorKey: "NeutronError",
        successFun(data) {
          me.option.series[0].data = [{
            value:data.used_ipv4_sum,
            name:Vue.t('base.used')
          }, {
            value:data.total_ipv4_sum - data.used_ipv4_sum,
            name:Vue.t('base.notUsed')
          }]
          me.netWorkIPNotUsed = data.total_ipv4_sum - data.used_ipv4_sum;
          me.netWorkIPUsed = data.used_ipv4_sum;
        }
      });
      setTimeout(() => {
        this.getData();
      }, 10000)
    }
  }
}
</script>
