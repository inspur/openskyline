<template>
  <el-dialog :title="$t('base.importNameSpace')" :visible.sync="visible">
    <el-form ref="importMetaForm" :model="importMeta" label-width="180px" :rules="rules" class="me-required-form">
      <el-form-item :label="$t('base.namespaceDataSource')">
        <el-select 
          v-model="value">
          <el-option
            v-for="item in options"
            :key = "item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('base.metaDataDefinitionFile')" v-show="value==0" class="is-required">
        <el-upload
          ref="upload"
          :multiple="false"
          action=""
          :file-list="fileList"
          :auto-upload="false"
          :on-remove="handlerRemove"
          :on-change="handleChange">
          <el-button slot="trigger" size="small" type="primary">{{$t('base.selectFile')}}</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item :label="$t('base.namespaceJSON')" class="is-required" prop="namespace" v-show="value==1">
        <el-input type="textarea" v-model="importMeta.namespace" :rows="6"></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-checkbox v-model="importMeta.public">{{$t('base.public')}}</el-checkbox>
        <el-checkbox v-model="importMeta.protected">{{$t('base.protected')}}</el-checkbox>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
import uuid from 'uuid';
export default {
  name:"importMetaData",
  data() {
    let me = this;
    var jsonValidator = function(rule, value, callback) {
      if (!(me.$isJSON(value))) {
        callback(new Error(Vue.t('base.jsonWarn')));
      }
      callback();
    }
    return {
      importMeta:{
        name:"",
        namespace:"",
        public:false,
        protected:false,
        importNamespace:""
      },
      fileList:[],
      value:0,
      options:[{
        label:this.$t('base.metaDataDefinitionFile'),
        value:0
      }, {
        label:this.$t('base.directInput'),
        value:1
      }],
      visible:false,
      rules: {
        namespace: [
          {type: 'required'},
          {validator:jsonValidator, trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
      if (this.$refs.importMetaForm) {
        this.$refs.importMetaForm.resetFields();
      }
      this.importMeta = {
        name:"",
        namespace:"",
        public:false,
        protected:false,
        importNamespace:""
      }
      this.fileList = [];
      this.value = 0;
    },
    handleChange(file, fileList) {
      let me = this;
      this.fileList = fileList.slice(-1);
      const isLt2M = file.size/1024/1024<2;
      if (!isLt2M) {
        this.$message.error(Vue.t('base.fileSizeWarn'));
        this.fileList = [];
        return;
      }
      let fr = new FileReader();
      fr.onload = (e) => {
        if (me.$isJSON(fr.result)) {
          this.importMeta.importNamespace = fr.result;
        } else {
          this.$message.error(Vue.t('base.fileJsonWarn'));
          this.fileList = [];
        }
      };
      fr.readAsText(file.raw, 'utf8');
    },
    handlerRemove() {
      this.fileList = [];
    },
    async confirmFun() {
      let me = this;
      let flag = true;
      if (this.value==0) { //导入
        if (this.fileList.length==0) {
          flag = false;
          this.$message({
            message: this.$t('base.pleaseSelFile'),
            type: "warning"
          });
          return;
        }
      } else { //直接输入
        await this.$refs.importMetaForm.validate((valid) => {
          if (!valid) {
            flag = false;
          }
        });
        if (!flag) {
          return;
        }
      }
      let obj = JSON.parse(me.value==1?me.importMeta.namespace:me.importMeta.importNamespace);
      obj.visibility = me.importMeta.public?"public":"private";
      obj.protected = me.importMeta.protected;
      me.importData(obj);
    },
    async importData(obj) {
      try {
        let me = this;
        let traceId = 'req-'+uuid.v1();
        let ret = await this.$ajax({
          type: 'post',
          url: "api/glance/v2/metadefs/namespaces",
          data: JSON.stringify(obj),
          headers: {
            'X-Openstack-Request-Id': traceId
          },
          successMsg: Vue.t('base.saveSuccess'),
          showErrMsg:false,
          successFun() {
            me.$recordLog({
              target:Vue.logTarget.parameterSetting,
              level:{
                en:"info",
                zh_cn:"信息"
              },
              description:{
                en:"import metadata("+obj.display_name+")",
                zh_cn:"导入元数据("+obj.display_name+")"
              },
              trace_id: traceId
            });
          },
          errFun(xhr, status, msg) {
            me.$errMsg(xhr.responseJSON?xhr.responseJSON.message:"", xhr.status, true);
            me.$recordLog({
              target:Vue.logTarget.parameterSetting,
              level:{
                en:"error",
                zh_cn:"错误"
              },
              description:{
                en:"import metadata("+(xhr.status==400?"data format is wrong":xhr.responseJSON.message)+")",
                zh_cn:"导入元数据("+(xhr.status==400?"数据格式不对":xhr.responseJSON.message)+")"
              },
              trace_id: traceId
            });
          }
        })
        me.$emit('refreshData');
        this.visible = false;
      } catch (data) {
        console.log('导入失败，请联系管理员');
      }
    }
  }
}
</script>