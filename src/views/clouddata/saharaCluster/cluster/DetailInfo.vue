<template>
  <div>
    <el-collapse v-model="activeNames" style="text-align:left">
      <el-collapse-item title="一般信息" name="1">
        <el-row>
        <el-col :span="12">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
              <tr class="odd">
                <th class="idatath">{{$t('lang.name')}}：</th>
                <td class="idatatd">{{name}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('lang.status')}}：</th>
                <td class="idatatd">{{status}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">ID：</th>
                <td class="idatatd">{{id}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('container.clusterTemplate')}}</th>
                <td class="idatatd">{{templateId}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('base.image')}}</th>
                <td class="idatatd">{{imageId}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('base.network')}}</th>
                <td class="idatatd">{{networkId}}</td>
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
                <th class="idatath">{{$t('storage.createdTime')}}</th>
                <td class="idatatd">{{created_at}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('storage.updatedTime')}}</th>
                <td class="idatatd">{{updated_at}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('lang.public')}}：</th>
                <td class="idatatd">{{ispublic}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('base.protected')}}：</th>
                <td class="idatatd">{{isprotected}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('calcStorLang.keypair')}}</th>
                <td class="idatatd">{{keypari}}</td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('lang.desc')}}：</th>
                <td class="idatatd">{{description}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        </el-col>
        <el-col :span="24">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
                <tr class="odd" v-for="item in infos" :key="item.key">
                  <th class="idatath">{{item.key}}</th>
                  <td class="idatatd">{{item.value}}</td>
                </tr>
            </tbody>
          </table>
        </div>
        </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item title="节点组" name="2">
        <el-table
          ref="table"
          :data="nodetableData"
          highlight-current-row
          stripe
          :default-sort="{prop: 'name', order: 'ascending'}"
          row-key="id"
          >
          <el-table-column
            v-if="columnsChecked.indexOf('name') >= 0"
            prop="name"
            :label="$t('lang.name')"
            show-overflow-tooltip
            min-width="100">
            <template slot-scope="scope">
              <el-button @click="showDetail(scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('node_processes') >= 0"
            prop="node_processes"
            :label="$t('cloudData.SERVICE_PROCESS')"
            show-overflow-tooltip
            align="left"
            min-width="100">
            <template slot-scope="scope">
              <span v-html="processRender(scope.row.node_processes)"></span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('count') >= 0"
            prop="count"
            label="节点数量"
            show-overflow-tooltip
            min-width="50">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('created_at') >= 0" prop="created_at" :label="$t('storage.createdTime')" min-width="100" align="left">
            <template slot-scope="scope">
              <span v-html="dateRender(scope.row.created_at)"></span>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('description') >= 0" prop="description" :label="$t('lang.desc')" align="left" min-width="100">
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import moment from 'moment';
export default {
  name: "DEtailInfo",
  props: ["clusterId"],
  data() {
    return {
      activeNames: ["1", "2"],
      name: "",
      description: "",
      id: "",
      updated_at: "",
      created_at: "",
      imageId: "",
      networkId: "",
      templateId: "",
      status: "",
      keypari: "",
      ispublic: false,
      isprotected: false,
      nodetableData: [],
      infos: [],
      columnsChecked: ["name", "created_at", "description", "node_processes", "count"],
      projectId: this.$cookie.get('pid')
    }
  },
  watch: {
    clusterId: {
      handler: function(rows, oldVal) {
        const $this = this;
        $this.initDetail();
      }
    }
  },
  mounted() {
    this.initDetail()
  },
  methods: {
    initDetail() {
      let self = this;
      self.$ajax({
        type: "GET",
        url: "api/sahara/v2/"+self.projectId+"/clusters/"+self.clusterId,
        data: {},
        success: function(result) {
          let cluster = result["cluster"];
          self.name = cluster["name"];
          self.description = cluster["description"];
          self.id = cluster["id"];
          self.status = cluster["status"];
          self.updated_at = self.dateRender(cluster["updated_at"]);
          self.created_at = self.dateRender(cluster["created_at"]);
          self.templateId = cluster["cluster_template_id"];
          self.imageId = cluster["default_image_id"];
          self.networkId = cluster["neutron_management_network"];
          self.keypari = cluster["user_keypair_id"];
          self.ispublic = cluster["is_public"];
          self.isprotected = cluster["is_protected"];
          self.nodetableData = cluster["node_groups"];
          if (String(cluster["info"]) !== "{}") {
            self.info = [];
            let info = cluster["info"];
            for (let item in info) {
              self.infos.push({
                key: item,
                value: info[item]
              })
            }
          }
        },
        errFun() {
        }
      });
    },
    projectIdToName(projectId) {
      let self = this;
      this.$ajax({
        type: "GET",
        url: "api/keystone/v3/projects/" + projectId,
        success: function(result) {
          let project = result["project"];
          self.project_name = project.name;
        },
        errFun: function() {
          self.project_name = "";
        }
      });
    },
    dateRender(utc) {
      return moment.utc(utc).local().format('YYYY-MM-DD HH:mm:ss');
    },
    processRender(arr) {
      let str = "";
      for (let i=0; i<arr.length; i++) {
        str += arr[i] +"<br>";
      }
      return str;
    },
    showDetail(row) {
      this.$router.push({
        path:"/clouddata/nodeGroup/" + row["node_group_template_id"]+"/groupDetail"
      });
    }
  }
}
</script>
<style scoped>
  .idatath {
    width: 100px;
  }
</style>