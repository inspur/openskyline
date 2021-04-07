<template>
  <el-dialog
    :title="$t('task.selectCloudHost')"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false">
    <div v-loading="loading">
      <el-form :inline="true" class="form-inline">
        <el-form-item :label="$t('lang.name')" class="" >
          <el-input  size="small" v-model="queryName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon='fa-search' size="small" @click="queryServerTable">{{$t('lang.query')}}</el-button>
        </el-form-item>
      </el-form>
      <el-table 
        ref="serverTable" 
        :data="totalData"
        highlight-current-row
        border
        stripe
        style="width: 100%"
        row-key="id">
        <el-table-column 
          prop="name" 
          :label="$t('lang.name')"
          align="center" 
          min-width="100">
        </el-table-column>
        <el-table-column 
          prop="status" 
          :label="$t('lang.status')" 
          align="center" 
          min-width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTagRender(scope.row.status)">
              <span v-html="statusRender(scope.row.status, scope.row)"></span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          :label="$t('task.operate')" 
          align="center" 
          min-width="100">
          <template slot-scope="scope">
            <el-button @click.native.prevent="addtoMember(scope.row)" type="text" size="small">{{$t('task.add')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="24">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total" />
          </el-col>
        </el-row>
      </div>
    </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "WorkFlowCreateTriggerTaskVm",
    props:["taskType"],
    data() {
      return {
        queryName: "",
        totalData: [],
        dialogVisible: false,
        markerList: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        loading: false
      }
    },
    methods: {
      initDialog() {
        var self = this;
        self.dialogVisible = true;
        self.queryName = "";
        self.loadData();
      },
      async loadData(name="", page=1) {
        let $this = this;
        try {
          $this.loading = true;
          let roleType = Vue.roleType + "";
          let url = "api/nova/v2.1/servers-inspur/detail?status=ACTIVE&status=SHUTOFF&project_id="+$this.$cookie.get("pid");
          let params = {
            'not-tags': encodeURIComponent('@')
          }
          if (name !== '') {
            params.name = name;
          }
          if (page > 1 && $this.markerList.length > page - 2) {
            params['marker'] = $this.markerList[page - 2];
          } else {
            delete params['marker'];
          }
          params['limit'] = $this.pageSize;
          url += '&' + Object.keys(params).map(key => {
            return `${key}=${params[key]}`
          }).join('&');
          let res = await $this.$ajax({
            type: "GET",
            url: url,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.67
            }
          });
          let servers = res["servers"];
          let totalData = [];
          for (let i = 0; i < servers.length; i++) {
            let vm = servers[i];
            let instance = {};
            instance.id = vm["id"];
            instance.name = vm["name"];
            instance.status = vm["status"];
            instance.metadata = vm["metadata"];
            instance.image = vm["image"];
            let addresses = vm["addresses"];
            let ips = [];
            let addressesSize = 0;
            for ( let key in addresses) {
              addressesSize++;
              let a = addresses[key];
              instance.address = a[0]["addr"];
              if (a.length === 1) {
                ips.push(a[0]["addr"]);
              } else {
                for (let j = 0; j < a.length; j++) {
                  ips.push({"name":a[j]["addr"], "id":a[j]["addr"]});
                }
              }
            }
            instance.addresses = ips;
            totalData.push(instance);
          }
          $this.totalData = totalData;
          if ('all_instances_info' in res) {
            $this.markerList = res.all_instances_info.marker_list;
            $this.total = res.all_instances_info.total_instances;
          }
          $this.loading = false;
        } catch (e) {
          $this.loading = false;
        }
      },
      handleSizeChange(val) {
        const $this = this;
        $this.pageSize = val;
        $this.queryServerTable();
      },
      handleCurrentChange(val) {
        const $this = this;
        $this.currentPage = val;
        $this.loadData($this.queryName, val);
      },
      async addtoMember(row) {
        let self = this;
        if (this.taskType=="std.create_instance_backup"&&row.metadata&&row.metadata.source_type=="snapshot") { //来源为云主机快照，如果创建云主机使用的是0kb快照，需要给出提示，不允许对来源为0kb的云主机快照执行自动快照
          let ret = await self.$ajax({
            type: "GET",
            url: "api/glance/v2/images/"+row.image.id
          });
          if (ret.size<=0) {
            self.$message({
              showClose: true,
              message: Vue.t('task.prompt1'),
              type: 'warning'
            });
            return;
          }
        }
        let resultData = {};
        resultData.resourceId = row["id"];
        resultData.resourceName = row["name"];
        self.$emit("handleAddShow2", resultData);
      },
      queryServerTable() {
        const $this = this;
        let name = $this.queryName;
        if (name !== '') {
          if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(name)) {
            $this.$message.error($this.$t('validation.onlyLetter_MinusNumberChinese'));
            return;
          }
        }
        if ($this.currentPage === 1) {
          $this.loadData(name, 1);
        } else {
          $this.currentPage = 1;
        }
      },
      serverIpRender(fixedips) {
        let ipstring = "";
        if (fixedips.length > 1 ) {
          for (let i = 0; i < fixedips.length; i++) {
            if (fixedips.length === i+1) {
              ipstring += fixedips[i].name;
            } else {
              ipstring += fixedips[i].name + ",  ";
            }
          }
        } else {
          ipstring = fixedips[0];
        }
        return ipstring;
      },
      statusTagRender(status) {
        if ("ACTIVE" == status) {
           return "success";
        } else if ("SHUTOFF" == status) {
           return "gray";
        } else if ("BUILD" == status) {
           return "";
        } else if ("DELETED" == status || "SOFT_DELETED" == status || "ERROR" == status || "UNKNOW" == status) {
           return "danger";
        } else if ("SHUTOFF" == status) {
           return "info";
        } else if ("SUSPENDED" == status) {
           return "warning";
        } else if ("HARD_REBOOT" == status || "REBOOT" == status || "MIGRATING" == status || "RESCUE" == status || "REVERT_RESIZE" == status || "REBUILD" == status) {
           return "primary";
        } else {
          return "";
        }
      },
      statusRender(value, rowData) {
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
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      }
    }
  }
</script>
<style scoped>

</style>