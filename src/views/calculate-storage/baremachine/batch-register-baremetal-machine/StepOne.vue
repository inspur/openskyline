<template>
  <div>
    <el-dialog
      :title="$t('calcStorLang.BAREMETAL_BATCH_REGISTER')"
      size="large"
      class="step-one-dialog"
      :show-close="!saving"
      :before-close="handleClose"
      :visible="true">
      <div v-loading="loading">
        <el-form inline style="margin-bottom: 5px;">
          <el-form-item>
            <el-button icon="fa-plus" size="small" type="primary" @click="addOne">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_ADD') }}</el-button>
          </el-form-item>
          <el-form-item>
            <el-upload
              action=""
              :multiple="false"
              :auto-upload="true"
              :http-request="importExcel"
              :show-file-list="false"
            >
              <el-button icon="fa-upload" size="small" type="primary">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_IMPORT_WITHIN_EXCEL') }}</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button icon="fa-download" size="small" type="primary" @click="downloadTemplate">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_DOWNLOAD_EXCEL_TEMPLATE') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="machines" height="400" row-key="rowId" border>
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_ROW_NUM')" width="52px" min-width="52px" fixed >
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('lang.name')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.bmcIP')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.ip" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.bmcUserName')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.bmcusername" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.bmcPassword')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.bmcpsw" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.deployImageKernal')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.kernelName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showImageKernelSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.deployImageMomerydisk')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.ramdiskName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showImageRamdiskSelectDialog(scope.$index)" />
            </template>
          </el-table-column>
          <!-- <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.netType')" width="200px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.nettypeName" :placeholder="$t('calcStorLang.pleaseChoose')" @focus="showNettypeSelectDialog(scope.$index)" />
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('calcStorLang.BATCH_CREATE_INSTANCE_ACTION')" width="80px" fixed="right">
            <template slot-scope="scope">
              <el-button :disabled="saving" type="danger" size="small" @click="deleteOneByIndex(scope.$index)">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_DELETE') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer">
        <el-button @click="close" :disabled="saving">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_CLOSE') }}</el-button>
        <el-button type="primary" @click="submit" :disabled="loading || machines.length === 0" :loading="saving">{{ $t('calcStorLang.BATCH_CREATE_INSTANCE_SUBMIT') }}</el-button>
      </span>
    </el-dialog>

    <image-kernel-select
      ref="imageKernelSelect"
      v-if="imageKernelSelectDialog.loaded"
      :image-kernels="imageKernels"
      @select="handleImageKernelSelect"
    />

    <image-ramdisk-select
      ref="imageRamdiskSelect"
      v-if="imageRamdiskSelectDialog.loaded"
      :image-ramdisks="imageRamdisks"
      @select="handleImageRamdiskSelect"
    />

    <nettype-select
      ref="nettypeSelect"
      v-if="nettypeSelectDialog.loaded"
      :nettypes="nettypes"
      @select="handleNettypeSelect"
    />
   </div>
</template>

