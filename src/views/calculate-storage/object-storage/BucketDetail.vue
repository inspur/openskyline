<template>
  <div v-loading="loading">
    <el-collapse :value="['1', '2', '3']">
      <el-collapse-item :title="$t('calcStorLang.objectStorageBucketBasicInfo')" name="1">
        <el-table :data="dataInfo" :show-header="false">
          <el-table-column prop="key">
          </el-table-column>
          <el-table-column prop="value">
          </el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.objectStorageBucketACLAttribute')" name="2">
        <el-table :data="dataACL" :show-header="false">
          <el-table-column prop="key">
          </el-table-column>
          <el-table-column prop="value">
          </el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item :title="$t('calcStorLang.objectStorageBucketQuota')" name="3">
        <el-table :data="dataQuota" :show-header="false">
          <el-table-column prop="key">
          </el-table-column>
          <el-table-column prop="value">
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import format from '../../../utils/dateTimeFormatter';
export default {
  name: "BucketDetail",
  props: ["containerTempName"],
  data() {
    return {
      loading: false,
      headStr: ".r:*,.rlistings",
      dataInfo: [],
      dataACL: [],
      dataQuota: []
    }
  },
  mounted() {
    // this.loadData();
  },
  methods: {
    async loadData() {
      let $this = this;
      $this.loading = true;
      let projectId = this.$cookie.get('pid');
      let url = "api/swift/v1/" + projectId + "/" + $this.containerTempName + "?format=json";
      $this.dataInfo = [];
      $this.dataACL = [];
      $this.dataQuota = [];
      try {
        let result = await $this.$ajax({
          type: 'GET',
          url: url,
          showErrMsg: true,
          successFun: function (res, xhr) {
            $this.dataInfo.push({
              key: Vue.t('calcStorLang.objectStorageBucketName'),
              value: $this.containerTempName
            });

            const bucketCreateTime = xhr.getResponseHeader("x-timestamp");
            $this.dataInfo.push({
              key: Vue.t('calcStorLang.objectStorageBucketCreateTime'),
              value: format(parseInt(bucketCreateTime * 1000))
            });

            const bucketObjectCount = xhr.getResponseHeader("x-container-object-count");
            $this.dataInfo.push({
              key: Vue.t('calcStorLang.objectStorageBucketObjectCount'),
              value: bucketObjectCount
            });

            const bucketBytesUsed = xhr.getResponseHeader("x-container-bytes-used");
            $this.dataInfo.push({
              key: Vue.t('calcStorLang.objectStorageBucketBytesUsed'),
              value: $this.formatFileSize(bucketBytesUsed)
            });

            const head = xhr.getResponseHeader("X-Container-Read");
            const isACLPublic = head && (head.indexOf($this.headStr) >= 0) ? Vue.t("lang.yes") : Vue.t("lang.no");
            $this.dataACL.push({
              key: Vue.t('calcStorLang.objectStorageBucketIsACLPublic'),
              value: isACLPublic
            });

            const isQuotaEnable = xhr.getResponseHeader("X-Container-Meta-Quota-enable") == "enable";
            $this.dataQuota.push({
              key: Vue.t('calcStorLang.objectStorageBucketIsQuotaEnable'),
              value: isQuotaEnable ? Vue.t("lang.yes") : Vue.t("lang.no")
            });
            if (isQuotaEnable) {
              const bucketQuotaBytes = xhr.getResponseHeader("x-container-meta-quota-bytes");
              $this.dataQuota.push({
                key: Vue.t('calcStorLang.objectStorageBucketQuotaCapacity'),
                value: bucketQuotaBytes == -1 ? Vue.t('calcStorLang.objectStorageBucketQuotaUnlimit') : bucketQuotaBytes
              });
              const bucketQuotaCount = xhr.getResponseHeader("x-container-meta-quota-count");
              $this.dataQuota.push({
                key: Vue.t('calcStorLang.objectStorageBucketQuotaCount'),
                value: bucketQuotaCount == -1 ? Vue.t('calcStorLang.objectStorageBucketQuotaUnlimit') : bucketQuotaCount
              });
            }
            $this.loading = false;
          },
          errFun: function () {
            $this.loading = false;
          }
        });
      } catch (err) {
        $this.loading = false;
      }
    },
    setSize(size) {
      let s = "";
      if (size == -1 || size == undefined || size == null) {
        return "无限";
      }
      return size;
    },
    formatFileSize(value, unit, i = 2) {
      let str = "";
      switch (unit) {
        case "Byte":
          break;
        case "KB":
          value = value * 1024;
          break;
        case "MB":
          value = value * 1024 * 1024;
          break;
        case "GB":
          value = value * 1024 * 1024 * 1024;
          break;
        case "TB":
          value = value * 1024 * 1024 * 1024 * 1024;
          break;
      }
      if (value > 0 && value < 1024) {
        return [value, "Byte"];
      } else if (value >= 1024 && value < 1024 * 1024) {
        return [Number(value / 1024).toFixed(i), "K"];
      } else if (value >= 1024 * 1024 && value < 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024)).toFixed(i), "M"];
      } else if (value >= 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024 * 1024)).toFixed(i), "G"];
      } else if (value >= 1024 * 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024 * 1024 * 1024)).toFixed(i), "T"];
      } else if (value >= 1024 * 1024 * 1024 * 1024 * 1024 && value < 1024 * 1024 * 1024 * 1024 * 1024 * 1024) {
        return [Number(value / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(i), "P"];
      } else {
        return [value, "K"];
      }
    }
  }
}
</script>