<template>
  <div style="height: 100%;width:100%;position: relative;">
    <table class="table-head">
      <tr>
        <th style="width:20%;">{{$t('base.resouceType')}}</th>
        <th style="width:20%;">{{$t('base.desc')}}</th>
        <th style="width:20%;">{{$t('base.instanceNum')}}</th>
        <th style="width:20%;">{{$t('base.warnInstanceNum')}}</th>
      </tr>
    </table>
    <div class="table-body-c" id="tbody">
      <div>
        <ul class="ul-c">
          <template v-for="row in tableData">
            <li :style="row.style">
              <div>{{row.resource_sc_name}}</div>
              <div>{{row.resource_sc_detail}}</div>
              <div>{{row.resource_num}}</div>
              <div>{{row.alert_num}}</div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name:"alertMessage",
  data() {
    return {
      roleType: Vue.roleType + '',
      tableData:[]
    }
  },
  mounted() {
    this.getAlertData();
    setInterval(() => {
      this.scroll();
    }, 2000)
  },
  methods:{
    getAlertData() {
      let me = this;
      me.$ajax({
        type: 'get',
        url: "api/pluto/v1/alert/subclasses",
        successFun(data) {
          if (me.roleType == '2') {
            const projectAdminResource = ['openstack_instance'];
            data.subclasses.subclass_list = data.subclasses.subclass_list.filter(item => projectAdminResource.includes(item.resource_sc_name_en));
          }
          data.subclasses.subclass_list.forEach((item) => {
            if (item.alert_num&&item.alert_num>0) {
              item.style = {color:'#f94444'}
            } else {
              item.style = {color:"#4fad29"}
            }
            item.alert_num = item.alert_num
          })
          data.subclasses.subclass_list.forEach((item) => {
            item.resource_sc_name = Vue.config.lang == "zh-cn"?item.resource_sc_name_cn:item.resource_sc_name_en;
            item.resource_sc_detail = Vue.config.lang == "zh-cn"?item.resource_sc_detail_cn:item.resource_sc_detail_en;
          })
          me.tableData = data.subclasses.subclass_list;
        }
      });
      setTimeout(() => {
        this.getAlertData();
      }, 10000)
    },
    scroll() {
      let $t = $("#tbody");
      let $li = $("#tbody").find('li:first');
      let eheight = $li.height();
      let height = this.tableData.length*($li.height());
      if ($t.height()<height) {
        let $first = $("#tbody").find('li:first');
        $first.animate({
          height:0
        }, 1000, function() {
          $first.css('height', eheight);
          $first.appendTo($first.parent())
        })
      }
    }
  }
}
</script>