<template>
  <div :style="style">
    <el-alert type="info" title=""
      :description="$t('base.noRoleWarn')"
    />
  </div>
</template>
<script>
export default {
  name: "projectapply"
}
</script>
