<template>
<el-form
  v-loading="loading"
  :element-loading-text="$t('lang.defaultLoadingMsg')"
  label-position="right"
  :model="processAddForm"
  :rules=rules ref="processAddForm"
  label-width="120px">
  <el-form-item :label="$t('opt.name')" prop="processName" class="is-required">
    <el-input class="col-12" v-model="processAddForm.processName" auto-complete="off"></el-input>
  </el-form-item>
  <el-form-item :label="$t('opt.description')" prop="processAlias" class="" >
    <el-input class="col-12" v-model="processAddForm.processAlias" auto-complete="off"></el-input>
  </el-form-item>
  <el-form-item :label="$t('opt.selectLevel')">
    <el-select v-model="selectLevel">
      <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item :label="$t('opt.selectOrganization')">
    <el-select v-model="selectOrgs" multiple  style="width:600px">
      <el-option v-for="item in orgs" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item :label="$t('opt.selectType')">
    <ztreeProcess ref="ztreeProcess" ></ztreeProcess>
  </el-form-item>
  <el-form-item :label="$t('opt.level1User')" v-for="(item, itemIndex) in panels"
        :key="itemIndex">
    <Panel  style="width:600px">
      <div style="height:190px;width:100%">
        <el-form :inline="true">
        <el-form-item label="节点数量">
          <el-input class="col-12" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-for="(item, itemIndex) in panels" label="节点1">
          <el-select  class="col-6" v-model="selectUsers" placeholder="节点类型">
            <el-option v-for="item in nodeTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
           <el-input class="col-12" auto-complete="off"></el-input>
           <el-button @click="addScheduleRange" class="margin-l10" icon="fa-plus" type="primary" size="mini"></el-button>
        </el-form-item>
        </el-form>
      </div>
    </Panel>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="submitForm">{{$t('opt.submit')}}</el-button>
    <el-button @click="resetForm">{{$t('opt.cancel')}}</el-button>
  </el-form-item>
</el-form>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import ZtreeProcess from './ZtreeProcess'
import dateTimeFormatter from 'utils/dateTimeFormatter';
export default {
  name: 'processAdd',
  data() {
    return {
      processAddForm: {
        processName: "",
        processAlias: "",
        orgNames: []
      },
      levelOptions:[{
        value: 1,
        label: "一级审批"
      }, {
        value: 2,
        label: "二级审批"
      }, {
        value: 3,
        label: "三级审批"
      }, {
        value: 4,
        label: "四级审批"
      }, {
        value: 5,
        label: "五级审批"
      }],
      orgs:[{
        value: "1",
        label: "组织1"
      }, {
        value: "2",
        label: "组织2"
      }, {
        value: "3",
        label: "组织3"
      }, {
        value: "4",
        label: "组织4"
      }, {
        value: "5",
        label: "组织5"
      }],
      orgUsers:[{
        value: "1",
        label: "组织管理员1"
      }, {
        value: "2",
        label: "组织管理员2"
      }, {
        value: "3",
        label: "组织管理员3"
      }, {
        value: "4",
        label: "组织管理员4"
      }, {
        value: "5",
        label: "组织管理员5"
      }],
      typeOptions:[{
        value: "1",
        label: "申请云主机"
      }, {
        value: "2",
        label: "申请网络"
      }, {
        value: "3",
        label: "申请存储"
      }],
      selectLevel: 1,
      selectUsers: ["2", "3"],
      selectOrgs: ["2", "3"],
      selectTypes: ["1"],
      selectSchedule: 0,
      daySelect: "january 1 - december 31",
      weekSelect: "",
      monthSelect: "",
      rules: {
        processName: [
          {type: 'required', trigger: 'blur change'}
        ]
      },
      loading: false,
      tableData: [],
      panels: [{
        value: "1",
        label: "组织管理员1"
      }, {
        value: "2",
        label: "组织管理员2"
      }, {
        value: "3",
        label: "组织管理员3"
      }, {
        value: "4",
        label: "组织管理员4"
      }, {
        value: "5",
        label: "组织管理员5"
      }]
    };
  },
  watch: {
  },
  mounted() {
    this.scheduleId = this.$route.params.id || '';
    this.$parent.active = "schedule-manage";
    this.initForm = Object.assign({}, this.processAddForm);
    this.init();
  },
  methods: {
    async init() {
    },
    submitForm() {
      if (this.tableData.length <= 0) {
        this.$message.error(Vue.t('lang.noScheduleError'));
        return;
      }
      this.$refs.processAddForm.validate(async (valid) => {
        if (!valid) { return; }
        let data = {};
        data = Object.assign({}, data, this.processAddForm);
        data.scheduleEntryList = this.tableData;
        data = JSON.stringify(data);
      });
    },
    resetForm() {
      this.$refs.processAddForm.resetFields();
      let parentPath = this.$route.matched[1].path;
      this.$router.push({
        path: '/process/flow-manage'
      });
      // Object.assign(this.form, this.$options.data().form)
    },
    addScheduleRange() {
      let dateDisplay = "";
      if (this.daySelect) {
        dateDisplay = Vue.t('lang.everyDay');
      } else if (this.monthSelect) {
        dateDisplay = Vue.t( "lang." + this.monthSelect.split(" ")[0])
      } else {
        dateDisplay = Vue.t('lang.' + this.weekSelect);
      }
      if (this.selectSchedule == '1') {
        !this.datePickerModel &&
        this.$message.error(Vue.t('lang.noScheduleRange'));
        dateDisplay = dateTimeFormatter(this.datePickerModel[0], 'YYYY-MM-DD') + '-' +
          dateTimeFormatter(this.datePickerModel[1], 'YYYY-MM-DD');
      }
      this.tableData.push({
        dates: dateDisplay,
        times: dateTimeFormatter(this.timePickerModel[0], 'HH:mm:ss') + '-' +
          dateTimeFormatter(this.timePickerModel[1], 'HH:mm:ss')
      })
    },
    deleteRow(index, rows) {
      rows.splice(index, 1);
    }
  },
  components: {
    ZtreeProcess
  }
}
</script>
<style scoped>
</style>