<script>
class FieldInvalidError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'FieldInvalidError';
  }
}
import _ from 'underscore';
import { saveAs } from 'file-saver';
import { exportJsonToExcel } from '../../../../utils/Export2Excel';
import XLSX from 'xlsx'
import ImageKernelSelect from './select/ImageKernelSelect';
import ImageRamdiskSelect from './select/ImageRamdiskSelect';
import NettypeSelect from './select/NettypeSelect';
export default {
  name: 'StepOne',
  components: {
    ImageKernelSelect,
    ImageRamdiskSelect,
    NettypeSelect
  },
  data() {
    return {
      saving: false,
      loading: true,
      imageKernels: [],
      imageRamdisks: [],
      nettypes: [{
        value: 'flat',
        label: 'flat'
      }, {
        value: 'neutron',
        label: 'vlan'
      }],
      machines: [],
      imageKernelSelectDialog: {
        loaded: false,
        index: 0
      },
      imageRamdiskSelectDialog: {
        loaded: false,
        index: 0
      },
      nettypeSelectDialog: {
        loaded: false,
        index: 0
      },
      nextRowId: 1
    }
  },
  methods: {
    renderRequiredHeader(h, { column, $index }) {
      return h('div', [
        h('span', column.label),
        h('span', {
          style: {
            color: 'red',
            fontSize: '14px'
          },
          domProps: {
            innerHTML: ' *'
          }
        })
      ]);
    },
    close() {
      this.$emit('close');
    },
    handleClose(done) {
      done();
      this.close();
    },
    genNewRow() {
      const $this = this;
      return {
        rowId: $this.nextRowId++, // 行号，用于table区分资源
        name: '',
        ip: '',
        bmcusername: '',
        bmcpsw: '',
        kernel: '',
        kernelName: '',
        ramdisk: '',
        ramdiskName: '',
        nettype: 'neutron',
        nettypeName: 'vlan',
        saveStatus: 0, // 保存状态：0 初始状态 1 正在保存 2 指令发送失败 3 指令发送成功
        errMsg: ''  // 保存时错误信息
      };
    },
    addOne() {
      const $this = this;
      $this.machines.push($this.genNewRow());
    },
    deleteOneByIndex(index) {
      this.machines.splice(index, 1);
    },
    async init() {
      this.loading = true;
      this.$nextTick(() => {
        Promise.all([
          this.loadImages()
        ]).then(res => {
          this.loading = false;
        });
      });
    },
    async loadImages() {
      const $this = this;
      try {
        const result = await $this.$ajax({
          type: 'get',
          url: 'api/glance/v2/images?limit=9999999&tag=*'
        });
        let images = result.images;
        let imageKernels = images.filter(item => item['disk_format'] && item['disk_format'] === 'aki')
                             .map(item => {
                                return {
                                  value: item['id'],
                                  label: item['name']
                                };
                             });
        let imageRamdisks = images.filter(item => item['disk_format'] && item['disk_format'] === 'ari')
                             .map(item => {
                                return {
                                  value: item['id'],
                                  label: item['name']
                                };
                             });
        $this.imageKernels = imageKernels;
        $this.imageRamdisks = imageRamdisks;
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    check() {
      const $this = this;
      for (let i = 1; i <= $this.machines.length; i++) {
        const machine = $this.machines[i - 1];
        if (machine.name === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_NAME', [i]));
        }
        if (machine.name.length > 40) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_MAX_LENGTH', [i, $this.$t('lang.name'), 40]));
        }
        if (!/^[_\-0-9a-zA-Z]+$/.test(machine.name)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NAME_NOT_VALID', [i]));
        }
        if (machine.ip === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_IP', [i]));
        }
        if (!/^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/.test(machine.ip)) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_IP_NOT_RIGHT', [i]));
        }
        if (machine.bmcusername === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_BMC_USERNAME', [i]));
        }
        if (machine.bmcusername.length > 40) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_MAX_LENGTH', [i, $this.$t('calcStorLang.bmcUserName'), 40]));
        }
        if (machine.bmcpsw === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_BMC_PASSWORD', [i]));
        }
        if (machine.bmcpsw.length > 40) {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_MAX_LENGTH', [i, $this.$t('calcStorLang.bmcPassword'), 40]));
        }
        if (machine.kernel === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_IMAGE_KERNEL', [i]));
        }
        if (machine.ramdisk === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_IMAGE_RAMDISK', [i]));
        }
        if (machine.nettype === '') {
          throw new FieldInvalidError(Vue.t('calcStorLang.BAREMETAL_BATCH_REGISTER_CHECK_NOT_SET_NETTYPE', [i]));
        }
      }
    },
    async submit() {
      const $this = this;
      try {
        $this.check();
        $this.saving = true;
        let restNodeNum = await $this.getRestNodeCount();
        if ($this.machines.length > restNodeNum) {
          $this.$message.error($this.$t('calcStorLang.BARE_METAL_LICENSE_NODE_NOT_ENOUGH'));
          $this.saving = false;
          return;
        }
        $this.$emit('next', $this.machines);
      } catch (e) {
        $this.$message.error(e.message);
        $this.saving = false;
        return false;
      }
    },
    importExcel(options) {
      const $this = this;
      const file = options.file;
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = e.target.result;
        const ws = XLSX.read(data, { type: 'binary' });
        if (!('Workbook' in ws)) {
          $this.$message.error($this.$t('calcStorLang.BATCH_CREATE_INSTANCE_IMPORT_WITHIN_EXCEL_ERR_WRONG_FILE'));
        } else {
          const sheetName = ws.SheetNames[0];
          const sheet = ws.Sheets[sheetName];
          const range = String(sheet['!ref']);
          if (!(/^A1:F[1-9]{1}[0-9]*$/.test(range))) {
            $this.$message.error($this.$t('calcStorLang.BATCH_CREATE_INSTANCE_IMPORT_WITHIN_EXCEL_ERR_NOT_TEMPLATE'));
          } else {
            let row = 2; // 第2行为数据
            $this.loading = true;
            setTimeout(() => {
              while (`A${row}` in sheet) {
                if (row === 2 && $this.machines.length === 1) { // 如果是导入数据的第1行，且能执行导入，则判断是否原有表中第1行是系统添加的且为空，是则删除。
                  let compareRow = $this.genNewRow();
                  compareRow.rowId = 1;
                  if (JSON.stringify(compareRow) === JSON.stringify($this.machines[0])) {
                    $this.deleteOneByIndex(0);
                  }
                }
                const newInstance = $this.genNewRow();

                // A 名称
                const name = `A${row}` in sheet ? String(sheet[`A${row}`].v) : '';
                newInstance.name = name;

                // B BMC IP
                const ip = `B${row}` in sheet ? String(sheet[`B${row}`].v) : '';
                newInstance.ip = ip;

                // C BMC用户名
                const bmcusername = `C${row}` in sheet ? String(sheet[`C${row}`].v) : '';
                newInstance.bmcusername = bmcusername;

                // D BMC密码
                const bmcpsw = `D${row}` in sheet ? String(sheet[`D${row}`].v) : '';
                newInstance.bmcpsw = bmcpsw;

                // E 部署镜像-kernel
                const imageKernelName = `E${row}` in sheet ? String(sheet[`E${row}`].v) : '';
                let imageKernel = $this.imageKernels.find(item => item.label === imageKernelName);
                if (imageKernel) {
                  newInstance.kernel = imageKernel.value;
                  newInstance.kernelName = imageKernel.label;
                }

                // F 部署镜像-ramdisk
                const imageRamdiskName = `F${row}` in sheet ? String(sheet[`F${row}`].v) : '';
                let imageRamdisk = $this.imageRamdisks.find(item => item.label === imageRamdiskName);
                if (imageRamdisk) {
                  newInstance.ramdisk = imageRamdisk.value;
                  newInstance.ramdiskName = imageRamdisk.label;
                }

                // G 网络类型
                // const nettypeName = `G${row}` in sheet ? String(sheet[`G${row}`].v) : '';
                // let nettype = $this.nettypes.find(item => item.label === nettypeName);
                // if (nettype) {
                //   newInstance.nettype = nettype.value;
                //   newInstance.nettypeName = nettype.label;
                // }
                $this.machines.push(newInstance);
                row++;
              }

              $this.$nextTick(() => {
                $this.loading = false;
              });
            }, 1000); // FIXME: 如果能找到办法，让loading状态正常显示，则可以去掉这个1s的延迟。 by ziyu
          }
        }
      };
      reader.readAsBinaryString(file);
    },
    async downloadTemplate() {
      const $this = this;
      try {
        const headers = {
          name: {
            zh_cn: '名称(必填)',
            en: 'Name(Required)'
          },
          ip: {
            zh_cn: 'BMC IP地址(必填)',
            en: 'BMC IP(Required)'
          },
          bmcusername: {
            zh_cn: 'BMC用户名(必填)',
            en: 'BMC UserName(Required)'
          },
          bmcpsw: {
            zh_cn: 'BMC密码(必填)',
            en: 'BMC Password(Required)'
          },
          kernel: {
            zh_cn: '部署镜像-kernel(必填)',
            en: 'DeployImage-kernel(Required)'
          },
          ramdisk: {
            zh_cn: '部署镜像-ramdisk(必填)',
            en: 'DeployImage-ramdisk(Required)'
          }
          // nettype: {
          //   zh_cn: '网络类型(必填)',
          //   en: 'NetType(Required)'
          // }
        };
        exportJsonToExcel({
          header: Object.keys(headers).map(k => headers[k][Vue.language]),
          data: [],
          filename: 'bm_template'
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    showImageKernelSelectDialog(index) {
      const $this = this;
      if ($this.imageKernelSelectDialog.loaded === false) {
        $this.imageKernelSelectDialog.loaded = true;
      }
      $this.imageKernelSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.imageKernelSelect.show();
      });
    },
    handleImageKernelSelect(imageKernel) {
      const $this = this;
      const machine = $this.machines[$this.imageKernelSelectDialog.index];
      machine.kernel = imageKernel.value;
      machine.kernelName = imageKernel.label;
    },
    showImageRamdiskSelectDialog(index) {
      const $this = this;
      if ($this.imageRamdiskSelectDialog.loaded === false) {
        $this.imageRamdiskSelectDialog.loaded = true;
      }
      $this.imageRamdiskSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.imageRamdiskSelect.show();
      });
    },
    handleImageRamdiskSelect(imageRamdisk) {
      const $this = this;
      const machine = $this.machines[$this.imageRamdiskSelectDialog.index];
      machine.ramdisk = imageRamdisk.value;
      machine.ramdiskName = imageRamdisk.label;
    },
    showNettypeSelectDialog(index) {
      const $this = this;
      if ($this.nettypeSelectDialog.loaded === false) {
        $this.nettypeSelectDialog.loaded = true;
      }
      $this.nettypeSelectDialog.index = index;
      $this.$nextTick(() => {
        $this.$refs.nettypeSelect.show();
      });
    },
    handleNettypeSelect(nettype) {
      const $this = this;
      const machine = $this.machines[$this.nettypeSelectDialog.index];
      machine.nettype = nettype.value;
      machine.nettypeName = nettype.label;
    },
    async getRestNodeCount() {
      let $this = this;
      let hostCount = 0;
      let baremetalMachineCount = 0;
      for (let region in Vue.regionServices) {
        if ('nova' in Vue.regionServices[region]) {
          let hypervisorsRes = await $this.$ajax({
            regionId: region,
            type: 'get',
            url: 'api/nova/v2.1/os-hypervisors/detail'
          });
          hostCount += hypervisorsRes.hypervisors.filter(item => item.hypervisor_type === 'QEMU').length;
        }
        if ('ironic' in Vue.regionServices[region]) {
          let baremetalRes = await $this.$ajax({
            regionId: region,
            type: 'get',
            url: 'api/ironic/v1/nodes_inspur?is_adopt=no&detail=True'
          });
          baremetalMachineCount += baremetalRes.nodes.length;
        }
      }
      let serialNumberRes = await $this.$ajax({
        type: 'get',
        url: 'api/keystone/v3/inspur/serialnumber'
      });
      let serialNumberNodeNum = serialNumberRes.sn_detail.node_num;
      return serialNumberNodeNum - hostCount - baremetalMachineCount;
    }
  },
  async mounted() {
    this.addOne();
    await this.init();
  }
}
</script>

<style scoped>
.step-one-dialog >>> .el-dialog {
  width: 1300px;
}
</style>
