<template>
  <el-row>
    <el-col :span="24">
      <el-col :span="12">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
              <tr class="odd">
                <td class="idatath">{{$t('lang.name')}}：</td>
                <td class="idatatd">
                  <el-tooltip :content="Instance_name" v-show="Instance_name.length > 20">
                    <span>{{Instance_name.substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="Instance_name.length <= 20">{{Instance_name}}</span>
                </td>
              </tr>
              <tr class="even">
                <td class="idatath">{{$t('calcStorLang.IP')}}：</td>
                <td class="idatatd"><span v-html="getAddr()"></span></td>
              </tr>
              <tr class="odd">
                <td class="idatath">{{$t('calcStorLang.specName')}}：</td>
                <td class="idatatd">
                  <el-tooltip :content="Instance_flavor" v-show="Instance_flavor.length > 20">
                    <span>{{Instance_flavor.substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="Instance_flavor.length <= 20">{{Instance_flavor}}</span>
                </td>
              </tr>
              <tr class="even">
                <td class="idatath">{{$t('lang.project')}}{{$t('lang.name')}}：</td>
                <td class="idatatd">
                  <el-tooltip :content="Instance_project" v-show="Instance_project.length > 20">
                    <span>{{Instance_project.substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="Instance_project.length <= 20">{{Instance_project}}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
              <tr class="odd">
                <td class="idatath">{{$t('calcStorLang.az')}}：</td>
                <td class="idatatd">
                  <el-tooltip :content="Instance_zone" v-show="Instance_zone.length > 20">
                    <span>{{Instance_zone.substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="Instance_zone.length <= 20">{{Instance_zone}}</span>
                </td>
              </tr>
              <tr class="even">
                <td class="idatath">{{$t('calcStorLang.powerStatus')}}：</td>
                <td class="idatatd">{{Instance_status}}</td>
              </tr>
              <tr class="odd">
                <td class="idatath">{{$t('calcStorLang.createTime')}}：</td>
                <td class="idatatd">{{Instance_time}}</td>
              </tr>
              <tr class="even">
                <td class="idatath">{{$t('calcStorLang.instDetailUserName')}}：</td>
                <td class="idatatd">
                  <el-tooltip :content="Instance_user" v-show="Instance_user.length > 20">
                    <span>{{Instance_user.substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="Instance_user.length <= 20">{{Instance_user}}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-col>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: 'InstanceDetail',
  props: ["InstanceId", "projectMaps", "userMaps", "flavorMaps"],
  data() {
    return {
         Instance_name: "",
         Instance_zone: "",
         Instance_addr: "",
         Instance_status: "",
         Instance_flavor: "",
         Instance_time: "",
         Instance_project: "",
         Instance_user: ""
    }
  },
  mounted() {
    var self = this;
    self.getData();
    //alert(this.flavorMaps.get("0bfb9417-13ac-49a9-8a62-1f52b1b22651"));
  },
  methods: {
     async getData() {
        let self = this;
        try {
          let result = await self.$ajax({
            type: 'get',
            url: "api/nova/v2.1/servers/"+this.InstanceId,
            complete: function(XMLHttpRequest, textStatus) {
            }
          });
          let Instance = result['server'];
          self.Instance_name = Instance["name"];
          self.Instance_zone = Instance["OS-EXT-AZ:availability_zone"] || '-';
          self.Instance_addr = self.ipAddressRender(Instance['addresses']);
          self.Instance_status = self.powerStatusRender(Instance['OS-EXT-STS:power_state']);
          self.Instance_flavor = self.flavorRender(Instance['flavor'].id);
          self.Instance_time = self.dateRender(Instance['created']);
          self.Instance_project = self.projectRender(Instance['tenant_id']);
          self.Instance_user = self.ownerRender(Instance['user_id']);
        } catch (res) {
          // self.$message.error('获取失败!');
        }
      },
      powerStatusRender(value) {
       var status = value + "";
       if ("0" == status) {
         return '-';
       } else if ("1" == status) {
         return Vue.t('calcStorLang.running');
       } else if ("3" == status) {
         return Vue.t('calcStorLang.paused');
       } else if ("4" == status) {
         return Vue.t('calcStorLang.closed');
       } else if ("6" == status) {
         return Vue.t('calcStorLang.inst_collapse');
       } else if ("7" == status) {
        return Vue.t('calcStorLang.suspended');
       } else {
         return '-';
       }
     },
     getAddr() {
       return this.Instance_addr;
     },
    dateRender(value) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    /**
     * 将时间戳格式化的方法
     * @param timeStamp时间戳值
     * @param fmt 要生成的格式，如yyyy-MM-dd HH:mm:ss
     * @returns
     */
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
    },
    flavorRender(value) {
       var self = this;
       var uuid = value;
       return self.flavorMaps.get(uuid) || "-";
    },
    ownerRender(value) {
      var self = this;
      var userId = value;
      return self.userMaps.get(userId) || "-";
    },
    projectRender(value) {
      var self = this;
      var projectId = value;
      return self.projectMaps.get(projectId) || "-";
    },
    ipAddressRender(value) {
      var address = value;
      var list = Object.keys(address).map(function(el) {
          return address[el];
      });
      if (list != null) {
         if (list.length > 1) {
           var ipShow = "";
           for (let addr in address) {
             var ipList = address[addr];
             var ips = "";
             for (let n = 0; n < ipList.length; n++) {
               var net = ipList[n];
               var type = net['OS-EXT-IPS:type'];
               if (type == "floating") {
                 ips += net.addr + "(" + Vue.t('network.floatingIP') + ")" + "<br>";
               } else {
                 ips += net.addr + "<br>";
               }
             }
            //  ipShow += addr + "<br>" + ips;
             ipShow += ips;
           }
           return ipShow;
         } else if (list.length == 0) {
            return "-";
         } else {
           var ipShow2 = "";
           for (let addr in address) {
             var ipList2 = address[addr];
             var ips2 = "";
             for (let n = 0; n < ipList2.length; n++) {
               var net2 = ipList2[n];
               var type2 = net2['OS-EXT-IPS:type'];
               if (type2 == "floating") {
                 ips2 += net2.addr + "(" + Vue.t('network.floatingIP') + ")" + "<br>";
               } else {
                 ips2 += net2.addr + "<br>";
               }
             }
             ipShow2 += ips2;
           }
           return ipShow2;
         }
      } else {
         return "-";
      }
    }
  }
}
</script> 