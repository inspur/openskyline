<template>
  <div>
    <table class="info-table" style="background-color: transparent;">
      <tr v-for="(info, index) in infos" :key="index">
        <td>
          <span>{{ $t('calcStorLang.GPU_TYPE') }}: {{ info.type }}</span>
        </td>
        <td>
          <span>{{ $t('calcStorLang.GPU_VENDOR') }}: {{ info.vendor }}</span>
        </td>
        <td>
          <span>{{ $t('calcStorLang.GPU_PRODUCT_NAME') }}: {{ info.name }}_{{ info.product_id }}</span>
        </td>
        <td>
          <span>{{ $t('calcStorLang.GPU_AMOUNT') }}: {{ info.amount }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    groups: {
      type: Array,
      defualt: []
    },
    devices: {
      type: Array,
      defualt: []
    }
  },
  name: 'GroupInfo',
  data() {
    return {
      infos: []
    };
  },
  methods: {
    load() {
      const $this = this;
      $this.infos = [];
      $this.groups.forEach(group => {
        let info = {
          type: '',
          vendor: '',
          name: '',
          product_id: '',
          amount: 0
        };
        Object.keys(group).map(key => {
          if (/^trait:CUSTOM_(GPU|FPGA|SSD)_PRODUCT_ID_(.*)$/.test(key)) {
            info.product_id = key
              .match(/^trait:CUSTOM_(GPU|FPGA|SSD)_PRODUCT_ID_(.*)$/)[2]
              .toUpperCase();
          } else if (/^trait:CUSTOM_(GPU|FPGA|SSD)_(.*)$/.test(key)) {
            info.vendor = key
              .match(/^trait:CUSTOM_(GPU|FPGA|SSD)_(.*)$/)[2]
              .toUpperCase();
          } else if (/^resources:(.*)$/.test(key)) {
            info.type = key
              .match(/^resources:(.*)$/)[1]
              .toUpperCase();
            info.amount = group[key];
          }
        });
        let device = $this.devices.find(item => item.product_id === info.product_id);
        if (device) {
          info.name = device.name;
        } else {
          info.name = info.product_id;
        }
        $this.infos.push(info);
      });
    }
  },
  watch: {
    groups: {
      immediate: true,
      deep: true,
      handler(newValue) {
        this.load();
      }
    }
  }
}
</script>

<style scoped>
.info-table tr:hover {
  background: transparent;
}

.info-table tr td span {
  padding: 0 5px;
}

.info-table tr {
  background: transparent;
  border-top: none;
  border-left: none;
}

.info-table td {
  height: 16px;
  border-bottom: none;
  border-right: none;
}
</style>