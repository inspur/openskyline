<template>
  <el-row>
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item :title="$t('calcStorLang.baseProperty')" name="baseProperty">
        <el-col :span="24">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.name')}}：</th>
                  <td class="idatatd">{{keyPair.name|| '-'}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('lang.createTime')}}：</th>
                  <td class="idatatd">{{dateRender(keyPair.keyDate)}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('lang.userName')}}：</th>
                  <td class="idatatd">{{keyPair.keyOwner}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('calcStorLang.fingerprint')}}：</th>
                  <td class="idatatd">{{keyPair.fingerprint|| '-'}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.publicKey')}}：</th>
                  <td class="idatatd">
                    <span>{{keyPair.publicKey|| '-'}}</span>
                    <!-- <el-tooltip :content="keyPair.publicKey" v-show="keyPair.publicKey.length > 0">
                      <span>{{keyPair.publicKey.length>80?keyPair.publicKey.substring(0, 80) + "...":keyPair.publicKey}}</span>
                    </el-tooltip> -->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-col>
      </el-collapse-item>
    </el-collapse>
  </el-row>
</template>
<script>
export default {
  name: 'KeyPairDetail',
  props: ['keyooPairName'],
  data() {
    return {
      keyPair: {
        name: '',
        keyDate: '',
        publicKey: '',
        keyOwner: '',
        fingerprint: ''
      },
      formInline: '',
      activeNames: 'baseProperty',
      dialogVisible: false
    }
  },
  watch: {
     keyooPairName: {
      handler: function(rows, oldVal) {
        this.initData();
      }
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/os-keypairs/' + this.keyooPairName,
          showErrMsg: true
        });
        // self.loading = false;
        let details = result['keypair'];
        self.keyPair.name = details.name;
        self.keyPair.keyDate = details.created_at;
        self.keyPair.publicKey = details.public_key;
        self.keyPair.fingerprint = details.fingerprint;
        let ret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/inspur/users?" + $.param({id:details.user_id})
        })
        self.keyPair.keyOwner = ret["users"] && ret["users"].length > 0 ? ret["users"][0].name : "-";
      } catch (res) {
        // self.loading = false;
        self.$message.error(Vue.t('calcStorLang.getError'));
      }
    },
    dateRender(value) {
      var self = this;
      if (value.lastIndexOf("Z") < 0 && value.lastIndexOf(".") >= 0) {
        value = value.substring(0, value.lastIndexOf(".")) + "Z";
      }
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    }
  }
}

</script>
<style scoped>
.table_panel {
  table-layout: fixed;
}
.idatatd {
  word-wrap: break-word;
}
.idatath {
  width: 20%
}
</style>