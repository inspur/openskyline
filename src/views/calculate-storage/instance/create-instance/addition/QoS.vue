<template>
  <div>
    <operation-panel-new :select-rows="selectedQos" :operation-menus="qosOperationMenus" style="display:inline;" />
    <el-table ref="qosTable" :data="formData.qos" row-key="key" @selection-change="handleSelectedQoSChange" style="margin-top: 5px;">
      <el-table-column reserve-selection type="selection" width="55" />
      <el-table-column :label="$t('calcStorLang.EDIT_INSTANCE_QOS_KEY')">
        <template slot-scope="scope">
          {{ getQoSKeyLabel(scope.row.key) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('calcStorLang.EDIT_INSTANCE_QOS_VALUE')">
        <template slot-scope="scope">
          <div v-if="scope.row.key === 'cpu_shares'">
            <span v-if="String(scope.row.value) === '2048'">{{ $t('calcStorLang.EDIT_INSTANCE_QOS_HIGH') }}</span>
            <span v-if="String(scope.row.value) === '1024'">{{ $t('calcStorLang.EDIT_INSTANCE_QOS_MEDIUM') }}</span>
            <span v-if="String(scope.row.value) === '512'">{{ $t('calcStorLang.EDIT_INSTANCE_QOS_LOW') }}</span>
          </div>
          <div v-else>
            {{ scope.row.value }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <edit-qos
      v-if="editQoSDialog.visible"
      @submit="handleEditQosSubmit"
      @close="editQoSDialog.visible = false"
      :type="editQoSDialog.type"
      :specified-data="editQoSDialog.specifiedData"
      :existing-keys="editQoSDialog.existingKeys"
      :cpu-quota-max="cpuQuotaMax"
      :hide-cpu-quota="true"
    />
  </div>
</template>

<script>
import _ from 'underscore';
import QoSKeys from '../../edit-instance/QoSKeys';
import QoSOperationMenus from '../../edit-instance/QoSOperationMenus';
import EditQoS from '../../edit-instance/EditQoS';
export default {
  props: {
    cpuQuotaMax: {
      type: Number,
      default: 2200
    }
  },
  components: {
    'edit-qos': EditQoS
  },
  data() {
    return {
      formData: {
        qos: []
      },
      editQoSDialog: {
        visible: false,
        type: 'add',
        specifiedData: {},
        existingKeys: []
      },
      selectedQos: [],
      qosKeys: QoSKeys,
      qosOperationMenus: QoSOperationMenus.bind(this)()
    }
  },
  methods: {
    handleSelectedQoSChange(params) {
      this.selectedQos = params;
    },
    showEditQosDialog(type='add', specifiedData={}) {
      this.editQoSDialog.type = type;
      this.editQoSDialog.specifiedData = specifiedData;
      this.editQoSDialog.existingKeys = this.formData.qos.map(item => item.key);
      this.editQoSDialog.visible = true;
    },
    handleEditQosSubmit(type, key, value) {
      const $this = this;
      if (type === 'add') {
        $this.formData.qos.push({
          key, value
        });
      } else {
        const existingQoS = $this.formData.qos.find(item => item.key === key);
        if (existingQoS) {
          existingQoS.value = value;
        }
      }
      $this.$refs.qosTable.clearSelection();
    },
    getQoSKeyLabel(key) {
      let qosKey = this.qosKeys.find(item => item.key === key);
      if (qosKey) {
        return this.$t(qosKey.label);
      } else {
        return key;
      }
    }
  },
  watch: {
    'formData.qos': {
      immediate: true,
      deep: true,
      handler(qos) {
        this.$emit('data-changed', this.formData.qos);
      }
    }
  }
}
</script>

<style>

</style>