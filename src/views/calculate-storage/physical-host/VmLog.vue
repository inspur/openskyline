<template>
  <div>
    <el-row v-show="logSearchSetting">
      <el-form label-width="100px" :rules="rules" ref="logInstanceForm" :model="instanceLog">
        <el-form-item :label="$t('calcStorLang.instLogLine')" class="is-required" prop="logLength" align="left">
          <el-input v-model="instanceLog.logLength" class="col-8"></el-input>
          <el-button type="primary" icon='fa-search' size="small" @click="queryClick">{{$t('lang.view')}}</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <!-- <el-input type="textarea" v-model="outLogContent" autosize style="overflow-x:scroll"></el-input> -->
      <pre :class="vmLogClass">{{outLogContent}}</pre>
    </el-row>
  </div>
</template>
<script>
export default {
  name: 'LoadDisk',
  props: ['InstanceId'],
  data() {
    return {
      currentPage: 1,
      multipleSelection: [],
      vmLogClass: this.$cookie.get('theme')+"" =='dark'?'logs2':'logs',
      instanceLog: {
        logLength: 50
      },
      logSearchSetting: false,
      outLogContent: "",
      rules: {
        logLength: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integerNO000' },
          { type: 'min', value:1 }
        ]
      }
    }
  },
  mounted() {
    // this.queryClick();
    var self = this;
    Promise.all([self.getData(self.instanceLog.logLength)]).then(function(result) {
      var rets = result[0];
      if (rets != null) {
        self.outLogContent = rets;
        self.logSearchSetting = true;
      } else {
        self.logSearchSetting = false;
        self.loadErrorInfo();
      }
    });
  },
  watch: {
    InstanceId: {
      handler: function(rows, oldVal) {
        this.instanceLog.logLength = 50;
        this.outLogContent = "";
        this.queryClick();
      }
    }
  },
  methods: {
    async getData(line) {
      if (line == null || line == "") {
        line = 50;
      }
      var self = this;
      self.loading = true;
      var body = { "os-getConsoleOutput": { "length": line } };
      body = JSON.stringify(body);
      try {
        let result = await self.$ajax({
          type: 'post',
          url: "api/nova/v2.1/servers/" + self.InstanceId + "/action",
          data: body,
          showErrMsg: false
        });
        return result['output'];
      } catch (res) {
        self.loading = false;
      }
    },
    async loadErrorInfo() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/nova/v2.1/servers-inspur/" + self.InstanceId,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.41
          },
          showErrMsg: false
        });
        let Instance = result['server'];
        var content = "";
        if (Instance['fault'] != null) {
          content = Instance['fault'].message + Instance['fault'].details;
        } else {
          content = Vue.t('calcStorLang.instSystemLog');
        }
        self.outLogContent = content;
      } catch (res) {}
    },
    queryClick() {
      var self = this;
      this.$refs.logInstanceForm.validate(async(valid) => {
        if (valid) {
          Promise.all([self.getData(self.instanceLog.logLength)]).then(function(result) {
            var rets = result[0];
            if (rets != null) {
              self.outLogContent = rets;
              self.logSearchSetting = true;
            } else {
              self.logSearchSetting = false;
              self.loadErrorInfo();
            }
          });
        }
      });
    }
  }
}

</script>
<style scoped>
.logs {
    overflow: auto;
    text-align:left;
    display: block;
    padding: 8.5px;
    margin: 0 0 9px;
    font-size: 12px;
    line-height: 1.42857;
    word-break: break-all;
    word-wrap: break-word;
    color: #333;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.logs2 {
    overflow: auto;
    text-align:left;
    display: block;
    padding: 8.5px;
    margin: 0 0 9px;
    font-size: 12px;
    line-height: 1.42857;
    word-break: break-all;
    word-wrap: break-word;
    color: #a5b5c5;
    background-color: #121c2c;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
