<template>
  <el-dialog :title="$t('storage.createImage')" :visible.sync="visible" :before-close="cancelFun">
    <el-form ref="volumeImageForm" :model="volumeImageForm" label-width="100px" label-position="right" :rules="rules">
      <el-form-item :label="$t('storage.volName')" prop="volumeName" v-if="false" class="is-required">
        <el-input class="col-10" v-model="volumeImageForm.volumeName" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.project')" v-if="roleType==='0'" prop="project" class="is-required">
        <el-input class="col-10" v-model="volumeImageForm.project" auto-complete="off" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.imageName')" prop="imageName" class="is-required">
        <el-input class="col-10" v-model="volumeImageForm.imageName" auto-complete="off" ></el-input>
      </el-form-item>
      <el-form-item :label="$t('storage.diskFormat')" prop="diskType" class="is-required">
       <el-select class="col-10" v-model="volumeImageForm.diskType">
        <el-option v-for="item in diskTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('storage.operationSystem')" prop="operSystem" class="is-required">
        <el-cascader
          class="col-10"
          :options="operSystemOptions"
          :show-all-levels="false"
          v-model="volumeImageForm.operSystem"
        />
    </el-form-item>
    </el-form>
    <ul v-if="imageToolTip" style="list-style-type: disc; list-style-position: inside;margin-left:29px;font-size: 8px;">
      <li><span>{{$t('calcStorLang.imageTooltip1')}}</span></li>
      <li><span>{{$t('calcStorLang.imageTooltip2')}}</span></li>
    </ul>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelFun">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
import osJson from '../image/OsJson.json';
export default {
  name: "volumeImage",
  props: ["volumeTempId", "temp_volume_name", "detailVolume"],
  data() {
    return {
      saving: false,
      operSystemOptions: [],
      diskTypeOptions: [{value: 'raw', label: 'raw'}, {value: 'qcow2', label: 'qcow2'}],
      volumeImageForm: {
        volumeName: "",
        imageName: "",
        diskType: "",
        project: "",
        operSystem: []
      },
      roleType: Vue.roleType + "",
      visible: false,
      imageToolTip: false,
      rules: {
        volumeName: [
          {type: 'required'}
        ],
        project: [
          {type: 'required'}
        ],
        imageName: [
          {type: 'onlyLetter_NumberChinese'},
          {type: 'required'},
          {type: 'maxSize', value: 40}
        ],
        diskType: [
          {type: 'required'}
        ],
        operSystem: [
          {type: 'required'}
        ]
      }
    };
  },
  mounted() {
    this.loadOsList();
  },
  methods: {
    loadOsList() {
      let self = this;
      let results = [];
      let list = osJson;
      self.imageToolTip = self.detailVolume["status"] == "in-use";
      for (let o = 0; o < list.length; o++) {
        let obj = {"value": list[o], "label": list[o].system, "distro": list[o].distro, "osType": list[o].osType};
        if ("fedora-atomic" == list[o].system) {
          obj = {"value": list[o], "label": "Fedora-atomic", "distro": list[o].distro, "osType": list[o].osType};
        }
        let distro = results.find(item => item.value == obj.distro);
        if (!distro) {
          distro = {
            value: obj.distro,
            label: obj.distro,
            children: []
          };
          results.push(distro);
        }
        distro.children.push(obj);
      }
      self.operSystemOptions = results;
      if (self.detailVolume["glance_metadata"] && JSON.stringify(self.detailVolume["glance_metadata"]) != "{}") {
        let osDistro = self.detailVolume['glance_metadata']["os_distro"];
        osJson.forEach(item => {
          if (osDistro === item.system) {
            self.volumeImageForm.operSystem = [item.distro, item];
          }
        });
      }
    },
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    isAdmin() {
      let roleType = Vue.roleType + "";
      if (roleType == "0") {
        return true;
      } else {
        false;
      }
    },
    isProAdmin() {
      let roleType = Vue.roleType + "";
      if (roleType == "2") {
        return true;
      } else {
        false;
      }
    },
    confirmFun() {
      let self = this;
      self.$refs.volumeImageForm.validate(async(valid) => {
        if (valid) {
          try {
            self.saving = true;
            var imgVisible = "private";
            if (this.isAdmin()) {
              imgVisible = "public";
            }
            var reqdata = {
              "os-volume_upload_image_inspur": {
                "container_format": "bare",
                "force": true,
                "image_name": this.volumeImageForm.imageName,
                "disk_format": this.volumeImageForm.diskType,
                "os_distro": this.volumeImageForm.operSystem[1].system,
                "visibility": imgVisible
              }
            };
            await self.$ajax({
              type: "POST",
              url: 'api/cinderv3/v3/' + this.$cookie.get('pid') + "/volumes/" + this.volumeTempId + "/action",
              data: JSON.stringify(reqdata),
              errFun() {
                self.saving = false;
              },
              success: function(res) {
              },
              headers: {
                'OpenStack-API-Version': 'volume 3.1'
              },
              errorKey: "badRequest",
              log: {
                description: {
                  en: "upload volume:" + this.temp_volume_name + " as image:" + this.volumeImageForm.imageName,
                  zh_cn: "上传云硬盘:" + this.temp_volume_name + " 为镜像:" + this.volumeImageForm.imageName
                },
                target: Vue.logTarget.storage_volume
              }
            });
            self.$notify({
              message: Vue.t('storage.sendApplySuccess'),
              type: "success"
            });
            self.saving = false;
            this.$emit("hrefTomrriorPage", {});
          } catch (res) {
            self.saving = false;
          } finally {
            this.$emit("handlerAddImage");
          }
          return true;
        } else {
          return false;
        }
      });
    },
    cancelFun() {
      this.$emit("handlerAddImage");
    },
    changeFlagValue() {}
  }
};
</script>