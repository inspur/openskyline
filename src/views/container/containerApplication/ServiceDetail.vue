<template>
  <div>
    <div class="text-regular module-desc">
      <span>{{$t('container.serviceTabNote')}}</span>
    </div>
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="service in serviceList" :title="service.name" :name="service.name" :key="service.name">
        <el-form ref="serviceInfoForm" v-loading="loading" :model="serviceInfoForm" label-width="170px" label-position="left" class="me-form" style="text-align:left;">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="even">
                  <th class="idatath" style="width:20%">{{$t('lang.name')}}</th>
                  <td class="idatatd" style="width:80%">{{service.name}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath" style="width:20%">{{$t('container.accessType')}}</th>
                  <td class="idatatd" style="width:80%">{{service.service_type}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.createTime')}}</th>
                  <td class="idatatd">{{tzTimeFormatter(service.creationTimestamp)}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{$t('container.portList')}}</span>
          </div>
          <el-table
            ref="table"
            :data="service.portData"
            v-loading="loading"
            :element-loading-text="$t('lang.loading')"
            highlight-current-row
            stripe
            :default-sort = "{prop: 'name', order: 'ascending'}"
            row-key="name">
            <el-table-column
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name"
              :label="$t('container.portName')"
              show-overflow-tooltip
              min-width="100" align="left">
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('protocol') >= 0"
              prop="protocol"
              :label="$t('container.protocol')"
              show-overflow-tooltip
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('targetPort') >= 0"
              prop="targetPort"
              :label="$t('container.containerPort')"
              show-overflow-tooltip
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('nodePort') >= 0"
              prop="nodePort"
              :label="$t('container.outPort')"
              show-overflow-tooltip
              align="left"
              min-width="100">
            </el-table-column>
          </el-table>
        </el-card>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
  export default {
    name: 'ServiceDetail',
    data () {
      return {
        serviceInfoForm: {
          name:'',
          service_type:'',
          creationTimestamp:''
        },
        appName:this.$route.params.appName,
        nameSpace:this.$route.params.nameSpace,
        type:this.$route.params.type,
        rancherClusterId:this.$route.params.rancherClusterId,
        serviceList:[],
        serviceName:"",
        serverIp:"",
        activeNames:[],
        tzTimeFormatter:this.$tzTimeFormatter,
        loading:false,
        total: 0,
        columns: [],
        columnsChecked:["name", "port", "protocol", "nodePort", "targetPort"],
        tableData: [],
        totalData:[],
        multipleSelection: []
      };
    },
    watch: {
      columnsChecked: {
        handler: function (rows, oldVal) {
         this.columnsChecked = rows;
        },
        deep: true
      }
    },
    mounted () {
      this.getServiceDetail();
    },
    methods: {
      async getServiceDetail() {
        let self = this;
        try {
          self.activeNames = [];
          self.serviceList = [];
          self.loading = true;
          let svcResponse = await self.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_services',
            data:JSON.stringify({
              app_name:self.appName,
              app_type:self.type,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            }),
            success: function(data) {
              self.loading = false;
              let items = data.items;
              for (let i=0; i<items.length; i++) {
                let obj = items[i];
                let service = {name:"", type:"", creationTimestamp:"", portData:[], total:0};
                service.name = obj["metadata"].name;
                self.activeNames.push(service.name );
                service.creationTimestamp = obj["metadata"].creationTimestamp;
                let ports = obj["spec"]["ports"] || [];
                service.portData = ports;
                if (ports.length > 0) {
                  if (ports[0].hasOwnProperty("nodePort")) {
                    service.service_type = Vue.t('container.outerAccess');
                  } else {
                    service.service_type = Vue.t('container.innerAccess');
                  }
                } else {
                  service.service_type = "-";
                }
                service.total = ports.length;
                self.serviceList.push(service);
              }
            },
            errFun:(xhr, status, msg) => {
              self.loading = false;
            }
          });
          self.loading = false;
        } catch (data) {
          self.loading = false;
        }
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //刷新
      onRefresh() {
        this.getServiceDetail();
      },
      outPortRender(val) {

      }
    }
  }
</script>