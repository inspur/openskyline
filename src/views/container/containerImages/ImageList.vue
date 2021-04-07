<template>
  <div>
    <icos-page-header :title="$t('container.containerImage')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <icos-page>
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('lang.name')">
        <el-input v-model="formInline.name" size="small"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="onSubmit" size="small">{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>
    <div class="divider clearfix"></div>
    <div @mousedown="onDetailPanelBack">
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
      ref="table"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      stripe
      :default-sort = "{prop: 'name', order: 'ascending'}"
      row-key="id"
      @row-click="rowClick"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
     <!--  <el-table-column type="expand">
        <template slot-scope="scope">
          
        </template>
      </el-table-column> -->
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('lang.name')"
        show-overflow-tooltip
        sortable="custom"
        min-width="100" align="left">
        <template slot-scope="scope">
          <el-button @click="rowNameClick(scope.$index, scope.row)" type="text" size="small">{{scope.row.name}}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('tags_count') >= 0"
        prop="tags_count"
        :label="$t('container.tagCount')"
        show-overflow-tooltip
        align="left"
        min-width="100">
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('pull_count') >= 0"
        prop="pull_count"
        :label="$t('container.pullCount')"
        show-overflow-tooltip
        sortable="custom"
        align="left"
        min-width="100">
      </el-table-column>
      <!-- <el-table-column
        v-if="columnsChecked.indexOf('update_time') >= 0"
        prop="update_time"
        label="修改时间"
        show-overflow-tooltip
        align="left"
        min-width="100">
        <template slot-scope="scope">
          <span>{{dateFormatter(scope.row.update_time)}}</span>
        </template>
      </el-table-column>  -->
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}} {{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
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

    <image-push-info ref="ImagePushInfo" v-if="imagePushInfoFlag" :harborId="harborId" :serverAddr="serverAddr" :groupName="groupName" @handleAddShow="handleAddShow"></image-push-info>

    <transition name="slide-right" mode="out-in">
      <div style="width: 800px;" class="slide-panel" v-if="detailFlag">
        <panel style="height: 100%">
          <div slot="title" class="clearfix" >
           <el-button type="text" icon="fa-arrow-right" @click="onDetailPanelBack">{{$t('lang.back')}}</el-button>
          </div>
          <div style="text-align:left">
            <image-tag ref="imageTag" :harborId="harborId" :serverAddr="serverAddr" :rowImageName="rowImageName" :groupId="groupId" @refreshImageList="getData"></image-tag>
          </div>
        </panel>
      </div>
    </transition>
    </icos-page>
  </div>
</template>
<script>
  import ImagePushInfo from "./ImagePushInfo"
  import ImageTag from "./ImageTagList"
  export default {
    name: 'ImageList',
    components:{ImagePushInfo, ImageTag},
    data () {
      return {
        formInline: {
          name:""
        },
        rowImageName:"",
        harborId:this.$route.params.harborId,
        serverAddr:this.$route.params.server,
        groupId:this.$route.params.groupId,
        groupName:this.$route.params.groupName,
        dateFormatter:Vue.tzTimeFormatter,
        imagePushInfoFlag:false,
        detailFlag:false,
        total: 0,
        columns: [],
        columnsChecked:["name", "tags_count", "pull_count"],
        tableData: [],
        totalData:[],
        multipleSelection: [],
        operationMenus:[{
          icon: "fa-cloud-upload",
          name: this.$t('container.pushImage'),
          showflg: true,
          readOnly: true,
          handler: function(selectedRows) {
            this.imagePushInfoFlag = true;
            this.$nextTick(() => {
              this.$refs.ImagePushInfo.show();
            });
          }.bind(this)
        }, {
          icon: "fa-remove",
          name: this.$t('lang.delete'),
          showflg: Vue.roleType == "0",
          readOnly: false,
          multi:false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
              confirmButtonText:this.$t('lang.confirm'),
              cancelButtonText:this.$t('lang.cancel'),
              type:'warning'
            }).then(() => {
              this.loading = true;
              this.$ajax({
                type:'POST',
                url: "api/cetus/v1/harbor/delete_repository",
                data: JSON.stringify({
                  harbor_id: this.harborId,
                  repository_name: selectedRows[0].name
                }),
                log:{
                  description:{
                    en:"Delete container image:" + selectedRows[0].name,
                    zh_cn:"删除容器镜像:" + selectedRows[0].name
                  },
                  target:Vue.logTarget.containerImage
                },
                showErrMsg:false,
                successMsg:this.$t('container.deleteSuccessMsg'),
                successFun:() => {
                  this.loading = false;
                  this.getData();
                },
                errFun:(xhr, status, msg) => {
                  if (xhr.status == 401 && msg == "Unauthorized") {
                    this.$message.error(this.$t('container.containerImageAuthError'));
                  }
                  this.loading = false;
                  this.getData();
                }
              });
            }).catch(() => {
            });
          }.bind(this)
        }],
        queryParam: {
          filed: "",
          dir: ""
        },
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
      this.getData();
    },
    methods: {
      async getData(param, isClear = true) {
        let self = this;
        self.loading = true;
        try {
          let ajaxParam = {
            type: 'POST',
            url: "api/cetus/v1/harbor/repositories",
            data: JSON.stringify({
              harbor_id:self.harborId,
              project_id:self.groupId
            })
          };
          let ret = await this.$ajax(ajaxParam);
          self.loading = false;
          let dataList = ret;
          // 查询过滤
          self.totalData = self.filterList(dataList, self.formInline);
          self.total = self.totalData.length;
          // 排序
          self.totalData.sort(this.$sortFormatter(self.queryParam.key, self.queryParam.keyOrder));
        } catch (data) {
          self.loading = false;
        }
        if (isClear) {
          // 是否清空选中
          self.$nextTick(() => {
            self.$refs.table.clearSelection();
          });
        }
      },
      filterList(allData, formInline) {
        let nameFilteredData = [];
        if (formInline.name === '') {
          nameFilteredData = allData;
        } else {
          allData.forEach(function(obj) {
            if (obj.name.indexOf(formInline.name) > -1) {
              nameFilteredData.push(obj);
            }
          });
        }
        return nameFilteredData;
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
          let orderType = "";
          if (key == "pull_count") {
            orderType = "number";
          }
          self.totalData.sort(this.$sortFormatter(key, keyOrder, orderType));
        }
      },
      rowClick(row) {
        this.$refs.table.toggleRowSelection(row);
      },
      //刷新
      onRefresh() {
        this.getData(this.queryParam, true);
      },
      rowNameClick(rowIndex, rowData) {
        this.detailFlag = true;
        this.$refs.table.clearSelection();
        this.rowImageName = rowData.name;
        this.$nextTick(() => {
          this.$refs.imageTag.getData();
        });
      },
      onSubmit() {
        if (this.formInline.name.length > 40) {
          this.$message.error(this.$t('heat.fortyCharacterMaximum'));
          return;
        }
        this.getData();
      },
      handleAddShow() {
        this.imagePushInfoFlag = false;
      },
      onDetailPanelBack() {
        this.detailFlag = false;
      },
      handlePageHeaderBack () {
        this.$router.push({
          path:"/container/containerImages/imageGroup/"+this.harborId +"/" + this.serverAddr
      });
      }
    }
  };
</script>

