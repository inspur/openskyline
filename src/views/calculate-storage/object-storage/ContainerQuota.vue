<template>
  <el-dialog :title="$t('calcStorLang.containerQuotaSetting')" :visible.sync="visible" :before-close="handleClose" v-dialogDrag>
    <el-row>
      <el-col :span="17">
        <el-form ref="quota" :model="quota" label-width="120px" :rules="rules" v-loading="loading">
          <el-form-item label="开关" prop="onOff">
            <el-switch v-model="quota.onOff" on-text="开" off-text="关"></el-switch>
          </el-form-item>
          <el-form-item label="桶容量配额" v-if="quota.onOff" class="is-required">
            <el-form-item prop="size" class="col-12" v-if="!quota.sizeUnlimit" style="display: inline-block">
              <el-input v-model="quota.size"></el-input>
            </el-form-item>
            <el-select class="col-4" v-model="quota.sizeUnit" v-if="!quota.sizeUnlimit">
              <el-option value="K" label="K"></el-option>
              <el-option value="M" label="M"></el-option>
              <el-option value="G" label="G"></el-option>
            </el-select>
            <el-tooltip placement="top" trigger="hover" :content="$t('支持1K---99999999G')" v-if="!quota.sizeUnlimit">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
            <el-checkbox v-model="quota.sizeUnlimit">不限</el-checkbox>
          </el-form-item>
          <el-form-item label="桶对象个数配额" v-if="quota.onOff" class="is-required">
            <el-form-item prop="count" class="col-12" v-if="!quota.countUnlimit" style="display: inline-block">
              <el-input v-model="quota.count"></el-input>
            </el-form-item>
            <el-tooltip placement="top" trigger="hover" :content="$t('支持1---99999999')" v-if="!quota.countUnlimit">
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
            <el-checkbox v-model="quota.countUnlimit">不限</el-checkbox>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="7">
        <el-form>
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <thead>
                <tr class="even">
                  <th class="is-left is-leaf">
                    <el-tag type="primary">{{$t('已使用量')}}</el-tag>
                  </th>
                  <th class="is-left is-leaf"></th>
                </tr>
              </thead>
              <tbody>
                <tr class="even">
                  <th class="idatath">{{$t('容量')}}：</th>
                  <td class="idatatd">{{usedSize}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('个数')}}：</th>
                  <td class="idatatd">{{usedCount}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "quota",
  props: ["containerTempName"],
  data() {
    return {
      quota: {
        onOff: false,
        size: "",
        sizeUnit: "K",
        sizeUnlimit: false,
        count: "",
        countUnlimit: false
      },
      usedCount: "-",
      usedSizeByte: 0,
      usedSize: "-",
      loading: false,
      visible: true,
      rules: {
        size: [
          { type: "required" },
          { type: 'unsignedPositiveInteger' },
          { type: 'min', value: 1 },
          { type: 'max', value: 99999999 }
        ],
        count: [
          { type: "required" },
          { type: 'unsignedPositiveInteger' },
          { type: 'min', value: 1 },
          { type: 'max', value: 99999999 }
        ]
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    handleClose() {
      this.$emit("hide");
    },
    async initData() {
      var self = this;
      var projectId = this.$cookie.get('pid');
      var url = "api/swift/v1/" + projectId + "/" + self.containerTempName + "?format=json";
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true,
          successFun: function (res, xhr) {
            self.loading = false;
            let enable = xhr.getResponseHeader("X-Container-Meta-Quota-enable");
            self.quota.onOff = xhr.getResponseHeader("X-Container-Meta-Quota-enable") == "enable";
            let size = xhr.getResponseHeader("x-container-meta-quota-bytes");
            self.quota.sizeUnlimit = size == -1;
            self.quota.size = (size != -1 && size != undefined && size != null) ? parseInt(size.substring(0, size.length - 1)) : "";
            self.quota.sizeUnit = (size != -1 && size != undefined && size != null) ? size.substring(size.length - 1, size.length) : "K";
            let count = xhr.getResponseHeader("x-container-meta-quota-count");
            self.quota.countUnlimit = count == -1;
            self.quota.count = count == -1 ? "" : count;
            self.usedCount = xhr.getResponseHeader("x-container-object-count");
            self.usedSizeByte = xhr.getResponseHeader("x-container-bytes-used");
            self.usedSize = self.formatFileSize(self.usedSizeByte, "Byte").join("");
            // self.usedSize = self.usedSizeByte + " Bytes";
          },
          errFun: function () {
            self.loading = false;
          }
        });
      } catch (res) {
        self.loading = false;
      }
    },
    confirmFun() {
      var self = this;
      this.$refs.quota.validate(async (valid) => {
        if (valid) {
          var url = "api/swift/v1/" + this.$cookie.get('pid') + "/" + self.containerTempName;
          let size = self.quota.sizeUnlimit ? "" : (self.quota.size + self.quota.sizeUnit);
          if (!self.quota.sizeUnlimit) {
            if (self.usedSizeByte > self.getSizeByte(self.quota.size, self.quota.sizeUnit)) {
              self.$message({
                type: "warning",
                message: "设置的容量配额不能小于已使用配额！"
              });
              return;
            }
          }
          if (!self.quota.countUnlimit) {
            if (parseInt(self.usedCount) > parseInt(self.quota.count)) {
              self.$message({
                type: "warning",
                message: "设置的个数配额不能小于已使用配额！"
              });
              return;
            }
          }
          self.loading = true;
          try {
            this.$ajax({
              url: url,
              type: "POST",
              successMsg: "设置成功！",
              headers: {
                "X-Container-Meta-Quota-enable": self.quota.onOff ? "enable" : "disable",
                "X-Container-Meta-Quota-Bytes": self.quota.sizeUnlimit ? -1 : size,
                "X-Container-Meta-Quota-Count": self.quota.countUnlimit ? -1 : self.quota.count
              },
              log: {
                description: {
                  en: "Container:" + self.containerTempName + "set quota",
                  zh_cn: "存储桶:" + self.containerTempName + "设置配额"
                },
                target: Vue.logTarget.storage_object_storage
              },
              successFun: function () {
                self.loading = false;
                self.$emit("hide");
                self.$emit("refresh");
              },
              errFun: function () {
                self.loading = false;
              }
            });
          } catch (data) {
            self.loading = false;
          }
        }
      });
    },
    getSize() {
      if (this.sizeUnlimit) {
        return "";
      }
      let s = this.quota.size;
      let unit = this.quota.sizeUnit;
      return [s, unit];
    },
    getSizeByte(size, unit) {
      let r = 0;
      switch (unit) {
        case "K":
          r = size * 1024;
          break;
        case "M":
          r = size * 1024 * 1024;
          break;
        case "G":
          r = size * 1024 * 1024 * 1024;
          break;
      }
      return parseInt(r);
    },
    setSize(size) {
      let s = "";
      if (size == -1 || size == undefined || size == null) {
        return s;
      }
      return parseInt(size.substring(0, size.length - 1));
    },
    formatFileSize(value, unit, i = 2) {
      var str = "";
      switch (unit) {
        case "Byte":
          break;
        case "KB":
          value = value * 1024;
          break;
        case "MB":
          value = value * 1024 * 1024;
          break;
        case "GB":
          value = value * 1024 * 1024 * 1024;
          break;
        case "TB":
          value = value * 1024 * 1024 * 1024 * 1024;
          break;
      }
      if (value > 0 && value < 1024) {
        return [value, "Byte"];
      } else if (value >= 1024 && value < 1024 * 1024) {
        return [Number(value / 1024).toFixed(i), "K"];
      } else if (value >= 1024 * 1024 && value < 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024)).toFixed(i), "M"];
      } else if (value >= 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024 * 1024)).toFixed(i), "G"];
      } else if (value >= 1024 * 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024 * 1024 * 1024)).toFixed(i), "T"];
      } else if (value >= 1024 * 1024 * 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(i), "P"];
      } else {
        return [value, "K"];
      }
    }
  }
}
</script>