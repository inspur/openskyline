<template>
<el-dialog ref="dialogref" :visible.sync="dialogVisible" :before-close="handleClose" v-dialogDrag size="small">
  <span slot="title" class="el-dialog__title">
    {{$t('heat.resourceInfo')}}
  </span>
  <div v-loading="loadinggl"> 
    <el-row>
      <el-col :span="24">
        <el-form ref="nodeDetailForm" :model="nodeDetailForm" label-position="left" label-width="150px" class="me-form" style="text-align:left;">
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <tbody>
                <tr class="odd">
                  <th class="idatath" style="width:20%">{{$t('lang.name')}}</th>
                  <td class="idatatd" style="width:80%">{{nodeDetailForm.nodeName}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('heat.resourceType')}}</th>
                  <td class="idatatd">{{nodeDetailForm.nodeTypeText}}</td>
                </tr>
                <tr class="even" v-if="nodeDetailForm.nodeType=='OS::Nova::Node'">
                  <th class="idatath">{{$t('calcStorLang.instList')}}</th>
                  <td class="idatatd"></td>
                </tr>
                <tr class="even" v-if="nodeDetailForm.nodeType=='OS::Nova::Node'">
                  <td class="idatatd" colspan="2">
                    <instance-list :hostname="nodeDetailForm.nodeName" :pageCount="pageCount"></instance-list>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </div>
</el-dialog> 
</template>
<script>
import InstanceList from './../host-manage/host-list/InstanceList.vue';
export default {
  name: 'LogicalTopoList',
  props: ["hostnode"],
  components: {
    InstanceList
  },
  data() {
    return {
      dialogVisible: false,
      loadinggl: false,
      nodeDetailForm: {
        nodeName: "",
        nodeType: "",
        nodeTypeText: "",
        status: "",
        createTime: ""
      },
      resTypeRender: Vue.resourceTypeFormatter,
      stackName: this.$route.params.stackName,
      stackId: this.$route.params.stackId,
      pageCount: 5
    }
  },
  mounted() {
    let self = this;
    self.showNodeDetail();
  },
  methods: {
    showNodeDetail() {
      let self = this;
      self.dialogVisible = true;
      let name = self.hostnode.id.substring(self.hostnode.id.lastIndexOf(".") + 1);
      this.nodeDetailForm.nodeName = name;
      this.nodeDetailForm.nodeType = self.hostnode.type;
      this.nodeDetailForm.nodeTypeText = this.resTypeRender(self.hostnode.type);
    },
    handleClose(done) {
      this.$emit("handleDetailShow", {});
      done();
    },
    cancel() {
      this.$emit("handleDetailShow", {});
    }
  }
}

</script>
<style scoped>
.formspan {
  font-weight: bold;
  float: right;
}
</style>
