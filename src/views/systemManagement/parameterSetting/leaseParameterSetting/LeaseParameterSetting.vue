<template>
<div>
  <el-collapse v-model="activeNames">
    <el-collapse-item :title="$t('base.leaseLengthParamSetting')" name="1">
      <lease-param></lease-param>
    </el-collapse-item>
    <el-collapse-item :title="$t('base.resourceLeaseParamSetting')" name="2">
      <lease-setting></lease-setting>
    </el-collapse-item>
  </el-collapse>
</div>
</template>
<script>
import LeaseParam from './LeaseParam'
import LeaseSetting from './LeaseSetting'
export default {
  name:"project",
  data() {
    return {
      activeNames: ['1', '2']
    }
  },
  mounted() {
  },
  methods: {
  },
  components: {
    LeaseParam,
    LeaseSetting
  }
}
</script>
