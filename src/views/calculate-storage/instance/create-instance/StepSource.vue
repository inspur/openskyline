<template>
  <div>
    <div style="margin: 15px; min-height: 400px;">
      <el-form ref="form" :rules="rules" :model="formData" label-position="right" label-width="100px">
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_PROJECT')" class="is-required" prop="projectId">
          <el-select v-model="formData.projectId" class="col-18" filterable :disabled="!canEditProjectId">
            <el-option v-for="(item, index) in projects" :key="index" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_USER')" class="is-required" prop="userId">
          <el-select v-model="formData.userId" class="col-18" filterable :disabled="!canEditUserId">
            <el-option v-for="(item, index) in users" :key="index" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE')" v-if="canSelectSource" class="is-required" prop="sourceId">
          <el-radio-group v-model="formData.sourceType">
            <el-radio label="image">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_IMAGE') }}</el-radio>
            <el-radio label="volume" v-if="roleType !== '3'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_VOLUME') }}</el-radio>
            <el-radio label="volumeSnapshot" v-if="roleType !== '3'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_VOLUME_SNAPSHOT') }}</el-radio>
            <el-radio label="snapshot" v-if="roleType !== '3'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_SNAPSHOT') }}</el-radio>
            <el-radio label="backup" v-if="roleType === '2'">{{ $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_TYPE_INSTANCE_BACKUP') }}</el-radio>
          </el-radio-group>
          <template v-if="formData.sourceType === 'image'">
            <source-image
              :project-id="formData.projectId"
              :user-id="formData.userId"
              @image-selected="handleSourceSelected" />
          </template>
          <template v-if="formData.sourceType === 'volume'">
            <source-volume
              :project-id="formData.projectId"
              @volume-selected="handleSourceSelected" />
          </template>
          <template v-if="formData.sourceType === 'volumeSnapshot'">
            <source-volume-snapshot
              :project-id="formData.projectId"
              @volume-snapshot-selected="handleSourceSelected" />
          </template>
          <template v-if="formData.sourceType === 'snapshot'">
            <source-snapshot
              :project-id="formData.projectId"
              @snapshot-selected="handleSourceSelected" />
          </template>
          <template v-if="formData.sourceType === 'backup'">
            <source-backup
              :project-id="formData.projectId"
              @backup-selected="handleSourceSelected" />
          </template>
        </el-form-item>
        <el-row type="flex" v-if="canCreateVolume">
          <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_CREATE')">
            <el-switch v-model="formData.createNewVolume" />
          </el-form-item>
          <el-form-item v-if="formData.createNewVolume === true" prop="newVolumeSize" :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_SIZE')" class="is-required">
            <el-input v-model="formData.newVolumeSize" />
          </el-form-item>
          <el-form-item v-if="canCreateVolume && !formData.createNewVolume" label-width="20px">
            <span>{{ $t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_CREATE_NO_TIPS') }}</span>
          </el-form-item>
        </el-row>
        <el-collapse v-model="activeCollapseNames">
          <el-collapse-item :title="$t('calcStorLang.NG_CREATE_INSTANCE_ADVANCED')" name="advanced">
            <el-card v-if="formData.sourceType !== 'backup' && $archIs('x86')" class="margin-bottom-10" :body-style="{ 'margin-bottom': '-20px' }">
              <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_HOTPLUG_ON')" label-width="140px">
                <el-switch v-model="formData.hotplug" :disabled="!canHotplug" />
                <el-tooltip v-if="!canHotplug" placement="top" trigger="hover" :content="$t('calcStorLang.currentSystemNotSupportHotPlug')">
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
            </el-card>
            <el-card v-if="['volume', 'volumeSnapshot'].includes(formData.sourceType)" class="margin-bottom-10" :body-style="{ 'margin-bottom': '-20px' }">
              <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_DELETE_WITH_INSTANCE')" label-width="140px">
                <el-switch v-model="formData.volumeDeleteOnTermination" />
              </el-form-item>
            </el-card>
            <el-card class="margin-bottom-10" :body-style="{ 'margin-bottom': formData.loginType === 1 ? '-20px' : '' }">
              <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_LOGIN_TYPE')" label-width="140px">
                <el-radio-group v-model="formData.loginType">
                  <el-radio :label="1">{{ $t('calcStorLang.NG_CREATE_INSTANCE_ORIGIN_PASSWORD') }}</el-radio>
                  <el-radio :label="2" :disabled="!canUseKeyPair">{{ $t('calcStorLang.NG_CREATE_INSTANCE_KEYPAIR') }}</el-radio>
                  <el-radio :label="3" :disabled="!canResetPassword">{{ $t('calcStorLang.NG_CREATE_INSTANCE_RESET_PASSWORD') }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="formData.loginType === 2" :label="$t('calcStorLang.NG_CREATE_INSTANCE_KEYPAIR')" label-width="140px" key="keyPair" prop="keyPair" class="is-required">
                <el-select v-model="formData.keyPair">
                  <el-option v-for="(item, index) in keyPairs" :key="index" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="formData.loginType === 3" :label="$t('calcStorLang.NG_CREATE_INSTANCE_USER_NAME')" key="userName" label-width="140px">
                <el-input :disabled="true" v-model="formData.userName" class="col-18" />
              </el-form-item>
              <el-form-item v-if="formData.loginType === 3" :label="$t('calcStorLang.NG_CREATE_INSTANCE_PASSWORD')" key="password" label-width="140px" class="is-required" prop="password">
                <el-input type="password" v-model="formData.password" class="col-18" />
              </el-form-item>
              <el-form-item v-if="formData.loginType === 3" :label="$t('calcStorLang.NG_CREATE_INSTANCE_CONFIRM_PASSWORD')" key="confirmPassword" label-width="140px" class="is-required" prop="confirmPassword">
                <el-input type="password" v-model="formData.confirmPassword" class="col-18" />
              </el-form-item>
            </el-card>
            <el-card v-if="canCreateVolume && formData.createNewVolume" class="margin-bottom-10" :body-style="{ 'margin-bottom': '-20px' }">
              <el-form-item prop="newVolumeName" :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_NAME')" label-width="140px">
                <el-input v-model="formData.newVolumeName" class="col-18" />
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_TYPE')" label-width="140px">
                <el-select v-model="formData.newVolumeType" filterable clearable>
                  <el-option v-for="(item, index) in volumeTypes" :key="index" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_VOLUME_DELETE_WITH_INSTANCE')" label-width="140px">
                <el-switch v-model="formData.volumeDeleteOnTermination" />
              </el-form-item>
            </el-card>
            <el-card v-if="roleType !== '3' && ['image', 'volume'].includes(formData.sourceType)" class="margin-bottom-10" :body-style="{ 'margin-bottom': '-20px' }">
              <el-form-item prop="inspurDiskBus" :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_DISK_BUS')" label-width="140px" class="is-required">
                <el-select v-model="formData.inspurDiskBus">
                  <el-option :label="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_DISK_BUS_SELF_ADAPTIVE')" value="">{{ $t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_DISK_BUS_SELF_ADAPTIVE') }}</el-option>
                  <el-option label="virtio-blk" value="virtio">virtio-blk</el-option>
                  <el-option label="virtio-scsi" value="scsi">virtio-scsi</el-option>
                  <!-- <el-option label="ide" value="ide">ide</el-option> -->
                </el-select>
                <el-tooltip placement="right">
                  <div slot="content" v-html="$t('calcStorLang.NG_CREATE_INSTANCE_SOURCE_DISK_BUS_TIPS')" />
                  <i class="el-icon-fa-question-circle"></i>
                </el-tooltip>
              </el-form-item>
            </el-card>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <div class="el-dialog__footer ng-create-instance-footer">
      <el-button @click="handleClose">{{ $t('calcStorLang.NG_CREATE_INSTANCE_CLOSE') }}</el-button>
      <el-button type="primary" @click="handleNext">{{ $t('calcStorLang.NG_CREATE_INSTANCE_NEXT') }}</el-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import SourceImage from './source/SourceImage';
import SourceVolume from './source/SourceVolume';
import SourceVolumeSnapshot from './source/SourceVolumeSnapshot';
import SourceSnapshot from './source/SourceSnapshot';
import SourceBackup from './source/SourceBackup';
import { getUsersByProjectId } from '../../../../utils/common';
export default {
  name: 'StepSource',
  props: {
    incomingData: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    SourceImage,
    SourceVolume,
    SourceVolumeSnapshot,
    SourceSnapshot,
    SourceBackup
  },
  data() {
    return {
      roleType: String(Vue.roleType),
      activeCollapseNames: [],
      projects: [],
      users: [],
      systemsSupportHotPlug: [],
      volumeTypes: [],
      keyPairs: [],
      formData: {
        projectIdLocked: false,
        projectId: '',
        userId: '',
        canSelectSource: true,
        sourceType: 'image',
        sourceId: '',
        sourceName: '',
        sourceOSDistro: '',
        sourceMinRam: 0,
        sourceMinDisk: 0,
        sourceImageFormat: '',
        sourceSize: 0,
        sourceVirtualSize: 0,
        hotplug: false,
        createNewVolume: true,
        newVolumeType: '',
        newVolumeName: '',
        newVolumeSize: 100,
        volumeDeleteOnTermination: false,
        inspurDiskBus: '',
        loginType: 1,
        keyPair: '',
        userName: 'root / Administrator',
        password: '',
        confirmPassword: ''
      },
      rules: {
        projectId: [{
          type: 'required',
          trigger: 'blur change'
        }],
        userId: [{
          type: 'required',
          trigger: 'blur change'
        }],
        keyPair: [{
          type: 'required',
          trigger: 'blur change'
        }],
        password: [{
          type: 'required',
          trigger: 'blur change'
        }, {
          type: 'passwordLegal',
          trigger: 'blur change'
        }],
        confirmPassword: [{
          type: 'required',
          trigger: 'blur change'
        }, {
          type: 'passwordEquals',
          context: this,
          value: 'formData.password',
          trigger: 'blur change'
        }],
        newVolumeSize: [
          { type: 'unsignedPositiveInteger' },
          { type: 'max', value: 131072 },
          { validator: (rule, value, callback) => {
            let sourceSizeGB = parseFloat(this.formData.sourceSize) / 1024 / 1024 / 1024;
            let sourceMinDiskGB = parseFloat(this.formData.sourceMinDisk);
            let sourceVirtualSizeGB = parseFloat(this.formData.sourceVirtualSize) / 1024 / 1024 / 1024;
            if (parseFloat(value) < sourceSizeGB) {
              callback(new Error(`云硬盘不能小于模板大小(${sourceSizeGB.toFixed(2)} GB)。`));
            } else if (parseFloat(value) < sourceMinDiskGB) {
              callback(new Error(`云硬盘不能小于模板最小硬盘(${sourceMinDiskGB.toFixed(2)} GB)。`));
            } else if (parseFloat(value) < sourceVirtualSizeGB) {
              callback(new Error(`云硬盘不能小于镜像虚拟大小(${sourceVirtualSizeGB.toFixed(2)} GB)。`));
            } else {
              callback();
            }
            }
          }
        ],
        newVolumeName: [
          { type: 'maxSize', value: 250 },
          { type: 'onlyLetter_MinusNumberChinese' }
        ]
      }
    };
  },
  methods: {
    handleClose() {
      const $this = this;
      $this.$emit('close');
    },
    handlePrev() {
      const $this = this;
      $this.$emit('prev', $this.formData);
    },
    handleNext() {
      const $this = this;
      $this.$refs.form.validate((valid) => {
        if (valid) {
          if ($this.formData.sourceId === '') {
            $this.$message.error($this.$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NO'));
          } else {
            $this.$emit('next', $this.formData);
          }
        }
      });
    },
    async loadProjects() {
      const $this = this;
      if ($this.roleType === '0') {
        try {
          let url = $this.roleType === '0' ? `api/keystone/v3/projects?domain_id=default` : `api/keystone/v3/users/${Vue.userId}/projects`;
          const res = await $this.$ajax({
            type: 'get',
            url: url
          });
          let projects = res.projects;
          projects = projects.filter(item => item.name !== 'service');
          $this.projects = projects;
        } catch (e) {
          __DEV__ && console.error(e);
        }
      }
    },
    async loadUsers() {
      const $this = this;
      try {
        const users = await getUsersByProjectId($this.formData.projectId);
        console.log(users);
        $this.users = users;
        if ($this.users.findIndex(item => item.id === $this.formData.userId) === -1) {
          $this.formData.userId = '';
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    handleSourceSelected({id='', name='', osDistro='', minRam=0, minDisk=0, format='', size=0, virtualSize=0, vcpus=0, ram=0, disk=0, flavorId='', networks=[]}) {
      this.formData.sourceId = id;
      this.formData.sourceName = name;
      this.formData.sourceOSDistro = osDistro;
      this.formData.sourceMinRam = minRam;
      this.formData.sourceMinDisk = minDisk;
      this.formData.sourceImageFormat = format;
      this.formData.sourceSize = size;
      this.formData.sourceVirtualSize = virtualSize;
      this.formData.vcpus = vcpus;
      this.formData.ram = ram;
      this.formData.disk = disk;
      this.formData.flavorId = flavorId;
      this.formData.networks = networks;
    },
    async loadVolumeTypes() {
      const $this = this;
        if ($this.formData.projectId !== '') {
        let url = '';
        if ($this.roleType === '0') {
          url = `api/cinderv3/v3/${$this.$cookie.get('pid')}/types?is_public=None`;
        } else {
          url = `api/cinderv3/v3/${$this.$cookie.get('pid')}/types`;
        }
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true
          });
          // $this.volumeTypes = res.volume_types;
          $this.volumeTypes = res.volume_types.filter(function(item) {
          return item["extra_specs"]["multiattach"] != "<is> True";
        });
        } catch (res) {
          __DEV__ && console.error(res);
        }
      }
    },
    async loadKeyPairs() {
      const $this = this;
      if ($this.formData.userId !== '') {
        let url = `api/nova/v2.1/os-keypairs?user_id=${$this.formData.userId}`;
        if (roleType === "2" || roleType === "3") {
          url = 'api/nova/v2.1/os-keypairs';
        }
        try {
          let res = await $this.$ajax({
            type: 'get',
            url: url,
            showErrMsg: true,
            headers: {
              'X-OpenStack-Nova-API-Version': 2.41
            }
          });
          $this.keyPairs = res.keypairs.map(item => item.keypair.name);
          $this.formData.keyPair = '';
        } catch (res) {
          __DEV__ && console.error(res);
        }
      }
    }
  },
  async mounted() {
    const $this = this;
    if ($this.roleType === '0') {
      $this.loadProjects();
    } else {
      const project = Vue.projectList.find(item => item.id === $this.$cookie.get('pid') && item.roleId !== 'SuperAdmin');
      if (project) {
        $this.projects = [project];
        $this.formData.projectId = project.id;
        $this.loadUsers();
        $this.formData.userId = Vue.userId;
      }
    }
    Object.keys($this.formData).forEach(key => {
      if ($this.incomingData[key] !== '' && $this.incomingData[key] !== []) {
        $this.formData[key] = $this.incomingData[key];
      }
    });
    if ($this.incomingData.canSelectSource === false) {
      $this.activeCollapseNames = ['advanced'];
    }
  },
  computed: {
    canHotplug() {
      return this.systemsSupportHotPlug.includes(this.formData.sourceOSDistro);
    },
    canCreateVolume() {
      if (this.formData.sourceType === 'volume') {
        return false;
      } else if (this.formData.sourceType === 'volumeSnapshot') {
        return false;
      } else if (this.formData.sourceType === 'snapshot') {
        if (this.formData.sourceSize === 0) {
          return false;
        }
      } else if (this.formData.sourceType === 'backup') {
        return false;
      }
      return true;
    },
    canUseKeyPair() {
      if (this.formData.sourceId === '') {
        return false;
      }
      if (this.formData.sourceType === 'image') {
        if (this.sourceOSDistro === '') {
          return false;
        }
        if (this.formData.sourceOSDistro.toLowerCase().startsWith('win')) {
          return false;
        }
        return true;
      } else if (this.formData.sourceType === 'snapshot') {
        if (this.formData.sourceOSDistro === '') {
          return false;
        }
        if (this.formData.sourceOSDistro.toLowerCase().startsWith('win')) {
          return false;
        }
        if (this.formData.sourceSize === 0) {
          return false;
        }
        return true;
      }
      return false;
    },
    canResetPassword() {
      if (this.formData.sourceId === '') {
        return false;
      }
      if (this.formData.sourceType === 'snapshot') {
        if (this.formData.sourceSize === 0) {
          return false;
        }
      }
      return true;
    },
    canEditProjectId() {
      return this.roleType === '0' && !this.formData.projectIdLocked;
    },
    canEditUserId() {
      return this.roleType === '0' || this.formData.sourceType === 'backup';
    },
    canSelectSource() {
      return this.formData.canSelectSource;
    }
  },
  watch: {
    'formData.projectId'(newValue) {
      if (this.roleType === '0') {
        this.loadUsers();
      }
      this.loadVolumeTypes();
      this.$emit('project-id-change', newValue);
    },
    'formData.sourceType'(newValue, oldValue) {
      if (this.canSelectSource === true) {
        this.formData.sourceId = '';
        this.formData.sourceName = '';
        this.formData.sourceOSDistro = '';
        this.formData.sourceMinRam = 0;
        this.formData.sourceMinDisk = 0;
        this.formData.sourceImageFormat = '';
        this.formData.sourceSize = 0;
        this.formData.sourceVirtualSize = 0;
        this.formData.loginType = 1;
        this.formData.hotplug = false;
        // this.formData.createNewVolume = false;
        // this.formData.volumeDeleteOnTermination = false;
        this.formData.inspurDiskBus = '';
      }
      if (oldValue === 'backup' && newValue !== 'backup') { // 如果是从备份切换到非备份来源，应重新赋值用户
        if (this.roleType === '2') {
          const project = Vue.projectList.find(item => item.id === this.$cookie.get('pid') && item.roleId !== 'SuperAdmin');
          if (project) {
            this.projects = [project];
            this.formData.projectId = project.id;
            this.loadUsers();
            this.formData.userId = Vue.userId;
          }
        }
      }
    },
    canCreateVolume(newValue) {
      // this.formData.createNewVolume = newValue;
    },
    'formData.userId'(newValue) {
      this.loadKeyPairs();
    }
  }
}
</script>

<style scoped>
.margin-bottom-10 {
  margin-bottom: 10px;
}
</style>
