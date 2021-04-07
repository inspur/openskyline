<template>
  <div>
    <el-popover ref="flavorPopover" placement="top" trigger="click">
      <div class="table_panel" style="width:410px">
        <table class="table table-content table-hover idatatable table-bordered" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath" style="width:80px">{{$t('lang.name')}}:</th>
              <td class="idatatd">
                <span>{{ innerFlavor.name }}</span>
              </td>
              </tr>
              <tr class="even">
                <th class="idatath">ID:</th>
                <td class="idatatd">
                  <span>{{ innerFlavor.id }}</span>
                </td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('calcStorLang.cpuCore')}}:</th>
                <td class="idatatd">
                  <span>{{ innerFlavor.vcpus }}</span>
                </td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('calcStorLang.memGB')}}:</th>
                <td class="idatatd">
                  <span>{{ innerFlavor.ram / 1024 }}</span>
                </td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('calcStorLang.diskGB')}}:</th>
                <td class="idatatd">
                  <span>{{ innerFlavor.disk }}</span>
                </td>
              </tr>
              <tr class="even">
                <th class="idatath">{{$t('calcStorLang.isPublic')}}:</th>
                <td class="idatatd">
                  <span>{{ innerFlavor['os-flavor-access:is_public'] | status }}</span>
                </td>
              </tr> 
          </tbody>
        </table>
      </div>
    </el-popover>
    <el-button v-popover:flavorPopover size="small" type="text" v-if="visible">{{ innerFlavor.name }}</el-button>
    <span v-else>-</span>
  </div>
</template>

<script>
export default {
  name: 'FlavorPopover',
  props: ['flavor'],
  data() {
    return {
      visible: true,
      innerFlavor: {
        name: '',
        id: '',
        vcpus: 0,
        ram: 0,
        disk: 0,
        'os-flavor-access:is_public': false
      }
    };
  },
  mounted() {
    if (this.flavor !== null && this.flavor !== undefined) {
      this.innerFlavor.name = this.flavor.name;
      this.innerFlavor.id = this.flavor.id;
      this.innerFlavor.vcpus = this.flavor.vcpus;
      this.innerFlavor.ram = this.flavor.ram;
      this.innerFlavor.disk = this.flavor.disk;
      this.innerFlavor['os-flavor-access:is_public'] = this.flavor['os-flavor-access:is_public'];
    } else {
      this.visible = false;
    }
  },
  filters: {
    status(value) {
      if (value) {
        return Vue.t('base.yes');
      } else {
        return Vue.t('base.no');
      }
    }
  }
}
</script>

<style>

</style>