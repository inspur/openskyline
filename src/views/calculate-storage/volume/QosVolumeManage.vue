<template>
  <div>
    <el2-dialog :title="$t('storage.manageQosSpec')" :visible.sync="visible" :before-close="handleClose" custom-class="qos-manage-custom" v-dialogDrag :append-to-body="true" width="800px">
      <div>
        <operation-panel
          class="margin-tb5"
          :select-rows="multipleSelection"
          :operation-menus="operationMenus">
        </operation-panel>
        <div style="margin:20px 0px 20px 0px;">
          <span class="qos-switch">{{$t('storage.qosControl')}}</span>
          <el-switch v-model ="block_status" :on-text="$t('base.open')" :off-text="$t('base.off')" @change="changeQosStatus" style="margin-left: 20px;"></el-switch>
          <el-tooltip placement="top" trigger="hover" :content="$t('storage.qosTooltipText')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </div>
        <el-table
          ref="qosTable"
          :data="totalData"
          highlight-current-row
          border
          stripe
          style="width: 100%;"
          slot="empty"
          max-height='500'
          row-key="key"
          @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('key') >= 0"
            prop="key"
            :label="$t('storage.key')"
            align="left"
            sortable
            min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('value') >= 0"
            prop="value"
            align="left"
            :label="$t('storage.value')"
            min-width="100">
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length) }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="default" @click="handleClose">{{$t('lang.close')}}</el-button>
      </div>
    </el2-dialog>
    <el2-dialog :title="theTitle" :visible.sync="createQosStandardFlg" v-if="createQosStandardFlg" :before-close="handleCreateClose" :append-to-body="true" width="800px">
      <el-form ref="createQosStandardForm" :model="createQosStandard" label-width="100px" :rules="rules">
        <el-form-item :label="$t('storage.key')" prop="key" class="is-required">
          <el-select class="col-8" v-model="createQosStandard.key">
            <el-option v-for="item in ncOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('storage.value')" prop="value" class="is-required">
          <el-input class="col-8" v-model="createQosStandard.value" auto-complete="off"></el-input>
          <span v-show="unitShow">{{"byte"}}</span>
          <el-tooltip v-show="createQosStandard.key!=''" placement="top" trigger="hover" :content="createQosStandard.key.indexOf('iops')>-1?$t('storage.ioBytesInstruction2'):$t('storage.ioBytesInstruction3')">
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCreateClose">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el2-dialog>
  </div>
