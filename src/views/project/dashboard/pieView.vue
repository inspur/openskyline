<template>
  <div style="height:160px;width:100%">
    <IEcharts :option="pie"></IEcharts>
  </div>
</template>
<script>
    export default {
      data() {
        return {
          pie: {
            series : [{
              name:"",
              type:'pie',
              center:["50%", "50%"],
              radius : ["50%", "80%"],
              label:{
                normal:{
                  show:true,
                  position:'center'
                }
              },
              labelLine:{
                show:false
              },
              itemStyle:{
                normal:{
                  color:"grey"
                }
              },
              data:[{value:10, name:"10"}]
          }]
        }
      }
    }
    }
</script>
