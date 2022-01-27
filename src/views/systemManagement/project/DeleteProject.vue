<template>
  <div>
    <el-dialog :title="$t('base.deleteProjectTitle')" :visible="dialogVisible" :before-close="onBeforeClose">
      <div v-if="saving">{{$t('base.deleteProjectPro')}}</div>
      <el-table :data="projectSource" style="width: 100%">
        <el-table-column prop="name" :label="$t('base.name')" min-width="100">
        </el-table-column>
        <el-table-column prop="status" :label="$t('base.status')" min-width="100" align="left">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.status==0">{{$t('base.waitingForDel')}}</el-tag>
            <i v-if="scope.row.status==0" class="el-icon-loading"></i>
            <el-tag type="success" v-if="scope.row.status==1">{{$t('base.deleteSuccess')}}</el-tag>
            <el-tag type="danger" v-if="scope.row.status==2">{{$t('base.deleteFail')}}</el-tag>
            <el-tag type="danger" v-if="scope.row.status==3">{{$t('base.deleteTermination')}}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close()">{{$t('base.close')}}</el-button>
      </div>
   </el-dialog>
  </div>
</template>

<script>
import AWS from 'aws-sdk';
const Base64 = require('js-base64').Base64;

export default {
  name: 'delete-project',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      defalut: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      projectSource: (function (me) {
        let arr = [];
        let i=0;
        //肯定有计算nova模块，不做判断
        arr.push({service:"nova", index:i++, name:Vue.t('base.cloudHost')+"、"+Vue.t('calcStorLang.instanceshot')+"、"+Vue.t('base.privateImage'), status:0})
        if (me.checkService("cinderv2")||me.checkService("manila")||me.checkService("swift")||me.checkService("S3")) {
          let str = '';
          if (me.checkService("cinderv2")) {
            str += " 、"+Vue.t('base.cloudDisk')+"、"+(Vue.service.ironic?(Vue.t('calcStorLang.physicalHost')+"、"):"")+Vue.t('calcStorLang.volumeSnapshot')+"、"+Vue.t('calcStorLang.volumebak');
          }
          if (me.checkService("manila")) {
            str += " 、"+Vue.t('calcStorLang.fileStorage');
          }
          if (me.checkService("swift")||me.checkService("S3")) {
            str += " 、"+Vue.t('calcStorLang.objectStorage');
          }
          arr.push({service:"cinderv2", index:i++, name:str.substring(2), status:0})
        }
        if (me.checkService("senlin")) {
          arr.push({service:"senlin", index:i++, name:Vue.t('scalingService.scalingService'), status:0});
        }
        if (me.checkService("heat")) {
          arr.push({service:"heat", index:i++, name:Vue.t('heat.serviceOrchestration'), status:0});
        }
        if (me.checkService("cetus")) {
          arr.push({service:"cetus", index:i++, name:Vue.t('base.containerManagement'), status:0});
        }
        if (me.checkService("trove")) {
          arr.push({service:"trove", index:i++, name:Vue.t('base.databaseInstance'), status:0});
        }
        if (me.checkService("mistral")) {
          arr.push({service:"mistral", index:i++, name:Vue.t('task.cloudTask'), status:0});
        }
        if (me.checkService("cloudkitty")) {
          arr.push({service:"cloudkitty", index:i++, name:Vue.t('base.billing'), status:0});
        }
        if (me.checkService("leo")) {
          arr.push({service:"leo", index:i++, name:Vue.t('opt.approval')+"、"+Vue.t('opt.workSheet'), status:0});
        }
        if (me.checkService("neutron")) {
          arr.push({service:"neutron", index:i++, name:Vue.t('base.network'), status:0});
        }
        return arr;
      })(this)
    };
  },
  methods: {
    async deleteProject(id, name) {
      this.projectSource.forEach((item) => {
        item.status=0
      })
      //查找admin项目的id
      let projectRet = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects?" + $.param({domain_id:"default", name:"admin"})
      });
      let adminPid = projectRet.projects[0].id;

      this.deleteProjectFlag = true;
      let me = this;
      // let activeRegionId = this.$cookie.get('region_id');
      // let regions = Vue.regionList;

      //定义各模块删除方法变量

      delProject();
      this.onBeforeClose();
      function delProject() {
        me.$ajax({
          type: 'DELETE',
          url: "api/keystone/v3/projects/" + id,
          data: {},
          successMsg:Vue.t('base.deleteSuccess'),
          log:{
            description:{
              en:"delete project"+"("+name+")",
              zh_cn:"删除项目"+"("+name+")"
            },
            target:Vue.logTarget.project
          },
          successFun() {
            me.$emit('finish');
          },
          errFun() {
            me.$emit('error', me.id);
          }
        })
      }
    },
    updateErrStatus() {
      this.projectSource.forEach((item) => {
        if (item.status==0) {
          item.status=3;
        }
      })
      this.$emit('error', this.id);
    },
    checkService(service) {
      let flg = false;
      for (let region in Vue.regionServices) {
        if (Vue.regionServices[region][service]) {
          flg = true;
        }
      }
      return flg;
    },
    convertLog(log, index) {
      if (Vue.regionList.length>1) {
        for (var key in log.description) {
          log.description[key] += "("+Vue.regionList[index].region+")"
        }
      }
    },
    initDialog() {
      const $this = this;
      $this.dialogVisible = true;
    },
    onBeforeClose() {
      const $this = this;
      $this.close();
    },
    close() {
      const $this = this;
      $this.dialogVisible = false;
      $this.$emit('update:show', false);
      $this.$emit('refreshData');
    }
  },
  watch: {
    show(val) {
      const $this = this;
      if (val) {
        $this.dialogVisible = true;
      }
    }
  },
  computed: {
    saving() {
      return this.projectSource.findIndex(item => item.status === 0) !== -1;
    }
  },
  mounted() {
    const $this = this;
    $this.deleteProject($this.id, $this.name);
    $this.dialogVisible = $this.show;
  }
}
</script>

<style>

</style>
