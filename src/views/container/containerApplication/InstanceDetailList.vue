<template>
  <div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="uid"
      @row-click="rowClick"
      @sort-change="sortChange"
      @expand="tableExpand"
      :expand-row-keys="expands"
      @selection-change="handleSelectionChange">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table
          ref="subtable"
          :data="inTableData"
          row-key="uid"
          highlight-current-row
          stripe
          :default-sort = "{prop: 'creation_time', order: 'ascending'}"
          @sort-change="sortChangeIn">
            <el-table-column
              v-if="columnsCheckedIn.indexOf('name') >= 0"
              prop="name"
              :label="$t('container.containerEventName')"
              show-overflow-tooltip
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column
              v-if="columnsCheckedIn.indexOf('event') >= 0"
              prop="event"
              :label="$t('container.containerEvent')"
              show-overflow-tooltip
              align="left"
              min-width="100">
            </el-table-column>
            <el-table-column
              v-if="columnsCheckedIn.indexOf('event_detail') >= 0"
              prop="event_detail"
              :label="$t('container.containerEventDetail')"
              show-overflow-tooltip
              align="left"
              min-width="200">
            </el-table-column>
            <el-table-column
              v-if="columnsCheckedIn.indexOf('creation_time') >= 0"
              prop="creation_time"
              :label="$t('container.time')"
              show-overflow-tooltip
              align="left"
              sortable="custom"
              min-width="100">
              <template slot-scope="scope">
                <span>{{dateFormatter(scope.row.creation_time)}}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('status') >= 0"
        prop="status"
        :label="$t('lang.status')"
        show-overflow-tooltip
        align="left"
        min-width="50">
        <template slot-scope="scope">
          <el-tag :type="statusTagRender(scope.row.status)">
            <span>{{getStatus(scope.row.status)}}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('image') >= 0"
        prop="image"
        :label="$t('container.image')"
        show-overflow-tooltip
        min-width="100">
        <template slot-scope="scope">
          <span v-html="imageRender(scope.row.image)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('hostIP') >= 0"
        prop="hostIP"
        :label="$t('container.hostIP')"
        show-overflow-tooltip
        align="left"
        min-width="50">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('creation_time') >= 0"
        prop="creation_time"
        :label="$t('lang.createTime')"
        show-overflow-tooltip
        align="left"
        sortable="custom"
        min-width="100">
        <template slot-scope="scope">
          <span>{{dateFormatter(scope.row.creation_time)}}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('volume') >= 0" prop="volume" :label="$t('container.attachedVolume')" show-overflow-tooltip min-width="100">
        <template slot-scope="scope">
          <span v-html="volumeListRender(scope.row.volume)"></span>  
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
      </el-row>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'InstanceList',
    data () {
      return {
        dateFormatter:Vue.tzTimeFormatter,
        appName:this.$route.params.appName,
        nameSpace:this.$route.params.nameSpace,
        type:this.$route.params.type,
        rancherClusterId:this.$route.params.rancherClusterId,
        total: 0,
        columns: [],
        columnsChecked:["name", "status", "image", "hostIP", "creation_time", "volume"],
        columnsCheckedIn:["name", "event", "event_detail", "creation_time"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        queryParam: {
          filed: "",
          dir: ""
        },
        inTableData:[],
        expands:[],
        loading: false
      };
    },
    watch: {
      columnsChecked: {
        handler: function (rows, oldVal) {
         this.columnsChecked = rows;
        },
        deep: true
      }
    },
    mounted() {
      let table = this.$refs.table;
      table.$children.forEach((item, index) => {
        if (item.label && item.prop) {
          this.columns.push({
            prop: item.prop,
            label: item.label
          });
        }
      });
      this.getPodList();
    },
    methods: {
      async getPodList() {
        let self = this;
        self.loading = true;
        try {
          let ret = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_pods',
            data:JSON.stringify({
              app_name:self.appName,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            }),
            successFun:function(response) {
              let items = response.items;
              let dataList = response.items;
              self.totalData = [];
              for (let data of dataList) {
                if (!data.metadata.deletionTimestamp) {
                  let obj = {};
                  // 异常状态处理
                  if (data.status.containerStatuses) {
                    if (data.status.containerStatuses[0].state) {
                      if (data.status.containerStatuses[0].state.waiting) {
                        data.status.phase = "Pending";
                      }
                    }
                  }

                  obj.uid = data.metadata.uid;
                  obj.name = data.metadata.name;
                  obj.creation_time = data.metadata.creationTimestamp;
                  obj.status = data.status.phase;
                  obj.hostIP = data.status.hostIP;
                  let containers = data.spec.containers;
                  obj.image = "";
                  for (let c=0; c<containers.length; c++) {
                    if (c == containers.length -1) {
                      obj.image += containers[c].image;
                    } else {
                      obj.image += containers[c].image+";";
                    }
                  }
                  obj.volume = data.spec.volumes;
                  self.totalData.push(obj);
                }
              }
              // 查询过滤
              self.total = self.totalData.length;
            }
          });
          self.loading = false;
        } catch (data) {
          self.loading = false;
        }
      },
      rowNameClick(rowIndex, rowData) {
        this.$router.push({
          path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
            this.nameSpace + "/" + this.appName + "/appDetail/instanceList" + "/" + rowData.name + "/podDetail"
        });
      },
      getStatus(status) {
        if (status == "Running") {
          return this.$t('container.running');
        } else if (status == "Pending") {
          return this.$t('container.processing');
        } else if (status == "Succeeded") {
          return this.$t('container.closed');
        } else if (status == "Failed") {
          return this.$t('container.closed');
        } else if (status == "waiting") {
          return this.$t('container.abnormal');
        }
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "Running") {
          tagType = "success";
        } else if (value === "Succeeded" || value === "Failed") {
          tagType = "gray";
        } else if (value === "Pending") {
          tagType = "info";
        } else if (value === "waiting") {
          tagType = "danger";
        }
        return tagType;
      },
      getCurrentData(param) {
        this.tableData = param;
      },
      //多选
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //排序
      sortChange(column) {
        var self = this;
        var key = column.prop;
        var keyOrder = column.order;
        self.queryParam.key = column.prop;
        self.queryParam.keyOrder = column.order;
        if (keyOrder != null && self.totalData != null) {
          self.totalData.sort(self.$sortFormatter(key, keyOrder));
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getPodList();
      },
      //排序
      sortChangeIn(column) {
        var self = this;
        var key = column.prop;
        var keyOrder = column.order;
        self.queryParam.key = column.prop;
        self.queryParam.keyOrder = column.order;
        if (keyOrder != null && self.inTableData != null) {
          self.inTableData.sort(self.$sortFormatter(key, keyOrder));
        }
      },
      async tableExpand(row, expanded) {
        let self = this;
        if (expanded) {
          self.expands = [];
          self.expands.push(row.uid);
        } else {
          self.expands = [];
        }
        try {
          let ret = await self.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_events',
            data:JSON.stringify({
              app_name:self.appName,
              app_id:row.uid,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            }),
            success:function(response) {
              let dataList = response.items;
              self.inTableData = [];
              for (let data of dataList) {
                let obj = {};
                obj.uid = data.metadata.uid;
                obj.name = data.metadata.name;
                obj.event = data.reason;
                obj.event_detail = data.message;
                obj.creation_time = data.metadata.creationTimestamp;
                self.inTableData.push(obj);
                self.inTableData.sort(self.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
              }
            }
          });
        } catch (data) {
        }
      },
      volumeListRender(volumes) {
        if (volumes.length == 0) {
          return "-";
        } else {
          let labels = "";
          for (let i=0; i<volumes.length; i++) {
            let volume = volumes[i];
            if (!volume.hasOwnProperty("secret")) {
              labels += volume.name + "<br>";
            }
          }
          return labels;
        }
      },
      imageRender(images) {
        let labels = "";
        let image = images.split(";");
        for (let i=0; i<image.length; i++) {
          labels+= image[i] + "<br>";
        }
        return labels;
      }
    }
  };
</script>

