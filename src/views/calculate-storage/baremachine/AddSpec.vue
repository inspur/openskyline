<template>
  <el-dialog :title="$t('calcStorLang.bareSpec')" :visible.sync="dialogVisible" :before-close="handleClose" label-width="100px">
    <el-form ref="addResSpecForm" :model="spec" label-width="100px" :rules="rules">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <label style='margin-left:-50px;'>Bare@ </label><el-input v-model="spec.name" class="col-10"></el-input>
         <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.addBareSpecTip')">
        <i class="el-icon-fa-question-circle"></i>
      </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.WAY_CREATION')" class="is-required"  v-if="roleType == '0'">
        <el-radio-group v-model="spec.type" @change="phyTypeSel">
          <el-radio class="radio" label="1">{{$t('calcStorLang.FROM_BAREMETAL')}}</el-radio>
          <el-radio class="radio" label="2">{{$t('calcStorLang.createInstManual')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="" class="is-required" v-show="spec.type == '1'">
        <el-input :placeholder="$t('calcStorLang.bareMetals') + $t('lang.name')" size="small" class="col-10" v-model="hostName"></el-input>
        <el-button type="primary" icon='fa-search' size="small"  @click="searchHost">{{$t('lang.query')}}</el-button>
        <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}" @sort-change="sortChange">
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="50" sortable="custom">
            <template slot-scope="scope">
              <span v-html="scope.row.name"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('cpus') >= 0" prop="cpus" :label="$t('calcStorLang.cpuCore')" min-width="80" sortable="custom">
            <template slot-scope="scope">
              <span v-html="cpuUsedRender(scope.row.cpus)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('local_gb') >= 0" prop="local_gb" :label="$t('calcStorLang.ROOT_DISK')" min-width="80" sortable="custom">
            <template slot-scope="scope">
              <span v-html="memUsedRender(scope.row.local_gb)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('memory_mb') >= 0" prop="memory_mb" :label="$t('calcStorLang.memory')" min-width="80" sortable="custom">
            <template slot-scope="scope">
              <span v-html="diskUsedRender(scope.row.memory_mb)"></span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
              </el-popover>
            </el-col>
            <el-col :span="24">
              <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
            </el-col>
          </el-row>
        </div>
      </el-form-item>
      <template v-if="spec.type == '2'">
        <el-form-item label="CPU" class="is-required" prop="cpu">
          <el-input v-model="spec.cpu" class="col-10"></el-input>&nbsp;
          <span>{{$t('calcStorLang.core')}}</span>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.memory')" class="is-required" prop="memory">
          <el-row>
            <el-input v-model="spec.memory" class="col-10" v-if="unitMem=='0'"></el-input>
            <el-select v-model="spec.memory" class="col-10" v-if="unitMem=='1'">
              <el-option label="64" value="64"></el-option>
              <el-option label="128" value="128"></el-option>
              <el-option label="256" value="256"></el-option>
              <el-option label="512" value="512"></el-option>
            </el-select>
            <el-select v-model="unitMem" class="col-3" @change="unitType">
              <el-option label="G" value="0"></el-option>
              <el-option label="M" value="1"></el-option>
            </el-select>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.disk')" class="is-required" prop="disk">
          <el-input v-model="spec.disk" class="col-10"></el-input>&nbsp;G
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmAddSpec" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'AddSpec',
  props: ['resOperType', 'specUuid'],
  data() {
    return {
      columns: [],
      tableData: [],
      queryParam: {
        "page": 1,
        "pageSize": 5,
        field: "",
        dir: ""
      },
      columnsChecked: ['name', 'cpus', 'local_gb', 'memory_mb'],
      multipleSelection: [],
      totalData: [],
      hostList: [],
      hostName: '',
      nodeHostName: '',
      bareUUID: '',
      roleType: Vue.roleType + "",
      spec: {
        name: '',
        cpu: '',
        memory: '',
        disk: '',
        type: '1'
      },
      unitMem:'0',
      dialogVisible: false,
      saving: false,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        cpu: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2147483647 }
        ],
        memory: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2094151 }
        ],
        disk: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'min', value: 1 },
          { type: 'max', value: 2147483647 }
        ]
      }
    }
  },
  mounted() {
    this.initForm = Object.assign({}, this.addResSpecForm);
    this.ruleStore = Object.assign({}, this.rules);
    this.initDialog();
    if (this.resOperType === 2) { //edit
       this.initData();
    }
    if (this.roleType === "0") {
      this.initHostList();
    }
  },
  methods: {
    memUsedRender(value, rowData) {
      return value + "GB";
    },
    diskUsedRender(value, rowData) {
      return formatFileSize(value, "MB");
    },
    cpuUsedRender(value, rowData) {
      return value;
    },
    sortChange(column) {
      const self = this;
      let key = column.prop;
      let keyOrder = column.order;
      if (keyOrder != null && self.totalData != null) {
        if (key == "cpus" || key == "local_gb" || key == "memory_mb") {
          self.totalData.sort(this.$sortFormatter(key, keyOrder, "integer"));
        } else {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
        }
      }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      if (val != null) {
        let list = [];
        list.push(val);
        this.multipleSelection = list;
        this.nodeHostName = val['name'];
        this.bareUUID = val.uuid;
        this.spec.cpu = val.cpus;
        this.spec.disk = val.local_gb;
        this.spec.memory = val.memory_mb;
      }
    },
    onRefresh() {
      this.initHostList();
    },
    async initHostList() {
      let self = this;
      self.totalData = [];
      self.hostList = [];
      try {
        let result = await self.$ajax({
          type: 'get',
          headers: {
            "X-Openstack-Ironic-Api-Version": "latest"
          },
          url: 'api/ironic/v1/nodes/detail'
        });
        self.loading = false;
        let resList = result['nodes'];
        if (resList != null) {
          for (let h = 0; h < resList.length; h++) {
            let host = resList[h].properties;
            host.name = resList[h].name || "";
            host.uuid = resList[h].uuid;
            if (host.cpus && host.local_gb && host.memory_mb) {
              self.totalData.push(host);
              self.hostList.push(host);
            }
          }
        }
      } catch (res) {
        self.loading = false;
      }
    },
    searchHost() {
      let self = this;
      let rets = [];
      let name = self.hostName;
      if ( name != "") {
        for (let t = 0; t < self.hostList.length; t++) {
          let obj = self.hostList[t];
          if (obj.name.indexOf(name) != -1) {
            rets.push(obj);
          }
        }
        self.totalData = rets;
      } else {
        self.initHostList();
      }
    },
    phyTypeSel(value) {
      let self = this;
      this.multipleSelection = [];
      self.bareUUID = "";
      this.spec.cpu = "";
      this.spec.disk = "";
      this.spec.memory = "";
      if ("1" === value) {
        self.initHostList();
      }
    },
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    async initData() {
      var self = this;
      try {
            let ret = await this.$ajax({
              url: 'api/nova/v2.1/flavors/' + this.specUuid,
              type: 'get'
            });
            let result = ret['flavor'];
            this.spec.name = result['name'];
            this.spec.cpu = result['vcpus'];
            this.spec.memory = result['ram']/1024;
            this.spec.disk = result['disk'];
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
    },
    handleCancel() {
      this.$emit("handleShow", {});
    },
    handleClose(done) {
      this.$emit("handleShow", {});
      done();
    },
    unitType() {
      var self = this;
      self.spec.memory = '';
    },
    confirmAddSpec() {
      const self = this;
      this.$refs.addResSpecForm.validate(async(valid) => {
        if (valid) {
          if (self.spec.type === "1" && !self.multipleSelection.length) {
            self.$message({
              showClose: true,
              message: Vue.t('calcStorLang.instCreateChoosePhy'),
              type: 'warning'
            });
            return false;
          }
          let ram = 0;
          ram = this.spec.memory;
          if (this.unitMem == '0') {
            ram = this.spec.memory * 1024;
          }
          if (this.spec.type == '1') {
            ram = this.spec.memory;
          }
          this.loading = true;
          this.saving = true;
          let name = this.spec.name;
          let vcpus = this.spec.cpu;
          let disk = this.spec.disk;
          // let isShare = this.spec.isShare;
          let id = "";
          let url = "api/nova/v2.1/flavors";
          if (this.resOperType === 2) {
             id = this.specUuid;
             // url = "api/nova/v2/flavors/" + id + "/update";
          }
          let body = {"flavor": {"name": "Bare@" + name, "ram":ram, "vcpus":vcpus, "disk":disk}};
          body = JSON.stringify(body);
          try {
            let ret = await this.$ajax({
              url: url,
              data: body,
              type: 'post',
              successMsg: Vue.t("calcStorLang.successAdd") + Vue.t("calcStorLang.bareSpec") + "！",
              log: {
                description: {
                  en: "Add flavor:" + "Bare@" + name,
                  zh_cn: Vue.t("lang.addTo") + Vue.t("calcStorLang.bareSpec") + ":" + "Bare@" + name
                },
                target: Vue.logTarget.bareMachineSpec
              }
            });
            this.loading = false;
            this.saving = false;
            this.$emit("handleShow", {});
            this.$emit("getTestData");

            var extraspecs = {};
            extraspecs["capabilities:free_disk_mb"] = this.spec.disk*1024 + "";
            extraspecs["capabilities:vcpus_total"] = this.spec.cpu;
            extraspecs["capabilities:free_ram_mb"] = parseInt(this.unitMem) ? this.spec.memory : this.spec.memory * 1024 + "";
            if (this.spec.type == '1') {
              extraspecs["capabilities:free_ram_mb"] = this.spec.memory;
            }
            extraspecs["capabilities:hypervisor_type"] = "ironic";
            let url1 = "api/nova/v2.1/flavors/" + ret.flavor.id + "/os-extra_specs";
            let type1 = "POST";
            let body1 = {"extra_specs" : extraspecs};
            body1 = JSON.stringify(body1);
            self.loading = true;
            let ret1 = await this.$ajax({
              url: url1,
              data: body1,
              type: type1,
              log: {
                description: {
                  en: "Config:capabilities:hypervisor_type",
                  zh_cn: "裸机规格:" + ret.flavor.name + ",配置元数据:capabilities:hypervisor_type"
                },
                target: Vue.logTarget.bareMachineSpec
              }
            });
          } catch (data) {
            this.saving = false;
            this.loading = false;
            __DEV__ && console.error(data);
          }
        } else {
          return false;
        }
      });
    }
  }
}
</script>
