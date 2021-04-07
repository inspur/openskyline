<template>
  <el-dialog :title="$t('calcStorLang.applyPhysicalHost')" :visible.sync="visible" :before-close="hide">
    <!-- <el-col :span="12"> -->
    <el-form ref="applyPhysicalHostForm" class="me-required-form" :model="physicalHost" label-width="100px" :rules="rules" v-loading="loading"  label-position="left" :element-loading-text="submitFlg?$t('calcStorLang.dataSubmission'):$t('calcStorLang.dataLoading')">
     <el-form-item :label="$t('calcStorLang.bareMetals')" prop="project" class="is-required">
        <el-table ref="bareTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleCurrentChange" :default-sort="{prop: 'cpu', order: 'ascending'}" @sort-change="sortChange">
        <el-table-column v-if="columnsChecked.indexOf('cpu') >= 0" label="CPU" prop="cpu" min-width="50" sortable="custom">
          <template slot-scope="scope">
            {{scope.row.cpu}}{{$t('calcStorLang.core')}}
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('mem') >= 0" prop="mem" :label="$t('calcStorLang.memory')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            {{scope.row.mem/1024}}GB
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('disk') >= 0" prop="disk" :label="$t('calcStorLang.disk')" min-width="80" sortable="custom">
          <template slot-scope="scope">
            {{scope.row.disk}}GB
          </template>
        </el-table-column>
        <el-table-column v-if="columnsChecked.indexOf('count') >= 0" prop="count" :label="$t('calcStorLang.usableCount')" min-width="80" sortable="custom">
         <!--  <template slot-scope="scope">
            <span v-html="diskUsedRender(scope.row.local_gb, scope.row)"></span>
          </template> -->
        </el-table-column>
      </el-table>
      <div style="margin: 10px 0; position: relative">
        <el-row>
          <el-col :span="5">
            <!-- <el-button type="text" icon="fa-refresh" @click="onRefresh">
            </el-button>
            <span>当前选中 {{multipleSelection.length}}条</span> -->
            <!-- <el-popover placement="right" trigger="click">
              <el-checkbox-group class="vertical" v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
            </el-popover> -->
          </el-col>
          <el-col :span="24">
            <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
          </el-col>
        </el-row>
      </div>
      </el-form-item>
      <el-form-item :label="$t('lang.name')" prop="name" class="is-required">
        <el-input class="col-10" v-model="physicalHost.name" auto-complete="off"></el-input>
        <!--<el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.addPhysicalHostTip')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>-->
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.image')" prop="image" class="is-required">
        <el-select v-model="physicalHost.image" class="col-10" filterable clearable>
           <el-option v-for="item in imageOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.net')" prop="net" class="is-required">
        <el-select v-model="physicalHost.net" class="col-10" filterable clearable>
          <el-option v-for="item in netOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.az')" prop="domain" class="is-required">
        <el-select v-model="physicalHost.domain"  class="col-10" filterable clearable>
          <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
        </el-select>
      </el-form-item>
      <el-collapse class="col-24" v-if="hightConfigShow">
        <el-collapse-item :title="$t('calcStorLang.advanceOptions')" name="11" label-width="200px">
          <el-form-item :label="$t('calcStorLang.createInstLoginType')" class="">
            <el-radio-group v-model="physicalHost.defaultType" @change="keyPairType">
              <el-radio class="radio" :label="1">{{$t('calcStorLang.oldPassword')}}</el-radio>
              <el-radio class="radio" :label="3">{{$t('lang.resetPassword')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('lang.userName')" prop="userName" class="is-required" v-show="key2Flag">
            <el-input class="col-8" v-model="physicalHost.userName" auto-complete="off" disabled></el-input>
            <el-tooltip placement="top" trigger="hover" :content="$t('calcStorLang.createInstLoginTip1')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('lang.password')" prop="userPass" class="is-required" v-show="key3Flag">
            <el-input class="col-8" v-model="physicalHost.userPass" auto-complete="off" type="password"></el-input>
            <el-tooltip placement="top" trigger="hover" :content="$t('network.createInstLoginTip2')">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('lang.confirmPassword')" prop="userConfirmPass" class="is-required" v-show="key3Flag">
            <el-input class="col-8" v-model="physicalHost.userConfirmPass" auto-complete="off" type="password"></el-input>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="hide">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"physicalHost",
  data() {
    return {
      submitFlg: false,
      key2Flag: false,
      key3Flag: false,
      hightConfigShow: true,
      physicalHost:{
        name:"",
        image:"",
        net:"",
        domain:"",
        userName: 'Administrator/root',
        userPass: '',
        userConfirmPass: '',
        defaultType: 1
      },
      loading: false,
      saving: false,
      visible:false,
      soltFlag:false,
      maxCount: 1,
      rules: {
        name: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 40 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        image: [
          { type: 'required', trigger: 'blur change' }
        ],
        net: [
          { type: 'required', trigger: 'blur change' }
        ],
        domain: [
          { type: 'required', trigger: 'blur change' }
        ],
        userPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordLegal' }
        ],
        userConfirmPass: [
          { type: 'required', trigger: 'blur change' },
          { type: 'passwordEquals', context: this, value: "physicalHost.userPass" }
        ]
      },
      tableData:[],
      countpercentage:0,
      countproStatus:"success",
      percentage:0,
      proStatus:"success",
      netOptions: [],
      totalData:[],
      columnsChecked: ['cpu', 'mem', 'disk', 'count'],
      imageOptions: [],
      zoneOptions:[],
      multipleSelection:[]
    }
  },
  mounted() {
    var self = this;
    self.visible = true;
    self.loadNodesList();
    self.getImageOptions();
    self.initZones();
    Promise.all([self.loadProjectNetList(), self.loadSharedNetList()]).then(function(result) {
       var data1 = result[0];
       var data2 = result[1];
       var netsList = [];
       var nets = data1.concat(data2);
       for (let t = 0; t < nets.length; t++) {
          var netObj = nets[t];
          if ((netObj['admin_state_up'] + "") == "true") {
             netsList.push(netObj);
          }
       }
       self.netOptions = netsList;
   });
  },
  updated() {
    var self = this;
    if (self.physicalHost.defaultType == 1) {
      self.rules.userPass = [];
      self.rules.userConfirmPass = [];
      self.rules.userKey = [];
    } else {
      self.rules.userPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordLegal' }];
      self.rules.userConfirmPass = [{ type: 'required', trigger: 'blur change' }, { type: 'passwordEquals', context: this, value: "physicalHost.userPass" }];
      self.rules.userKey = [];
    }
  },
  methods:{
    keyPairType(value) {
      if (1 === value) {
        this.key2Flag = false;
        this.key3Flag = false;
        this.physicalHost.userPass = "";
        this.physicalHost.userConfirmPass = "";
      } else if (3 === value) {
        this.key2Flag = true;
        this.key3Flag = true;
      }
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.$emit("handleApplyShow", {});
    },
    async initZones() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/inspur-availability-zone/detail'
        });
        self.loading = false;
        var list = result['availabilityZoneInfo'];
        var zones = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var zone = list[z];
            var zoneState = zone['zoneState'];
            if (zone['zoneName'] != "internal" && zoneState['available'] == true) {
              var arr = self.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }
            }
          }
        }
        self.zoneOptions = zones;
        if (zones.length > 0) {
          self.projectCreateForm.domain = zones[0].zoneName || "";
        }
      } catch (res) {
        self.loading = false;
      }
    },
    loadZoneAndHostCompare(list) {
      var rets = [];
      for (var z in list) {
        var obj = list[z];
        if (z.indexOf("ironic") >= 0) {
          rets.push(z);
        }
      }
        return rets;
    },
    getListObj(list, id) {
      let r = [];
      for (let i in list) {
        if (list[i].id == id) {
          r.push(list[i]);
        }
      }
      return r;
    },
    async loadNodesList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/ironic/v1/nodes/detail'
        });
        let bares = result['nodes'];
        let bm = new Map();
        for (let i in bares) {
          if (("available" === bares[i].provision_state) && (!bares[i].maintenance)) {
            let no = bares[i].properties.cpus + "" + bares[i].properties.memory_mb + bares[i].properties.local_gb
            if (bm.get(no) == null) {
              var l = [];
              l.push(bares[i]);
              bm.set(no, l);
            } else {
              var li = bm.get(no);
              li.push(bares[i]);
              bm.set(no, li);
            }
          }
        }
        for (let [key, value] of bm) {
          var ll = value;
          self.totalData.push({
            cpu:ll[0].properties.cpus,
            mem:ll[0].properties.memory_mb,
            disk:ll[0].properties.local_gb,
            count:ll.length
          });
        }
      } catch (res) {
      }
    },
    async getImageOptions() {
      var self = this;
      var resultData = [];
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/glance/v2/images?limit=99999&status=active&tag=@"
        });
        let images = ret.images;
        for (var i = 0; i < images.length; i++) {
          let image = images[i];
          let name = image['name'];
          let size = image['size'];
          if ("snapshot" == image['image_type'] || "private" == image['visibility'] || name == null) {
            continue;
          }
          resultData.push({
            id: image['id'],
            name: name
          });
        }
        this.imageOptions = resultData;
      } catch (data) {
        self.loading = false;
      }
    },
    async loadProjectNetList() {
      var self = this;
      var url = 'api/neutron/v2.0/networks?project_id='+ this.$cookie.get("pid") + "&shared=false&not-tags=bm_deploy";
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        return result['networks'];
      } catch (res) {
        self.loading = false;
      }
    },
    async loadSharedNetList() {
       var self = this;
       self.loading = true;
       try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/neutron/v2.0/networks?shared=true&not-tags=bm_deploy',
          showErrMsg: true
        });
        self.loading = false;
        return result['networks'];
      } catch (res) {
        self.loading = false;
      }
    },
    handleCurrentChange(val) {
      this.multipleSelection = [];
      this.multipleSelection.push(val);
    },
    sortChange(column) {
       var self = this;
       var key = column.prop;
       var keyOrder = column.order;
       if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(this.$sortFormatter(key, keyOrder));
       }
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    confirmFun() {
      var self = this;
      this.submitFlg = true;
      this.$refs.applyPhysicalHostForm.validate(async(valid) => {
        if (valid) {
          let selected = self.multipleSelection;
          if (selected.length == 0) {
            self.$message(Vue.t("calcStorLang.pleaseChoose") + Vue.t("calcStorLang.bareMetalTip") + "！");
            return;
          }
          let cpu = selected[0].cpu;
          let mem = selected[0].mem;
          let disk = selected[0].disk;
          let name = self.physicalHost.name;
          let imageRef = self.physicalHost.image;
          let netList = self.getListObj(self.netOptions, self.physicalHost.net);
          var networks = [];
          var netType = "1";
          for (let n = 0; n < netList.length; n++) {
            var net = netList[n];
            var obj;
            if ("2" == netType) {
               obj = {"port": net.id};
            } else {
               obj = {"uuid": net.id};
            }
            networks.push(obj);
          }
          let zone = self.physicalHost.domain;
          let metadata = self.physicalHost.userPass ? {"admin_pass":self.physicalHost.userPass} : {};
          let adminPass = self.physicalHost.userPass || "";
          let body = {
            "server": {
              "name": name,
              "tags": ["@"],
              "imageRef": imageRef,
              "availability_zone": zone,
              "networks": networks,
              "metadata": metadata,
              "adminPass": adminPass,
              security_groups: [],
              "min_count": 1,
              "projectId":self.$cookie.get("pid"),
              "userId":Vue.userId,
              "cpu":cpu,
              "mem":mem,
              "disk":disk
            }
          }
          body = JSON.stringify(body);
          let applyData = {
            "applicant_id": Vue.userId,
            "op_desc": "",
            "order_data": body,
            "project_id": self.$cookie.get("pid"),

            "resource_type": "HOST.CREATE"
          };
          applyData = JSON.stringify(applyData);
          let logContent = {
              "description": {
                  "en": "Apply Instance:" + name,
                  "zh_cn": "申请云物理机" + name
              },
              "target": Vue.logTarget.computePhysical
          };
          let successMsg = Vue.t("calcStorLang.applySuccess");
          self.saving = true;
          try {
            let ret = await this.$ajax({
              url: "api/leo/v1/order/create_order",
              data: applyData,
              type: 'post',
              headers: {
                'X-OpenStack-Nova-API-Version': 2.19
              },
              successMsg: successMsg,
              log: logContent,
              errorKey: "badRequest"
            });
            self.saving = false;
            self.$message(Vue.t("calcStorLang.applySuccess"));
            self.$emit("handleApplyShow", {});
            self.$emit("onRefresh");
          } catch (data) {
            self.saving = false;
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
