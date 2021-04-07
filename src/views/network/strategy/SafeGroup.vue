<template>
  <div>
    <div v-for="safeId in strategyData.security_groups" v-if="strategyData.security_groups.length">
      <safe-detail :safeId="safeId" :strategyData="strategyData"></safe-detail>
    </div>
    <safe-detail :strategyData="strategyData" v-if="!strategyData.security_groups.length"></safe-detail>
  </div>
</template>
<script>
import SafeDetail from './SafeDetail';
export default {
  name: "SafeGroup",
  props: {
    strategyData: {
      type: Object,
      default: {}
    }
  },
  components: {
    SafeDetail
  },
  data() {
    return {
    }
  }
}
</script>
