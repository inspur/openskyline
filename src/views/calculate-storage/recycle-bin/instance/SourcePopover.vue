<template>
  <div>
    <el-popover ref="sourcePopover" placement="top" trigger="click" @show="handlePopoverShow">
      <div class="table_panel" style="width:410px">
        <table class="table table-content table-hover idatatable table-bordered" border="1">
          <tbody>
            <tr>
              <th class="idatath" style="width:80px">{{$t('lang.name')}}:</th>
              <td class="idatatd">
                <span>{{ source.name }}</span>
              </td>
            </tr>
            <tr>
              <th class="idatath">ID:</th>
              <td class="idatatd">
                <span>{{ source.id }}</span>
              </td>
            </tr>
            <tr>
              <th class="idatath">{{$t('calcStorLang.size')}}:</th>
              <td class="idatatd">
                <span>{{ source.size }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-popover>
    <el-button v-popover:sourcePopover size="small" type="text" v-if="visible">{{ buttonTitle }}</el-button>
    <span v-else>-</span>
  </div>
</template>

<script>
import formatFileSize from 'utils/formatFileSize';
export default {
  name: 'SourcePopover',
  props: ['instance'],
  data() {
    return {
      visible: true,
      init: false,
      buttonTitle: '',
      source: {
        name: '-',
        id: '-',
        size: '-'
      }
    };
  },
  methods: {
    async loadImageOrSnapshotDetail(id) {
      const $this = this;
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: `api/nova/v2.1/images/${id}`,
          showErrMsg: true
        });
        $this.source.name = result.image.name;
        $this.source.size = formatFileSize(result.image['OS-EXT-IMG-SIZE:size'], 'Byte');
        $this.init = true;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    async loadVolumeDetail(id) {
      const $this = this;
      try {
        let result = await $this.$ajax({
          type: 'get',
          url: `api/cinderv2/v3/${this.$cookie.get('pid')}/volumes/${id}`,
          showErrMsg: true
        });
        $this.source.name = result.volume.name;
        $this.source.size = `${result.volume.size}GB`;
        $this.init = true;
      } catch (res) {
        __DEV__ && console.error(res);
      }
    },
    handlePopoverShow() {
      if (!this.init) {
        const instance = this.instance;
        if (instance !== null && instance !== undefined && this.source.id !== '-') {
          const type = instance.metadata.source_type;
          if (type === 'image') {
            this.loadImageOrSnapshotDetail(this.source.id);
          } else if (type === 'snapshot') {
            this.loadImageOrSnapshotDetail(this.source.id);
          } else if (type === 'volume') {
            this.loadVolumeDetail(this.source.id);
          }
        }
      }
    }
  },
  mounted() {
    const instance = this.instance;
    if (instance !== null && instance !== undefined) {
      const type = instance.metadata.source_type;
      if (type === 'image') {
        this.source.id = instance.image.id;
        this.buttonTitle = `${this.$t('calcStorLang.image')} (${this.source.id})`;
      } else if (type === 'snapshot') {
        this.source.id = instance.image.id;
        this.buttonTitle = `${this.$t('calcStorLang.instanceshot')} (${this.source.id})`;
      } else if (type === 'volume') {
        const volumes = instance['os-extended-volumes-inspur:volumes_attached'];
        const bootableVolume = volumes.find(item => item.boot_disk === true);
        if (bootableVolume) {
          this.source.id = bootableVolume.id;
          this.buttonTitle = `${this.$t('calcStorLang.volume')} (${this.source.id})`;
        } else {
          this.buttonTitle = `${this.$t('calcStorLang.volume')} ()`;
        }
      } else {
        this.visible = false;
      }
    } else {
      this.visible = true;
    }
  }
}
</script>

<style>

</style>
