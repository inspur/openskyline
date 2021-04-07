<template>
  <div class="health-status">
    <icos-page-header :title="$t('operationAnalysis.HEALTH_STATUS')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <icos-page>
      <div class="summary-panel-wrapper">
        <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_HOST')" :okCount="host.okCount" :midCount="host.midCount" :errCount="host.errCount" :total="host.total" :loading="host.loading" :error="host.error" />
        <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_SDS')" :okCount="sds.okCount" :midCount="sds.midCount" :errCount="sds.errCount" :total="sds.total" :loading="sds.loading" :error="sds.error" />
        <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_DOCKER')" :okCount="docker.okCount" :midCount="docker.midCount" :errCount="docker.errCount" :total="docker.total" :loading="docker.loading" :error="docker.error" />
        <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_API')" :okCount="api.okCount" :midCount="api.midCount" :errCount="api.errCount" :total="api.total" :loading="api.loading" :error="api.error" />
        <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_OPENSTACK')" :okCount="openstack.okCount" :midCount="openstack.midCount" :errCount="openstack.errCount" :total="openstack.total" :loading="openstack.loading" :error="openstack.error" />
        <summary-panel :title="$t('operationAnalysis.HEALTH_STATUS_DB')" :okCount="db.okCount" :midCount="db.midCount" :errCount="db.errCount" :total="db.total" :loading="db.loading" :error="db.error" />
      </div>
      <host-health-status class="margin-top-5" @onLoaded="onHostLoaded" />
      <sds-health-status class="margin-top-5" @onLoaded="onSDSLoaded" />
      <docker-health-status class="margin-top-5" @onLoaded="onDockerLoaded" />
      <api-health-status class="margin-top-5" @onLoaded="onAPILoaded" />
      <open-stack-health-status class="margin-top-5" @onLoaded="onOpenStackLoaded" />
      <db-health-status class="margin-top-5" @onLoaded="onDBLoaded" />
    </icos-page>
  </div>
</template>

<script>
import SummaryPanel from './SummaryPanel'
import HostHealthStatus from './HostHealthStatus'
import SDSHealthStatus from './SDSHealthStatus'
import DockerHealthStatus from './DockerHealthStatus'
import APIHealthStatus from './APIHealthStatus'
import OpenStackHealthStatus from './OpenStackHealthStatus'
import DBHealthStatus from './DBHealthStatus'
export default {
  name: 'HealthStatus',
  props: [],
  components: {
    [SummaryPanel.name]: SummaryPanel,
    [HostHealthStatus.name]: HostHealthStatus,
    [SDSHealthStatus.name]: SDSHealthStatus,
    [DockerHealthStatus.name]: DockerHealthStatus,
    [APIHealthStatus.name]: APIHealthStatus,
    [OpenStackHealthStatus.name]: OpenStackHealthStatus,
    [DBHealthStatus.name]: DBHealthStatus
  },
  data() {
    return {
      host: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      sds: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      docker: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      api: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      openstack: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      },
      db: {
        okCount: 0,
        midCount: 0,
        errCount: 0,
        total: 0,
        loading: true,
        error: false
      }
    }
  },
  methods: {
    onHostLoaded ({okCount, midCount, errCount, total, error}) {
      this.host.okCount = okCount;
      this.host.midCount = midCount;
      this.host.errCount = errCount;
      this.host.total = total;
      this.host.loading = false;
      this.host.error = error;
    },
    onSDSLoaded ({okCount, midCount, errCount, total, error}) {
      this.sds.okCount = okCount;
      this.sds.midCount = midCount;
      this.sds.errCount = errCount;
      this.sds.total = total;
      this.sds.loading = false;
      this.sds.error = errCount;
      this.sds.error = error;
    },
    onDockerLoaded ({okCount, midCount, errCount, total, error}) {
      this.docker.okCount = okCount;
      this.docker.midCount = midCount;
      this.docker.errCount = errCount;
      this.docker.total = total;
      this.docker.loading = false;
      this.docker.error = error;
    },
    onAPILoaded ({okCount, midCount, errCount, total, error}) {
      this.api.okCount = okCount;
      this.api.midCount = midCount;
      this.api.errCount = errCount;
      this.api.total = total;
      this.api.loading = false;
      this.api.error = error;
    },
    onOpenStackLoaded ({okCount, midCount, errCount, total, error}) {
      this.openstack.okCount = okCount;
      this.openstack.midCount = midCount;
      this.openstack.errCount = errCount;
      this.openstack.total = total;
      this.openstack.loading = false;
      this.openstack.error = error;
    },
    onDBLoaded ({okCount, midCount, errCount, total, error}) {
      this.db.okCount = okCount;
      this.db.midCount = midCount;
      this.db.errCount = errCount;
      this.db.total = total;
      this.db.loading = false;
      this.db.error = error;
    }
  },
  mounted () {
    const $this = this;
  }
}
</script>

<style scoped>
.margin-top-5 {
  margin-top: 5px;
}
.summary-panel-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.health-status >>> .el-collapse-item__header {
  color: #0087ed;
}
</style>
