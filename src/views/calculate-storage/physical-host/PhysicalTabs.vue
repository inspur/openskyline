<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.bareMetals')+$t('calcStorLang.detail')" :show-bottom-border="false" :show-back="true" @back="handlePageHeaderBack" />
    <el-tabs v-model="activeName" class="tab-pane-no-padding" type="border-card">
      <el-tab-pane name="phyDetail" :label="$t('calcStorLang.outline')"></el-tab-pane>
      <el-tab-pane name="phyPort" :label="$t('lang.port')"></el-tab-pane>
      <el-tab-pane name="phyPortgroup" :label="$t('calcStorLang.portgroup')"></el-tab-pane>
      <el-tab-pane v-if="$archIs('x86')" name="physicalDisk" :label="$t('calcStorLang.PHYSICAL_DISKS')"></el-tab-pane>
      <el-tab-pane v-if="$archIs('x86')" name="logicalDisk" :label="$t('calcStorLang.LOGICAL_DISK')"></el-tab-pane>
    </el-tabs >
    <icos-page>
      <detail v-if="activeName === 'phyDetail'" :phyDetailUuid="phyDetailUuid"></detail>
      <port v-if="activeName === 'phyPort'" :phyDetailUuid="phyDetailUuid" :phyStatus="phyStatus"></port>
      <protgroup v-if="activeName === 'phyPortgroup'" :phyDetailUuid="phyDetailUuid"></protgroup>
      <physical-disk v-if="activeName === 'physicalDisk'" :phyDetailUuid="phyDetailUuid"></physical-disk>
      <logical-disk v-if="activeName === 'logicalDisk'" :phyDetailUuid="phyDetailUuid"></logical-disk>
    </icos-page>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import Detail from './Detail';
import Port from './Port';
import Protgroup from './PortGroup';
import PhysicalDisk from './PhysicalDisk';
import LogicalDisk from './LogicalDisk';
export default {
  name: 'PhyDetail',
  // props: ['phyHostUuid'],
  components: {
    Protgroup, Port, Detail, PhysicalDisk, LogicalDisk
  },
  data() {
    return {
      activeName: 'phyDetail',
      phyDetailUuid: this.$route.query.phyHostUuid,
      phyStatus:this.$route.query.phyStatus
    }
  },
  watch: {
  },
  computed: {
    ...mapGetters({
        routers: 'getRouters'
      })
    },
  mounted() {
    // this.$router;
  },
  methods: {
    ...mapMutations({
      setRouters: 'setRouters'
    }),
    onTabClick (tab) {
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  }
}
</script>
