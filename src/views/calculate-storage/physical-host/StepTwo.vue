<template>
    <el-form ref="physicalHost" :model="physicalHost" label-width="180px" label-position="left" :rules="rules">
      <el-form-item  label="架构" class="is-required">
        <el-select v-model="hostValue">
          <el-option  label="x86_64" value="1"></el-option>
          <!-- <el-option  label="x86_32" value="2"></el-option> -->
        </el-select>
      </el-form-item>
      <el-form-item  label="驱动" class="is-required">
        <el-select v-model="dirverValue" @change="dirverChange">
          <!-- <el-option  label="ipmi" value="1"></el-option> -->
          <el-option  label="pxe_ipmitool" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="BMC IP地址" class="is-required" prop="address">
        <el-input v-model="physicalHost.address" class="col-10"></el-input>
        <!-- <el-button type="primary" icon='fa-plus' size="small" @click="addPhyHost">增加</el-button> -->
      </el-form-item>
      <!-- <el-form-item class="is-required" prop="address" v-for="(item, index) in physicalMore" :label="item.label" :key="index">
        <el-input class="col-10"></el-input>
        <el-button type="primary" icon='fa-times' size="small" @click="delPhyHost(index)">删除</el-button>
      </el-form-item> -->
      <el-form-item label="BMC用户名" class="is-required" prop="username">
        <el-input v-model="physicalHost.username" class="col-10"></el-input>
      </el-form-item>
      <el-form-item label="BMC密码" class="is-required" prop="userpass">
        <el-input v-model="physicalHost.userpass" class="col-10" type="password"></el-input>
      </el-form-item>
      <el-form-item label="ipmi_terminal端口" class="is-required" prop="terminalPort" v-show="terPortFlag">
        <el-input v-model="physicalHost.terminalPort" class="col-10"></el-input>
        <el-tooltip placement="top" trigger="hover" content="UDP端口,默认端口4200">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <!-- <el-form-item label="ipmi端口" class="" prop="userport" v-show="ipmiPortFlag">
        <el-input v-model="physicalHost.userport" class="col-10"></el-input>
        <el-tooltip placement="top" trigger="hover" content="远程IPMI RMCP端口">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item> -->
      <div class="me-form-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button @click="prevStep" type="primary">上一步</el-button>
        <el-button @click="nextStep" type="primary" :disabled="isDisabled">完成</el-button>
      </div>
    </el-form>
</template>
<script>
export default {
  name: 'floatIp',
  props: ['operateType', 'phyEntity'],
  data() {
    return {
      dialogVisible: false,
      dirverValue: 'pxe_ipmitool',
      ipmiPortFlag: true,
      terPortFlag: true,
      hostValue: 'x86_64',
      phyTitle: "",
      ipmiAddress: "",
      count: 1,
      physicalMore: [],
      isDisabled: false,
      physicalHost: {
        name: '',
        address: '',
        username: '',
        userpass: '',
        userport: '',
        cpu: '',
        memory: '',
        storage: '',
        kernel: '1',
        ramdisk: '2',
        terminalPort: '4200'
      },
      rules: {
        address: [
          { type: 'required', trigger: 'blur change' },
          {type: 'ipv4'}
        ],
        terminalPort: [
          { type: 'required', trigger: 'blur change' },
          { type: 'integer' },
          { type: 'max', value: 65535 },
          { type: 'min', value: 0 }
        ],
        username: [
          { type: 'required', trigger: 'blur change' },
          { type: 'maxSize', value: 20 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ],
        userpass: [
          { type: 'required', trigger: 'blur change' }
        ]
      }
    }
  },
  mounted() {
    /*if (this.operateType === 2) {
      this.phyTitle = "编辑物理机";
      this.physicalHost.name = this.phyEntity.name;
      this.physicalHost.kernel = '1';
      this.physicalHost.ramdisk = '2';
      this.physicalHost.address = '192.168.100.63';
      this.physicalHost.username = 'admin';
      this.physicalHost.userpass = '*****';
      this.physicalHost.terminalPort = 4300;
    } else {
      this.phyTitle = "添加物理机";
    }*/
  },
  methods: {
    dirverChange(value) {
      if ("1" == value) {
        this.terPortFlag = false;
        this.ipmiPortFlag = true;
      } else {
        this.terPortFlag = true;
        this.ipmiPortFlag = false;
      }
    },
    addPhyHost(value) {
      this.physicalMore.push({ "address": "address" + this.count, "label": "ipmi地址" + this.count, "prop": "address" + this.count });
      (this.count) ++;
    },
    delPhyHost(index) {
      this.physicalMore.splice(index, 1);
    },
    handleCancel() {
      this.$emit("handlePhyHostShow", {});
    },
    handleClose(done) {
      this.$emit("handlePhyHostShow", {});
      done();
    },
    prevStep() {
      this.$emit("prevTwoStep");
    },
    nextStep() {
      var self = this;
      this.$refs.physicalHost.validate((valid) => {
        if (valid) {
          this.$emit("stepTwoDone");
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}

</script>
<style scoped>
</style>
