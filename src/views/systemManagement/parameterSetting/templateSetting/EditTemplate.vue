<template>
  <el-dialog :title="$t('base.edit')" :visible.sync="visible" @open="openFun">
    <el-form ref="editTemplateForm" label-width="100px" class="me-required-form" :model="templateObj" v-loading="loading" :element-loading-text="$t('base.sendingData')">
      <el-form-item :label="$t('base.businessName')">
        <span>{{templateObj.name}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.language')">
        <span>{{templateObj.language==0?$t('base.chinese'):$t('base.english')}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.sendType')">
        <el-radio-group v-model="templateObj.type" v-if="emailFlg&&smsFlg">
          <el-radio class="radio" :label="0">{{$t('base.mail')}}</el-radio>
          <el-radio class="radio" :label="1">{{$t('base.shortMessage')}}</el-radio>
        </el-radio-group>
        <span v-if="emailFlg&&!smsFlg">{{$t('base.mail')}}</span>
        <span v-if="smsFlg&&!emailFlg">{{$t('base.shortMessage')}}</span>
      </el-form-item>
      <el-form-item :label="$t('base.templateTheme')" v-show="emailFlg&&templateObj.type==0" class="is-required">
        <el-input v-model="templateObj.email_subject"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.templateContent')" class="is-required">
        <el-row>
          <el-col>
            <el-input type="textarea" v-model="templateObj.sms_content" height="120px" v-show="templateObj.type==1&&smsFlg"></el-input>
            <div id="editorElem" v-show="templateObj.type==0&&emailFlg"></div>
          </el-col>
        </el-row>
        <span>{{templateObj.param_describe}}</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
import E from 'wangeditor'
export default {
  name:"editTemplate",
  props:["id"],
  data() {
    return {
      loading:false,
      visible:false,
      editor:null,
      emailFlg:false,
      smsFlg:false,
      templateObj: {
        name:"",
        sms_content:"",
        email_subject:"",
        email_content:"",
        param_describe:"",
        type: 0
      }
    }
  },
  mounted() {
  },
  methods:{
    show(obj) {
      this.visible = true;
      this.smsFlg = false;
      this.emailFlg = false;
      this.templateObj = $.extend({}, this.templateObj, obj);
      if (this.templateObj.sms_content) {
        this.smsFlg = true;
      }
      if (this.templateObj.email_content) {
        this.emailFlg = true;
      }
      this.templateObj.type=0;
    },
    confirmFun() {
      let me = this;
      let text = '';
      if (this.emailFlg) { //可以设置邮件模板
        text = this.editor.txt.text();
        if (text) { //处理空格
          text = text.replace(/&nbsp;/g, '').trim();
        }
      }
      if (this.emailFlg&&this.smsFlg) {
        if (!text||!(this.templateObj.sms_content)||!this.templateObj.email_subject.trim()) {
          this.$message({
            message: Vue.t('base.templateWarn'),
            type: "warning"
          });
          return;
        }
      } else if (!this.emailFlg&&this.smsFlg) {
        if (!(this.templateObj.sms_content)) {
          this.$message({
            message: Vue.t('base.templateWarn1'),
            type: "warning"
          });
          return;
        }
      } else if (this.emailFlg&&!this.smsFlg) {
        if (!text||!this.templateObj.email_subject.trim()) {
          this.$message({
            message: Vue.t('base.templateWarn2'),
            type: "warning"
          });
          return;
        }
      }
      if (this.emailFlg&&this.templateObj.email_subject.length>64) {
        this.$message({
          message: Vue.t('base.templateWarn3'),
          type: "warning"
        });
        return;
      }
      this.loading = true;
      let ret = this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/template/"+this.id,
        data:JSON.stringify({
          business_template:{
            "email_subject":this.templateObj.email_subject,
            "sms_content":this.templateObj.sms_content,
            "email_content":this.editor.txt.html()
          }
        }),
        successMsg:Vue.t('base.saveSuccess'),
        successFun() {
          me.loading = false;
          me.visible = false;
          me.$emit("getCurrentData")
        },
        errFun() {
          me.loading = false;
        },
        log:{
          description:{
            en:"business template("+me.templateObj.name+") configuration modification",
            zh_cn:"业务模板("+me.templateObj.name+")配置修改"
          },
          target:Vue.logTarget.parameterSetting
        }
      });
    },
    openFun() {
      this.$nextTick(() => {
        document.getElementById('editorElem').innerHTML = '';
        var editor = new E('#editorElem');
        editor.customConfig.menus = [
          'head', //标题
          'bold',
          "italic",
          "underline",
          "strikeThrough",
          "foreColor",
          "backColor",
          "link",
          //"list",
          "justify",
          //"quote",
          //"emoticon",
          //"table",
          "undo",
          "redo"
        ];
        editor.create();
        this.editor = editor;
        editor.txt.html(this.templateObj.email_content);
      });
    }
  }
}
</script>