<template>
<div>
  <el-row :gutter="10" v-loading="loading">
    <el-col :span="12">
      <el-card>
        <div slot="header" class="clearfix">
          <span>{{$t('base.pimSetting')}}</span>
          <el-switch v-model="data.switch" style="float:right;"></el-switch>
        </div>
        <el-form ref="form" label-width="130px" :rules="rules" :model="data">
          <el-form-item :label="$t('base.pimIp')" class="is-required" prop="ip">
            <el-input v-model="data.ip" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item :label="$t('base.pimApiPort')" class="is-required" prop="apiPort">
            <el-input v-model="data.apiPort" style="width: 250px;" :placeholder="$t('base.pimApiPortPlaceholder')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('base.pimUrlProtocol')" class="is-required" prop="urlProtocol">
            <el-radio-group v-model="data.urlProtocol">
              <el-radio label="http">http</el-radio>
              <el-radio label="https">https</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('base.pimUrlPort')" class="is-required" prop="urlPort">
            <el-input v-model="data.urlPort" style="width: 250px;" :placeholder="$t('base.pimUrlPortPlaceholder')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('base.pimUsername')" class="is-required" prop="username">
            <el-input v-model="data.username" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item :label="$t('base.pimPassword')" prop="password">
            <el-input v-model="data.password" style="width: 250px;" :placeholder="$t('base.pimPasswordPlaceholder')" :type="passwordShow ? 'text' : 'password'">
              <el-button slot="append" icon="fa-eye" @mousedown.native="togglePasswordShow(true)" @mouseup.native="togglePasswordShow(false)"></el-button>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="save()" :loading="saving">{{$t('base.confirm')}}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</div>
</template>
<script>
export default {
  name: 'PIMSetting',
  data() {
    return {
      loading: false,
      saving: false,
      passwordShow: false,
      data: {
        switch: false,
        ip: '',
        apiPort: '',
        urlProtocol: 'https',
        urlPort: '',
        username: '',
        password: ''
      },
      rules: {
        ip: [
          { type: 'required', trigger: 'blur change' },
          { type: 'ip', value: 255 }
        ],
        apiPort: [
          { type: 'required', trigger: 'blur change' },
          { type: 'validatePort', trigger: 'blur change' }
        ],
        urlProtocol: [
          { type: 'required', trigger: 'blur change' }
        ],
        urlPort: [
          { type: 'required', trigger: 'blur change' },
          { type: 'validatePort', trigger: 'blur change' }
        ],
        username: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      let $this = this;
      $this.loading = true;
      let ret = $this.$ajax({
        type: 'get',
        url: `node-api/pim/settings`,
        successFun(data) {
          $this.data = Object.assign($this.data, data);
          $this.loading = false;
        },
        errFun() {
          $this.loading = false;
        }
      })
    },
    togglePasswordShow(value) {
      this.passwordShow = value;
    },
    save() {
      let $this = this;
      $this.saving = true;
      $this.$refs["form"].validate(async valid => {
        if (valid) {
          let ret = $this.$ajax({
            type: 'post',
            url: `node-api/pim/settings`,
            contentType: 'application/json',
            data: JSON.stringify($this.data),
            log: {
              description: {
                en: 'Modify PIM Settings',
                zh_cn: '修改PIM设置'
              },
              target:Vue.logTarget.parameterSetting
            },
            successMsg: Vue.t('base.pimEditSuccess'),
            successFun(data) {
              $this.saving = false;
            },
            errFun() {
              $this.saving = false;
            }
          })
      } else {
          $this.saving = false;
          return false;
        }
      });
    }
  },
  components: {
  }
}
</script>
