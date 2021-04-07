<template>
<div>
  <el-collapse v-model="activeNames">
    <el-collapse-item :title="$t('opt.hostPriceSetting')" name="1">
      <instances-setting></instances-setting>
    </el-collapse-item>
    <el-collapse-item :title="$t('opt.otherPriceSetting')" name="2">
      <other-setting></other-setting>
    </el-collapse-item>
  </el-collapse>
</div>
</template>
<script>
import InstancesSetting from './InstancesSetting'
import OtherSetting from './OtherSetting'
export default {
  name:"priceSetting",
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
    InstancesSetting,
    OtherSetting
  }
}
</script>
