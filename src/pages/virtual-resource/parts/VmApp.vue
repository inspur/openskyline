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
        <div style="width: auto;padding: 0 10px;">{{$t('base.projectRes')}}TOP5</div>
      </div>
      <div class="screen_b_part_c" style="padding:40px 10px 15px 10px;">
        <div style="width:95%;margin:auto;height: 100%;">
          <IEcharts :option="option" style="height:100%;" v-if="service.pluto"></IEcharts>
          <div v-if="!service.pluto" style="height: 100%;width: 100%;color: #fff;text-align: center;line-height: 120px;">
            {{$t('base.plutoWarn')}}
          </div>
        </div>
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
      service:Vue.service,
      option:{
        tooltip : {
          show:true,
          formatter:function(params) {
            return params.name+":"+params.value;
          }
        },
        grid:{
          left:"0%",
          right:"0%",
          bottom:"0%",
          top:'6%',
          containLabel:true
        },
        yAxis:{
          type:'value',
          axisLabel:{
            color:"#fff"
          }
        },
        xAxis:{
          type:'category',
          data:[],
          axisLabel:{
            color:"#fff"
          }
        },
        series : [{
          type: 'bar',
          data:[]
        }]
      },
      colors:["#fe2524", "#fe8625", "#ffe826", "#42c44a", "#99999d"]
    }
  },
  mounted() {
    if (this.service.pluto && Vue.roleType=="0") {
      this.getData();
    }
  },
  methods:{
    getData() {
      let pid = this.$cookie.get('pid');
      let me = this;
      this.$ajax({
        type: 'get',
        url: "api/pluto/v1/monitor/project/vms/top",
        successFun(data) {
          let xarr = [];
          let yarr = [];
          data.tops.forEach((item, index) => {
            for (let key in item) {
              yarr.push({
                value:item[key],
                itemStyle:{
                  normal:{
                    color:me.colors[index]
                  }
                }
              });
              xarr.push(key);
            }
          })
          me.option.series[0].data = yarr;
          me.option.xAxis.data = xarr;
        }
      });
      setTimeout(() => {
        this.getData();
      }, 10000)
    }
  }
}
</script>