</template>
<script>
export default {
  name: "QoSPopList",
  props: ["volumeInfo"],
  data() {
    return {
      keyDis: false,
      theTitle: this.$t("storage.createQuote"),
      formInline: {},
      multipleSelection: [],
      ncOption: [
        { value: "read_iops_sec", label: "read_iops_sec" },
        { value: "write_iops_sec", label: "write_iops_sec" },
        { value: "total_iops_sec", label: "total_iops_sec" },
        { value: "read_bytes_sec", label: "read_bytes_sec" },
        { value: "write_bytes_sec", label: "write_bytes_sec" },
        { value: "total_bytes_sec", label: "total_bytes_sec" }
      ],
      visible: true,
      saving: false,
      unitShow: false,
      block_status: "",
      tableData: [],
      totalData: [],
      loading: false,
      qosStatus: "unblock",
      columnsChecked: ["key", "value"],
      columns: [
        {
          prop: "key",
          label: this.$t("storage.key")
        },
        {
          prop: "value",
          label: this.$t("storage.value")
        }
      ],
      createQosStandardFlg: false,
      createQosStandard: {
        key: "",
        value: "",
        qosId: ""
      },
      rules: {
        value: [
          { type: "required", trigger: "blur change" },
          { type: "integer" },
          { type: "max", value: 2147483647 },
          { type: "min", value: 1 }
        ],
        key: [
          { type: "required", trigger: "blur change" }
        ]
      },
      operationMenus: [
        {
          icon: "fa-plus",
          name: this.$t("storage.create"),
          showflg: true,
          readOnly: true,
          handler: function() {
            this.createQosStandardFlg = true;
          }.bind(this)
        },
        {
          icon: "fa-pencil-square-o",
          name: this.$t("lang.edit"),
          showflg: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            let me = this;
            me.createQosStandardFlg = true;
            me.createQosStandard.key = selectRows[0].key;
            me.createQosStandard.value = selectRows[0].value;
            me.createQosStandard.qosId = selectRows[0].id;
            me.keyDis = true;
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: this.$t("lang.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: async function (selectRows) {
            let self = this;
            let object1 = [];
            for (let i = 0; i < selectRows.length; i++) {
              let row = selectRows[i];
              object1.push(row["key"]);
            }
            let Pid = this.$cookie.get("pid");
            this.$confirm(Vue.t('storage.deleteQosSpecCofirm'), Vue.t('lang.confirm'), {
              confirmButtonText: Vue.t('lang.confirm'),
              cancelButtonText: Vue.t('lang.cancel'),
              closeOnClickModal: false
            }).then(() => {
              self.$sequence({
                type: "delete",
                url: "api/cinderv3/v3/" + Pid + "/vol-qos-specs/{id}",
                params: selectRows,
                log: {
                  description: {
                    en: "Delete volume "+"("+self.volumeInfo["id"]+"QoS specification: {key}",
                    zh_cn: "删除云硬盘"+(self.volumeInfo["name"] || self.volumeInfo["id"])+"("+self.volumeInfo["id"]+`)的QoS规格属性:{key}`
                  },
                  target: Vue.logTarget.storage_volume
                },
                successFun: function () {
                  self.$refs.qosTable.clearSelection();
                  self.setToNova();
                  self.loadData();
                }
              })
            }).then(data => {
              self.$message.success(Vue.t('base.deleteSuccess'));
            }).catch(() => {});
          }.bind(this)
        }
      ]
    };
  },
  mounted() {
    this.getQosStatus();
    this.loadData();
  },
  updated() {
    let self = this;
    if (
      this.createQosStandard.key == "read_iops_sec" ||
      this.createQosStandard.key == "write_iops_sec" ||
      this.createQosStandard.key == "total_iops_sec"
    ) {
      this.unitShow = false;
    } else if (
      this.createQosStandard.key == "read_bytes_sec" ||
      this.createQosStandard.key == "write_bytes_sec" ||
      this.createQosStandard.key == "total_bytes_sec"
    ) {
      this.unitShow = true;
    }
    if (this.keyDis) {
      this.theTitle = this.$t("storage.editQuote");
    } else {
      this.theTitle = this.$t("storage.createQuote");
    }
  },
  methods: {
    async loadData(setToNova=false) {
      let Pid = this.$cookie.get("pid");
      let self = this;
      let url = "api/cinderv3/v3/" + Pid + "/vol-qos-specs?vol_id=" + this.volumeInfo["id"];
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: "get",
          url: url
        });
        self.totalData = [];
        self.totalData = result["qos_specs"];
        if (setToNova) {
          self.setToNova();
        } else {
          self.loading = false;
        }
      } catch (res) {
        self.loading = false;
      }
    },
    async confirmFun() {
      this.$refs.createQosStandardForm.validate(async valid => {
        if (valid) {
          this.saving = true;
          //定义条件
          let hasrqos = false;
          let haswqos = false;
          let hastqos = false;
          let hasrbyte = false;
          let haswbyte = false;
          let hastbyte = false;
          //获取页面数据
          let Pid = this.$cookie.get("pid");
          let self = this;
          let speckey = self.createQosStandard.key;
          let specvalue = self.createQosStandard.value;
          let url = "api/cinderv3/v3/" + Pid + "/vol-qos-specs";
          let type = "POST";
          let msg = this.$t("storage.createQosSpecOptionSuccess");
          let logMsgZh = "创建QoS规格属性:";
          let logMsgEn = "Create QoS specification:";
          let object1 = {
            "volume_id": self.volumeInfo["id"],
            "key": speckey,
            "value": parseInt(specvalue)
          };
          if (this.keyDis) {
            type = "PUT";
            url = "api/cinderv3/v3/" + Pid + "/vol-qos-specs/" + self.createQosStandard.qosId;
            msg = this.$t("storage.editeQosSpecOptionSuccess");
            logMsgEn = "Edit "+self.volumeInfo["name"]+"("+self.volumeInfo["id"] + " QoS specification:";
            logMsgZh = "修改云硬盘"+(self.volumeInfo["name"] || self.volumeInfo["id"])+"("+self.volumeInfo["id"]+")的QoS规格属性:";
            object1 = {
              "key": speckey,
              "value": parseInt(specvalue)
            };
          }
          let body = { qos_specs: object1 };
          try {
            await self.$ajax({
              url: url,
              data: JSON.stringify(body),
              type: type,
              successMsg: msg,
              log: {
                description: {
                  en: logMsgEn + JSON.stringify(object1),
                  zh_cn: logMsgZh + JSON.stringify(object1)
                },
                target: Vue.logTarget.storage_volume
              }
            });
            self.createQosStandardFlg = false;
            self.setToNova();
            self.loadData();
            self.createQosStandard.key = "";
            self.createQosStandard.value = "";
            self.keyDis = false;
            self.unitShow = false;
            self.$refs.qosTable.clearSelection();
            this.saving = false;
            // this.setToNova();
          } catch (data) {
            this.saving = false;
            __DEV__ && console.error(data);
          }
        } else {
          this.saving = false;
          return false;
        }
      });
    },
    handleClose() {
      this.$emit("handleShow", {});
      this.$emit("getData");
    },
    handleCreateClose() {
      this.createQosStandardFlg = false;
      this.createQosStandard.key = "";
      this.createQosStandard.value = "";
      this.keyDis = false;
      this.unitShow = false;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    onRefresh() {
      this.loadData();
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    async setToNova() {
      const $this = this;
      let instanceList = $this.volumeInfo["attachments"];
      let Pid = this.$cookie.get("pid");
      if (instanceList != null && instanceList.length>0) {
        for (let i=0; i<instanceList.length; i++) {
          let instanceId = instanceList[i]["server_id"];
          try {
            $this.loading = true;
            let qosSpecs = {};
            if ($this.block_status) {
              let qosUrl = "api/cinderv3/v3/" + Pid + "/vol-qos-specs/" + this.volumeInfo["id"] + "/current_qos";
              let qosSpecsData = await $this.$ajax({
                type: "get",
                url: qosUrl,
                successFun(qosSpecsData) {
                  if (qosSpecsData["qos_specs"]) {
                    qosSpecs = qosSpecsData["qos_specs"];
                  } else {
                    qosSpecs = {
                      read_iops_sec: 0,
                      write_iops_sec: 0,
                      total_iops_sec: 0,
                      read_bytes_sec: 0,
                      write_bytes_sec: 0,
                      total_bytes_sec: 0
                    };
                  }
                  $this.qosSpecsAction(instanceId, qosSpecs);
                }
              });
            } else {
              qosSpecs = {
                read_iops_sec: 0,
                write_iops_sec: 0,
                total_iops_sec: 0,
                read_bytes_sec: 0,
                write_bytes_sec: 0,
                total_bytes_sec: 0
              };
              $this.qosSpecsAction(instanceId, qosSpecs);
            }
            // qosSpecs = qosSpecsData["qos_specs"];
            // if ($this.totalData.length > 0) {
            //   $this.totalData.forEach(item => {
            //     qosSpecs[item.key] = item.value;
            //   });
            // }

            $this.loading = false;
          } catch (e) {
            __DEV__ && console.error(e);
            $this.loading = false;
          }
        }
      }
    },
    async qosSpecsAction(instanceId, qosSpecs) {
      const $this = this;
      try {
        if (qosSpecs != null) {
          let result = await $this.$ajax({
            type: 'post',
            url: `api/nova/v2.1/servers/${instanceId}/action`,
            data: JSON.stringify({
              set_block_qos: {
                volume_id: $this.volumeInfo.id,
                qos_specs: qosSpecs
              }
            })
          });
        }
        $this.loading = false;
      } catch (e) {
        __DEV__ && console.error(e);
        $this.loading = false;
      }
    },
    async getQosStatus() {
      let self = this;
      let Pid = this.$cookie.get("pid");
      let url = "api/cinderv3/v3/" + Pid + "/vol-qos-specs/" + this.volumeInfo["id"] + "/qos_status";
      try {
        self.loading = true;
        let result = await self.$ajax({
          type: "get",
          url: url
        });
        self.loading = false;
        self.block_status = !(result["block_status"] == "block");
      } catch (res) {
        self.loading = false;
      }
    },
    async changeQosStatus(value) {
      let self = this;
      let Pid = this.$cookie.get("pid");
      let url = "api/cinderv3/v3/" + Pid + "/vol-qos-specs/" + this.volumeInfo["id"] + "/block";
      let param = {
            "operation": value?"unblock":"block"
      };
      let msg = value?this.$t("storage.turnOnQosControlSuccess"):this.$t("storage.turnOffQosControlSuccess");
      let logMsgZ = value?"开启":"关闭";
      let logMsgE = value?"Turn on":"Turn off";
      let logMsgEn = logMsgE + " cloud disk "+self.volumeInfo["name"]+"("+self.volumeInfo["id"] + " QoS controll status: ";
      let logMsgZh = logMsgZ + " 云硬盘"+(self.volumeInfo["name"] || self.volumeInfo["id"])+"("+self.volumeInfo["id"]+")的QoS控制 ";
      try {
        await self.$ajax({
          type: "put",
          data: JSON.stringify(param),
          url: url,
          successMsg: msg,
          log: {
            description: {
              en: logMsgEn + JSON.stringify(param),
              zh_cn: logMsgZh + JSON.stringify(param)
            },
            target: Vue.logTarget.storage_volume
          }
        });
        self.setToNova();
      } catch (data) {
        this.block_status = !value;
        self.loading = false;
      }
    }
  }
};
</script>
<style>
.qos-controll {
  font-size: 14px;
  color:#333;
  margin-right:20ox;
}
</style>