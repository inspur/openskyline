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
            :disabled="roleType === '2'"
            :placeholder="$t('calcStorLang.pleaseChoose')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_USER')" prop="userId">
          <el-select v-model="form.userId" style="width: 100%;">
            <el-option v-for="(item, index) in users" :key="index" :value="item.user.id" :label="item.user.name" />
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
export default {
  name: 'StepOne',
  data() {
    return {
      roleType: '',
      users: [],
      form: {
        projectId: '',
        projectName: '',
        userId: ''
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
    async loadUsers(projectId) {
      let $this = this;
      $this.form.userId = '';
      try {
        let res = await $this.$ajax({
          type: 'get',
          url: `api/keystone/v3/inspur/assignments/projects/${projectId}/users`
        });
        $this.users = res.users;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    }
  }
}
</script>

<style>

</style>
