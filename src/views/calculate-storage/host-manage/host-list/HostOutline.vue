<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="$t('base.basicAttributes')" v-if="service.pluto" name="1" style="text-align: left;">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath" style="width:140px;">{{$t('base.resourceName')}}：</th>
                  <td class="idatatd">{{hostname}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.processQuantity')}}：</th>
                  <td class="idatatd">{{obj.processes}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath" style="width:140px;">{{$t('base.startMacTime')}}：</th>
                  <td class="idatatd">{{obj.uptime}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('base.oneMiLoad')}}：</th>
                  <td class="idatatd">{{obj.load}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.hardInfo')" name="2" style="text-align: left;">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath" style="width:140px;">CPU：</th>
                  <td class="idatatd">{{obj.cpu_hz}}</td>
                </tr>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.memory')}}：</th>
                  <td class="idatatd">{{obj.totalmem}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath" style="width:140px;">{{$t('calcStorLang.storage')}}：</th>
                  <td class="idatatd">{{obj.totaldisk}}</td>
                </tr>
                <tr>
                  <!-- <th class="idatath">{{$t('base.numberOfNetwork')}}：</th>
                  <td class="idatatd">{{obj.netnumber}}</td> -->
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('base.BMCInfo')" name="3" style="text-align: left;">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.bmcUserName')}}：</th>
                  <td class="idatatd">{{resultData.ipmi_user}}</td>
                </tr>
                <!-- <tr>
                  <th class="idatath">{{$t('calcStorLang.bmcPassword')}}：</th>
                  <td class="idatatd">{{resultData.ipmi_passwd}}</td>
                </tr> -->
              </tbody>
            </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr>
                  <th class="idatath">{{$t('calcStorLang.bmcIP')}}：</th>
                  <td class="idatatd">{{resultData.ipmi_ip}}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item :title="$t('Numa')" name="4" style="text-align: left;">
        <el-row :gutter="10">
          <el-col :span="24">
            <span style="color:#249476">cpu:&nbsp;</span><span>{{ $t('calcStorLang.hostCPUNumaAvailable') }}</span>
            <span style="color:#ff4949">cpu:&nbsp;</span><span>{{ $t('calcStorLang.hostCPUNumaNotAvailable') }}</span>
            <div class="table_panel">
              <el-card class="box-card" v-for="(numa, index) in numaList" :key="index">
                <div slot="header" class="clearfix">
                  <span>{{'node' + index}}</span>
                </div>
                <div class="text item">
                  <el-radio-group size="small" fill="#bfcbd9"><!-- fill="#ff4949" -->
                    <el-radio-button v-for="cpu in numa.split(' ')" :key="cpu">
                      <span :style="showStyle(cpu)">{{nameRender(cpu)}}</span>
                    </el-radio-button>
                  </el-radio-group>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'hostOutline',
  props:{
    info: {
      type: Object,
      default: function () {
        return {}
      }
    },
    hostname:{
      type:String
    }
  },
  watch: {
    hostname: {
      immediate: false,
      handler: function() {
        this.getData();
        this.bindingMap.clear();
        this.numaList = [];
        this.loadNumaList();
      }
    }
  },
  data() {
    return {
      service:Vue.service,
      radioStyle:"color:#249476",
      radioStyle2:"color:#ff4949",
      numaList:[],
      bindingMap:new Map(),
      activeNames:["1", "2", "3", "4"],
      resultData:{
        ipmi_ip:"",
        ipmi_user:"",
        ipmi_passwd:""
      },
      obj:{
        cpu_hz:"",
        load:"",
        netnumber:"",
        processes:"",
        totaldisk:"",
        totalmem:"",
        uptime:''
      },
      formatFileSize:formatFileSize
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      if (this.service.pluto) {
        let obj = await this.$ajax({
          type: 'get',
          url: "api/pluto/v1/monitor/hosts/"+this.hostname+"/info"
        })
        this.obj = {
          cpu_hz:this.info.vcpus+Vue.t('base.core'),
          load:obj.load,
          netnumber:obj.netnumber,
          processes:obj.processes,
          totaldisk:this.formatFileSize(this.info['local_gb'], "GB"),
          totalmem:this.formatFileSize(this.info['memory_mb'], "MB"),
          uptime:obj.uptime/60>60?(obj.uptime/60/60>24?(obj.uptime/60/60/24).toFixed(2)+" "+Vue.t('base.day'):(obj.uptime/60/60).toFixed(2)+" "+Vue.t('base.hour')):(obj.uptime/60).toFixed(2)+" "+Vue.t('base.minute')
        }
        try {
          let result = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/os-hypervisor-ipmis/"+this.hostname
          })
          this.resultData = {
            ipmi_ip:result.ipmi_detail.ipmi_ip,
            ipmi_user:result.ipmi_detail.ipmi_user,
            ipmi_passwd:result.ipmi_detail.ipmi_passwd
          }
        } catch (res) {
        }
      } else {
        this.obj = {
          cpu_hz:this.info.vcpus+Vue.t('base.core'),
          totaldisk:this.formatFileSize(this.info['local_gb'], "GB"),
          totalmem:this.formatFileSize(this.info['memory_mb'], "MB")
        }
      }
      this.loadNumaList();
    },
    async loadNumaList() {
      try {
          let result = await this.$ajax({
            type: 'get',
            url: "api/nova/v2.1/os-hypervisors-inspur/"+ this.hostname + "/get_host_numainfo"
          })
          var data = result['numa_info'];
          this.numaList = data;
          var bingList = result['cpu_pin_info'].split(",");
          for (let b in bingList) {
            this.bindingMap.set(bingList[b], bingList[b]);
          }
        } catch (res) {
        }
    },
    showStyle(value) {
      var self = this;
      if (self.bindingMap.has(value) || self.bindingMap == null || self.bindingMap.size == 0) {
        return self.radioStyle;
      } else {
        return self.radioStyle2;
      }
    },
    nameRender(value) {
      return "cpu" + value;
    }
  }
}
</script>
<style scoped>
.el-radio-button {
  margin-right:10px;
  margin-top:5px;
}
</style>
