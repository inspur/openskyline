<template>
  <el-dialog :title="$t('base.MODIFY_DOMAIN_MEMBERS')" :visible.sync="visible">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>全部用户</span>
            <el-input
              :placeholder="$t('base.filter')"
              icon="search"
              size="small"
              style="float:right;width:200px;position:relative;top:-4px;"
            >
            </el-input>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin</span>
            <el-button type="primary" icon="plus" size="small" style="float:right;"></el-button>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin1</span>
            <el-button type="primary" icon="plus" size="small" style="float:right;"></el-button>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin2</span>
            <el-button type="primary" icon="plus" size="small" style="float:right;"></el-button>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin3</span>
            <el-button type="primary" icon="plus" size="small" style="float:right;"></el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>域成员</span>
            <el-input
              :placeholder="$t('base.filter')"
              icon="search"
              size="small"
              style="float:right;width:200px;position:relative;top:-4px;"
            >
            </el-input>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin</span>
            <el-button type="primary" icon="minus" size="small" style="float:right;"></el-button>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin1</span>
            <el-button type="primary" icon="minus" size="small" style="float:right;"></el-button>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin2</span>
            <el-button type="primary" icon="minus" size="small" style="float:right;"></el-button>
          </div>
          <div style="height:34px;line-height:34px;">
            <span>heat_domain_admin3</span>
            <el-button type="primary" icon="minus" size="small" style="float:right;"></el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="confirmFun">确 定</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"newDepart",
  data() {
    return {
      visible:false
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    confirmFun() {
      this.visible = false;
    }
  }
}
</script>