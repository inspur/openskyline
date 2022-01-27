<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.BATCH_CREATE_INSTANCE')"
      size="tiny"
      :before-close="handleClose"
      :visible="true">
      <el-form label-width="80px" label-position="right" :rules="rules" :model="form" ref="form">
        <el-form-item :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_PROJECT')" prop="projectName">
          <el-input
            auto-complete="off"
            @focus="showSelectProject"
            v-model="form.projectName"
            :disabled="true"
            :placeholder="$t('calcStorLang.pleaseChoose')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_USER')" prop="userId">
          <el-select v-model="form.userId" :disabled="true" style="width: 100%;">
            <el-option v-for="(item, index) in users" :key="index" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="close">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_CLOSE') }}</el-button>
        <el-button type="primary" @click="next">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_NEXT') }}</el-button>
      </span>
    </el-dialog>
    <select-project
      ref="selectProject"
      :multiple="false"
      v-if="selectProjectDialog.visible"
      @getSelectProjects="handleProjectSelected" />
  </div>
</template>

<script>
import { getUsersByProjectId } from '../../../../utils/common';
export default {
  name: 'StepOne',
  data() {
    return {
      roleType: '',
      users: [],
      form: {
        projectId: '',
        projectName: '',
        userId: Vue.userId
      },
      selectProjectDialog: {
        visible: false
      },
      rules: {
        projectName: [{
          required: true,
          message: Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_VALIDATE_MESSAGE_PROJECT')
        }],
        userId: [{
          required: true,
          message: Vue.t('calcStorLang.BATCH_CREATE_INSTANCE_VALIDATE_MESSAGE_USER')
        }]
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    next() {
      const $this = this;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          $this.$emit('next', $this.form.projectId, $this.form.userId);
        } else {
          return false;
        }
      });
    },
    showSelectProject() {
      this.selectProjectDialog.visible = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    handleProjectSelected(id, name) {
      if (this.form.projectId !== id) {
        this.form.projectId = id;
        this.form.projectName = name;
        this.loadUsers(id);
      }
    },
    async loadProject(projectId) {
      const $this = this;
      try {
        const res = await $this.$ajax({
          type: 'get',
          url: `api/keystone/v3/projects/${projectId}`
        });
        $this.form.projectId = projectId;
        $this.form.projectName = res.project.name;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async loadUsers(projectId) {
      const $this = this;
      try {
        const users = await getUsersByProjectId(projectId);
        $this.users = users;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    }
  },
  mounted() {
    this.loadProject(this.$cookie.get('pid'));
    this.loadUsers(this.$cookie.get('pid'));
  }
}
</script>

<style>

</style>
