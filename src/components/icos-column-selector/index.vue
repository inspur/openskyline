<template>
  <div>
    <el-button type="text" icon="fa-refresh" @click="refresh" />
    <span v-if="!hideSelectedItems">{{ $t("lang.currentSelected") }} {{ selectedLength }} {{ $tc("lang.item", selectedLength) }}</span>
    <el-popover placement="right" trigger="click">
      <el-checkbox-group class="vertical" v-model="checked">
        <template v-for="item in innerColumns">
          <el-checkbox class="item" v-if="item.visible" :label="item.prop" :key="item.prop">{{ item.label }}</el-checkbox>
        </template>
      </el-checkbox-group>
      <div slot="reference" class="name-wrapper">
        <el-tag>{{ $t('lang.selectCloumn') }}</el-tag>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'ICOSColumnSelector',
  props: {
    name: {
      type: String,
      default: ''
    },
    columns: {
      type: Array,
      default: []
    },
    selectedLength: {
      type: Number,
      default: 0
    },
    hideSelectedItems: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerColumns: [],
      checked: []
    };
  },
  methods: {
    refresh() {
      this.$emit('refresh');
    }
  },
  watch: {
    checked(value) {
      this.$emit('column-checked', value);
    }
  },
  mounted() {
    const innerColumns = JSON.parse(JSON.stringify(this.columns));
    innerColumns.forEach(item => {
      if (!('defaultChecked' in item)) {
        item['defaultChecked'] = true;
      }
      if (!('visible' in item)) {
        item['visible'] = true;
      }
      if (item.defaultChecked) {
        this.checked.push(item.prop);
      }
    });
    this.innerColumns = innerColumns;
  }
}
</script>

<style>

</style>