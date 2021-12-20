<template>
  <div v-loading="loading" style="margin-top: 15px;">
    <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" :width="400" @search="handleSearch" style="margin-bottom: 5px;" />
    <el-table :data="tableData" @row-click="handleRowClick" :empty-text="tableEmptyText" :default-sort="{prop: 'created_at', order: 'descending'}" @sort-change="handleSortChanged">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio v-model="selectedImageId" :label="scope.row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('name')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME')" prop="name" sortable="costom" />
      <el-table-column v-if="checkedColumns.includes('size')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_SIZE')" prop="size" sortable="costom">
        <template slot-scope="scope">
          {{ scope.row.size | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('disk_format')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_FORMAT')" prop="disk_format" sortable="costom" />
      <el-table-column v-if="checkedColumns.includes('os_distro')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_OS')" prop="os_distro" sortable="costom">
        <template slot-scope="scope">
          {{ scope.row.os_distro !== '' ? scope.row.os_distro : '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('visibility')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VISIBILITY')" prop="visibility" sortable="costom">
        <template slot-scope="scope">
          {{ scope.row.visibility | visibility }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('min_ram')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM')" prop="min_ram" sortable="costom">
        <template slot-scope="scope">
          {{ scope.row.min_ram * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('min_disk')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_DISK')" prop="min_disk" sortable="costom">
        <template slot-scope="scope">
          {{ scope.row.min_disk * 1024 * 1024 * 1024 | fileSize }}
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('inspur_virtual_size')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VIRTUAL_SIZE')" prop="inspur_virtual_size" sortable="costom">
        <template slot-scope="scope">
          <span v-if="scope.row.inspur_virtual_size">
            {{ scope.row.inspur_virtual_size | fileSize }}
          </span>
          <span v-else>
            -
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="checkedColumns.includes('created_at')" :label="$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_CREATE_TIME')" prop="created_at" sortable="costom">
        <template slot-scope="scope">
          {{ scope.row.created_at | dateTimeFormatter }}
        </template>
      </el-table-column>
    </el-table>

    <el-row type="flex" justify="space-between" align="middle">
      <icos-column-selector @refresh="loadImages" @column-checked="handleColumnChecked" :selected-length="selectedImageId === '' ? 0 : 1" :columns="[{
        prop: 'name',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_NAME'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'size',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_SIZE'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'disk_format',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_FORMAT'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'os_distro',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_OS'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'visibility',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VISIBILITY'),
        visible: true,
        defaultChecked: false
      }, {
        prop: 'min_ram',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_RAM'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'min_disk',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_MIN_DISK'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'inspur_virtual_size',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VIRTUAL_SIZE'),
        visible: true,
        defaultChecked: true
      }, {
        prop: 'created_at',
        label: $t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_CREATE_TIME'),
        visible: true,
        defaultChecked: true
      }]" />
      <div>
        <page
          :totalData="totalData"
          :objStorFlag="currentPageReset"
          :sortObj="sortObj"
          :pageCount="5"
          @getCurrentData="handleGetCurrentData" />
      </div>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    projectId: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: ''
    },
    imageId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      checkedColumns: [],
      searchBar: {
        conditions: {
          name: {
            label: this.$t('lang.name'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          os_distro: {
            label: this.$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_OS'),
            type: 'input',
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {  // FIXME: 这个校验规则需要重新整理
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          },
          visibility: {
            label: this.$t('calcStorLang.visibility'),
            type: 'select',
            options: [{
              label: this.$t('lang.public'),
              value: 'public'
            }, {
              label: this.$t('lang.private'),
              value: 'private'
            }, {
              label: this.$t('calcStorLang.shared'),
              value: 'shared'
            }]
          }
        },
        validatedParams: {}
      },
      currentPageReset: false,
      totalData: [],
      tableData: [],
      sortObj: {
        sortOrder: 'descending',
        sortField: 'created_at',
        sortType: 'string'
      },
      selectedImageId: ''
    };
  },
  methods: {
    async loadImages(currentPageReset=false) {
      const $this = this;
      if ($this.projectId !== '' && $this.userId !== '') {
        $this.loading = true;
        try {
          const res = await $this.$ajax({
            type: 'get',
            url: `api/glance/v2/images?limit=99999`
          });
          $this.loading = false;
          let images = res.images;
          images = images.filter(item => {
            if (item.tags.indexOf('*') > -1) {
              return false;
            }
            if ('image_type' in item && (item.image_type === 'snapshot' || item.image_type === 'backup')) {
              return false;
            }
            if (item.block_device_mapping !== undefined) {
              return false;
            }
            if (item.visibility === 'private' && item.owner !== $this.projectId) {
              return false;
            }
            if ('name' in $this.searchBar.validatedParams) {
              return item.name.toLowerCase().includes($this.searchBar.validatedParams.name.toLowerCase());
            }
            if ('os_distro' in $this.searchBar.validatedParams) {
              return 'os_distro' in item &&
                     item.os_distro.toLowerCase().includes($this.searchBar.validatedParams.os_distro.toLowerCase());
            }
            if ('visibility' in $this.searchBar.validatedParams) {
              return item.visibility === $this.searchBar.validatedParams.visibility;
            }
            return true;
          });
          images.forEach(item => {
            if (!('os_distro' in item)) {
              item['os_distro'] = '';
            }
          });
          $this.currentPageReset = currentPageReset;
          $this.totalData = images;
          $this.$nextTick(() => {
            $this.currentPageReset = false;
          });
          $this.selectedImageId = '';
          $this.$emit('image-selected', {id: ''});
        } catch (res) {
          $this.loading = false;
        }
      }
    },
    handleRowClick(row) {
      this.selectedImageId = row.id;
      this.$emit('image-selected', {
        id: row.id,
        name: row.name ? row.name : row.id,
        osDistro: row.os_distro ? row.os_distro : '',
        minRam: row.min_ram ? row.min_ram : 0,
        minDisk: row.min_disk ? row.min_disk : 0,
        format: row.disk_format ? row.disk_format : '',
        size: row.size ? row.size : 0,
        virtualSize: row.inspur_virtual_size ? parseFloat(row.inspur_virtual_size) : 0
      });
    },
    handleSearch(params) {
      this.searchBar.validatedParams = params;
      this.loadImages(true);
    },
    handleColumnChecked(val) {
      this.checkedColumns = val;
    },
    handleGetCurrentData(data) {
      this.tableData = data;
    },
    handleSortChanged(column) {
      this.sortObj = {
        sortOrder: column.order,
        sortField: column.prop,
        sortType: ['name', 'disk_format', 'os_distro', 'visibility'].includes(column.prop) ? 'string' : 'number'
      };
    }
  },
  watch: {
    projectId: {
      immediate: true,
      handler(newValue) {
        this.loadImages();
      }
    },
    userId: {
      immediate: true,
      handler(newValue) {
        this.loadImages();
      }
    }
  },
  computed: {
    tableEmptyText() {
      if (this.projectId === '' || this.userId === '') {
        return this.$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_PROJECT_AND_USER_FIRST');
      } else {
        return this.$t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_EMPTY');
      }
    }
  },
  filters: {
    visibility(value) {
      switch (value) {
        case 'public':
          return Vue.t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VISIBILITY_PUBLIC');
        case 'private':
          return Vue.t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VISIBILITY_PRIVATE');
        case 'shared':
          return Vue.t('calcStorLang.NG_CREATE_INSTANCE_TEMPLATE_VISIBILITY_SHARED');
        default:
          return value;
      }
    },
    createTime(val) {
      const time = moment.utc(val);
      time.local();
      return time.format('YYYY-MM-DD HH:mm:ss');
    }
  }
}
</script>

<style>

</style>
