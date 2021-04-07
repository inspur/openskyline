<template>
  <div>
    <el-alert :title="$t('calcStorLang.GPU_TIPS')" :closable="false" style="margin-bottom: 5px; background-color: #d2dbe2; color: #666666;" />
    <el-tabs>
      <el-tab-pane :label="$t('calcStorLang.GPU_LIST')">
        <gpu-list />
      </el-tab-pane>
      <el-tab-pane :label="$t('calcStorLang.GPU_PROFILE')">
        <gpu-profile />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import GPUList from './gpu-list';
import GPUProfile from './gpu-profile';
export default {
  name: 'GPU',
  components: {
    'gpu-list': GPUList,
    'gpu-profile': GPUProfile
  },
  data () {
    return {
    };
  },
  methods: {
  }
}
</script>

<style scoped>
</style>