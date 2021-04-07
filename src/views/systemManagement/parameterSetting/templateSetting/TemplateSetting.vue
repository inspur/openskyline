<template>
<div>
  <div>
    <div style="width:80px;display: inline-block;">
      <el-select v-model="selValue"style="width:80px;" @change="getTableData">
        <el-option :label="$t('base.whole')" value=""></el-option>
        <el-option :label="$t('base.chinese')" value="0"></el-option>
        <el-option :label="$t('base.english')" value="1"></el-option>
      </el-select>
    </div>
    <div style="width:80px;display: inline-block;margin-left:6px;position:relative;top:-1px;">
      <operation-panel
        class="margin-tb5"
        :select-rows="multipleSelection"
        :operation-menus="operationMenus">
      </operation-panel>
    </div>
  </div>
  <el-table
    ref="deTable"
    :data="tableData"
    v-loading="loading"
    :element-loading-text="$t('base.loadingData')"
    highlight-current-row
    style="width: 100%"
    row-key="id"
    @row-click="rowClick"
    @current-change="handleSelectionChange">
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
      prop="name"
      :label="$t('base.name')"
      align="left"
      min-width="60">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('SmsTemplate') >= 0"
      prop="sms_content"
      align="left"
      :label="$t('base.smsTemplate')"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('email_subject') >= 0"
      prop="email_subject"
      align="left"
      :label="$t('base.mailTheme')"
      min-width="60">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('emailTemplate') >= 0"
      prop="email_content"
      align="left"
      :label="$t('base.mailTemplate')"
      :show-overflow-tooltip="false"
      width="270">
      <template slot-scope="scope">
        <!-- <div v-html="scope.row.email_content"></div> -->
        <el-tooltip effect="dark" popper-class="me-tooltip__popper">
          <div slot="content" v-html="scope.row.email_content"></div>
          <span>{{parseStr(scope.row.email_content)}}</span>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('templateParam') >= 0"
      prop="param_describe"
      align="left"
      :label="$t('base.templateParaDes')"
      min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('language') >= 0"
      prop="language"
      align="left"
      :label="$t('base.language')"
      min-width="40">
      <template slot-scope="scope">
        <span>{{scope.row.language==0?$t('base.chinese'):$t('base.english')}}</span>
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="getTableData">
        </el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$t('lang.selectCloumn')}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <page ref="page" :totalData="allData" @getCurrentData="getCurrentData"></page>
      </el-col>
    </el-row>
  </div>
  <edit-template ref="editTemplate" v-if="flg" :id="editId" @getCurrentData="getTableData"></edit-template>
</div>
</template>
<script>
import EditTemplate from './EditTemplate'
export default {
  name:"templateSetting",
  watch:{
    multipleSelection:function (arr) {
      if (arr[0]) {
        this.editId = arr.length==0?"":arr[0].id;
      }
    }
  },
  data() {
    return {
      tableData:[],
      allData:[],
      editId:"",
      selValue: "",
      flg:false,
      loading:false,
      emptyText: Vue.t('base.noData'),
      multipleSelection: [],
      columns: [{
        prop: "name",
        label: this.$t('base.name')
      }, {
        prop: "SmsTemplate",
        label: this.$t('base.smsTemplate')
      }, {
        prop: "email_subject",
        label: this.$t('base.mailTheme')
      }, {
        prop: "emailTemplate",
        label: this.$t('base.mailTemplate')
      }, {
        prop: "templateParam",
        label: this.$t('base.templateParaDes')
      }, {
        prop:"language",
        label:this.$t('base.language')
      }],
      columnsChecked:["name", "SmsTemplate", "email_subject", "emailTemplate", "templateParam", "language"],
      operationMenus:[{
        icon: "fa-edit",
        name: this.$t('base.edit'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return true;
        },
        handler: function(rows) {
          this.flg = true;
          this.$nextTick(() => {
            this.$refs.editTemplate.show(rows[0]);
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData() {
      this.loading = true;
      //监控服务未开启时，过滤监控服务相关模板
      let monitorTem = ['monitor.info.cn', 'monitor.info.en', 'monitor.recovery.cn', 'monitor.recovery.en', 'system.disk.usage.ratio.remind.template.cn', 'system.disk.usage.ratio.remind.template.en']
      let param = {};
      if (this.selValue!="") {
        param.language = this.selValue;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/template?"+$.param(param)
      });
      if (!Vue.service.pluto) {
        for (let i=ret.templates.length-1; i>=0; i--) {
          let tem = ret.templates[i];
          if (monitorTem.includes(tem.id)) {
            ret.templates.splice(i, 1);
          }
        }
      }
      this.allData = ret.templates;
      this.$nextTick(() => {
        this.multipleSelection = [];
      });
      this.loading = false;
    },
    parseStr(str) {
      let cstr = str.replace(/<\/?.+?>/g, "").replace(/&nbsp;/g, '');
      let len = cstr.length;
      if (len>30) {
        return cstr.substring(0, 24)+"...";
      } else {
        return cstr;
      }
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = [val];
    }
  },
  components: {
    EditTemplate
  }
}
</script>
