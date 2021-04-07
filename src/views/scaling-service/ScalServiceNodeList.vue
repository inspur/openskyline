<template>
<div><!-- 节点详情 -->
<el-form ref="scalingNodeForm" label-width="100px">
<el-row><el-col :span="10" class="titlespan"><span>{{$t('scalingService.nodeList')}}</span></el-col></el-row>
<el-row :gutter="20"><div class="divider clearfix"></div></el-row>
<el-table
    ref="nodeTable"
    :data="tableData"
    highlight-current-row
    stripe
    border
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @current-change="toggleRowSelection"
    :row-key="getRowKeys"
    :expand-row-keys="expandKeys"
    :default-sort="{prop: 'name', order: 'descending'}"
    @selection-change="handleSelectionChange" @sort-change="sortChange">
    <el-table-column type="expand" align="center" width="55">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
          <el-row><el-col :span="10" class="titlespan"><span>{{$t('scalingService.instanceInfo')}}</span></el-col></el-row>
          <el-row :gutter="20"><div class="divider clearfix"></div></el-row>
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">{{$t('lang.name')}}:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
	          <span>{{instanceName}}</span> 
	        </el-col>
	      </el-row> 
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">ID:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
	          <span>{{instanceId}}</span> 
	        </el-col>
	      </el-row>
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">{{$t('lang.status')}}:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
          <template>
            <span v-if="vmStatusRender(instanceStatus) === '-' ">-</span>
            <el-tag v-else :type="vmStatusTagRender(instanceStatus)">
            <span v-html="vmStatusRender(instanceStatus)"></span>
            </el-tag>
          </template> 
	        </el-col>
	      </el-row> 
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">{{$t('scalingService.ipAddress')}}:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
          <template>
	          <span v-html="ipAddressRender(instanceIp)"></span>
          </template>
	        </el-col>
	      </el-row> 
          <el-row><el-col :span="10" class="titlespan"><span>{{$t('scalingService.instanceSpec')}}</span></el-col></el-row>
          <el-row :gutter="20"><div class="divider clearfix"></div></el-row>
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">{{$t('scalingService.specName')}}:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
	          <span>{{instanceType}}</span> 
	        </el-col>
	      </el-row>
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">CPU:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
	          <span>{{instanceCpu}}{{$t('scalingService.core')}}</span>
	        </el-col>
	      </el-row> 
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">{{$t('scalingService.memory')}}:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
            <span>{{instanceRam>=1024?(instanceRam/1024).toFixed(2) + " GB":instanceRam + " MB"}}</span>
	        </el-col>
	      </el-row> 
	      <el-row :gutter="20">
	        <el-col :span="5">
	          <span class="formspan">{{$t('scalingService.disk')}}:</span>
	        </el-col>
	        <el-col :span="10" class="contentspan">
	          <span>{{instanceDisk}} GB</span> 
	        </el-col>
	      </el-row> 
          </el-form>
        </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('lang.name')"
      align="left"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
          <!--<el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>-->
          <span>{{scope.row.name}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('physical_id') >= 0"
      prop="physical_id"
      align="left"
      :label="$t('scalingService.physicalId')"
      min-width="120">
      <template slot-scope="scope">
        <span>{{scope.row.physical_id}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('cluster_id') >= 0"
      prop="cluster_id"
      align="left"
      :label="$t('scalingService.clusterId')"
      min-width="120">
      <template slot-scope="scope">
        <span>{{scope.row.cluster_id}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
      prop="status"
      align="left"
      :label="$t('lang.status')"
      min-width="80">
       <template slot-scope="scope">
        <span v-if="statusRender(scope.row.status, scope.row)==='-'">-</span>
        <el-tag v-else :type="statusTagRender(scope.row.status)">
          <span v-html="statusRender(scope.row.status, scope.row)"></span>
        </el-tag>
      </template> 
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('status_reason') >= 0"
      prop="status_reason"
      align="left"
      :label="$t('scalingService.statusReason')"
      min-width="100">
      <template slot-scope="scope">
        <span>{{scope.row.status_reason}}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('init_at') >= 0"
      prop="init_at"
      align="left"
      :label="$t('lang.createTime')"
      min-width="80">
      <template slot-scope="scope">
        <span v-html="dateRender(scope.row.init_at, scope.row)"></span>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('updated_at') >= 0"
      prop="updated_at"
      align="left"
      :label="$t('lang.updatedTime')"
      min-width="80"> 
      <template slot-scope="scope">
        <span v-html="dateRender(scope.row.updated_at, scope.row)"></span>
      </template>   
    </el-table-column>
  </el-table>
 </el-form>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover> 
      </el-col>
      <el-col :span="19">
      <page :totalData="totalData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
      </el-col>
    </el-row>
    </div>
</div>
</template>
<script>
  export default {
    name: 'ScalServiceNodeList',
    props:["clusterId", "projectId"],
    data () {
      return {
      sortObj:{
        sortOrder:"descending",
        sortField:"name"
      },
      instanceId: "",
      instanceName: "",
      instanceHost: "",
      instanceStatus: "",
      instanceType: "",
      instanceCpu: "",
      instanceRam: "",
      instanceDisk: "",
      instanceIp: "",
      columnsChecked:["name", "physical_id", "cluster_id", "status", "status_reason", "init_at", "updated_at"],
      columns:[{
        prop:"name",
        label:this.$t('lang.name')
      }, {
        prop:"physical_id",
        label:this.$t('scalingService.physicalId')
      }, {
        prop:"cluster_id",
        label:this.$t('scalingService.clusterId')
      }, {
        prop:"status",
        label:this.$t('lang.status')
      }, {
        prop:"status_reason",
        label:this.$t('scalingService.statusReason')
      }, {
        prop:"init_at",
        label:this.$t('lang.createTime')
      }, {
        prop:"updated_at",
        label:this.$t('lang.updatedTime')
      }],
        totalData: [],
        tableData: [],
        getRowKeys(row) {
          return row.id;
        },
        expandKeys: [],
        multipleSelection: [],
        operateMore: true,
        listPara:{
          page:1,
          pageSize:10
        },
        loading:false,
        currentPage:1,
        pageSize:10,
        pageSizes:[10, 50, 200],
        total:1
      };
    },
    computed: {
    },
    mounted () {
      this.getNodesList();
    },
    beforeRouteLeave (to, from, next) {
      next()
    },
    beforeRouteEnter (to, from, next) {
      next()
    },
    methods: {
    sortChange(column) {
       var self = this;
       if (!column.prop) { return; }
       self.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    async getNodesList() {
      var self = this;
      var roleType = Vue.roleType + "";
      var url = "api/senlin/v1/nodes?global_project=true&cluster_id="+ self.clusterId;
      if ("2" == roleType || "3" == roleType) { //项目
        url = "api/senlin/v1/nodes?cluster_id="+ self.clusterId;
      }
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url
        });
        self.loading = false;
        self.totalData = result['nodes'];
       // self.tableData = result['nodes'];
        self.total = result['nodes'].length;
      } catch (res) {
        self.loading = false;
        //self.$message.error('获取失败!');
      }
    },
    rowNameClick(rowIndex, rowData) {
       // this.detailFlag = true;
    },
    rowClick(row) {
      this.$refs.nodeTable.toggleRowSelection(row);
    },
    async toggleRowSelection(row) {
      var self = this;
      self.instanceId = "-";
      self.instanceName = "-";
      self.instanceHost = "-";
      self.instanceStatus = "-";
      self.instanceIp = "-";
      self.instanceType = "-";
      self.instanceCpu = "-";
      self.instanceRam = "-";
      self.instanceDisk = "-";
      self.expandKeys = [];
      self.expandKeys.push(row.id);
      var uuid = row.physical_id;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/servers/'+ uuid
        });
        if (result["server"]) {
          let instance = result["server"];
          self.instanceId = instance["id"];
          self.instanceName = instance["name"];
          self.instanceHost = instance["OS-EXT-SRV-ATTR:hypervisor_hostname"];
          self.instanceStatus = instance["status"];
          self.instanceIp = instance["addresses"];
          let flavorOj = instance["flavor"];
          var flavorId = flavorOj["id"];
          self.flavorRender(flavorId);
        } else {
          return;
        }
      } catch (res) {
        //self.$message.error('获取失败!');
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.tableData = this.getData(val);
      console.log(`当前页: ${val}`);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.getNodesList();
    },
    async flavorRender(value) {
       var self = this;
       var uuid = value;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/flavors/" + uuid
        });
        let flavor = result["flavor"];
        self.instanceType = flavor["name"] || "-";
        self.instanceCpu = flavor["vcpus"] || "-";
        self.instanceRam = flavor["ram"] || "-";
        self.instanceDisk = flavor["disk"] || "-";
     } catch (res) {}
    },
    ipAddressRender(value) {
      var address = value;
      if (address == "-") {
        return "-";
      }
      var list = Object.keys(address).map(function(el) {
          return address[el];
      });
      if (list != null) {
        var ipValue = "";
        if (list.length > 1) {
          for (let a in address) {
            if (address[a].length > 0) {
              for (let n = 0; n < address[a].length; n++) {
                  var net = address[a][n];
                  var type = net['OS-EXT-IPS:type'];
                  if (type == "floating") {
                    ipValue += "<br>" + a + this.$t('scalingService.floatIp') + "<br>" + net.addr || "";
                  } else {
                    ipValue += "<br>" + a + "<br>" + net.addr || "";
                  }
              }
            }
          }
          if (ipValue != "") {
             ipValue = ipValue.substring(4, ipValue.length);
          }
        } else {
           for (let b in address) {
            if (address[b].length > 0) {
              for (let v = 0; v < address[b].length; v++) {
                  var type2 = address[b][v]['OS-EXT-IPS:type'];
                  if (type2 == "floating") {
                    ipValue += "<br>" + address[b][v].addr + this.$t('scalingService.floatIp');
                  } else {
                    ipValue += "<br>" + address[b][v].addr || "";
                  }
              }
            }
              break;
           }
           if (ipValue != "") {
             ipValue = ipValue.substring(4, ipValue.length);
          }
        }
          return ipValue;
      } else {
        return "-";
      }
    },
    statusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("DELETING" == status || status == 'PREDELETING') {
           return "gray";
        } else if ("WARNING" == status || "CRITICAL" == status || "ERROR" == status) {
           return "danger";
        } else if ("INIT" == status || "RECOVERING" == status || "OPERATING" == status) {
           return "info";
        } else if ("CREATING" == status || "RESIZING" == status || "UPDATING" == status || "CHECKING" == status) {
           return "info";
        } else {
          return "";
        }
    },
    statusRender(value, rowData) {
       if (value == "INIT") {
           return this.$t('scalingService.init');
       } else if (value == "ACTIVE") {
           return this.$t('scalingService.available');
       } else if (value == "ERROR") {
           return this.$t('scalingService.error');
       } else if (value == "CRITICAL") {
           return this.$t('scalingService.critical');
       } else if (value == "WARNING") {
           return this.$t('scalingService.warning');
       } else if (value == "CREATING") {
           return this.$t('scalingService.creating');
       } else if (value == "UPDATING") {
           return this.$t('scalingService.updating');
       } else if (value == "RESIZING") {
           return this.$t('scalingService.resizing');
       } else if (value == "DELETING" || value == "PREDELETING") {
           return this.$t('scalingService.deleting');
       } else if (value == "CHECKING") {
           return this.$t('scalingService.checking');
       } else if (value == "RECOVERING") {
           return this.$t('scalingService.recovering');
       } else if (value == "OPERATING") {
           return this.$t('scalingService.operating');
       } else {
           return "-";
       }
    },
    vmStatusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("SHUTOFF" == status || "PAUSED" == status) {
           return "gray";
        } else if ("BUILD" == status || "PASSWORD" == status) {
           return "info";
        } else if ("DELETED" == status || "SOFT_DELETED" == status || "ERROR" == status || "UNKNOW" == status) {
           return "danger";
        } else if ("SUSPENDED" == status) {
           return "warning";
        } else if ("HARD_REBOOT" == status || "REBOOT" == status || "MIGRATING" == status || "RESCUE" == status || "REVERT_RESIZE" == status || "REBUILD" == status || "SHELVED" == status || "SHELVED_OFFLOADED" == status || "VERIFY_RESIZE" == status) {
           return "info";
        } else {
          return "";
        }
    },
    vmStatusRender(value) {
      if (value == "BUSY") { //自定义状态,删除“软删除”和“已删除”状态
        return "<i class='el-icon-loading'></i>";
      } else if (value == "ACTIVE") {
        return this.$t('calcStorLang.running');
      } else if (value == "BUILD") {
        return this.$t('calcStorLang.build');
      } else if (value == "ERROR") {
        return this.$t('calcStorLang.error');
      } else if (value == "REBOOT") {
        return this.$t('calcStorLang.reboot');
      } else if (value == "HARD_REBOOT") {
        return this.$t('calcStorLang.hard_reboot');
      } else if (value == "PAUSED") {
        return this.$t('calcStorLang.paused');
      } else if (value == "MIGRATING") {
        return this.$t('calcStorLang.migrating');
      } else if (value == "PASSWORD") {
        return this.$t('calcStorLang.password');
      } else if (value == "REBUILD") {
        return this.$t('calcStorLang.rebuild');
      } else if (value == "RESCUE") {
        return this.$t('calcStorLang.rescue');
      } else if (value == "REVERT_RESIZE") {
        return this.$t('calcStorLang.revert_resize');
      } else if (value == "SHELVED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHELVED_OFFLOADED") {
        return this.$t('calcStorLang.shelved_offloaded');
      } else if (value == "SHUTOFF") {
        return this.$t('calcStorLang.closed');
      } else if (value == "SUSPENDED") {
        return this.$t('calcStorLang.suspended');
      } else if (value == "UNKNOW") {
        return this.$t('calcStorLang.unknow');
      } else if (value == "VERIFY_RESIZE") {
        return this.$t('calcStorLang.verify_resize');
      } else {
        return "-";
      }
    },
    dateRender(value, rowData) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    /**
     * 将时间戳格式化的方法
     * @param timeStamp时间戳值
     * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
     * @returns
     */
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    }
    }
  }
</script>
<style scoped>
  .titlespan {
    font-size: 20px;
    text-align: left;
  }
  .formspan {
    font-weight:bold;
    float:right;
  }
  .contentspan {
    text-align: left;
  }
</style>