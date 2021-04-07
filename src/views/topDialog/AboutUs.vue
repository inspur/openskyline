<template>
  <el-dialog :title="$t('base.about')" :visible.sync="visible">
    <div class="table_panel">
    <table class="table table-content table-hover idatatable" border="1">
      <tbody>
        <tr>
          <th class="idatath">{{$t('lang.name')+"："}}</th>
          <td class="idatatd">{{userMsg.name}}</td>
        </tr>
        <tr>
          <th class="idatath">{{$t('base.version')}}：</th>
          <td class="idatatd">{{userMsg.version}}</td>
        </tr>
        <tr>
          <th class="idatath">{{$t('base.email')}}：</th>
          <td class="idatatd">{{userMsg.email}}</td>
        </tr>
        <!-- <tr>
          <th class="idatath">{{$t('base.telephone')}}：</th>
          <td class="idatatd">{{userMsg.phone}}</td>
        </tr> -->
        <tr>
          <th class="idatath">{{$t('base.address')}}：</th>
          <td class="idatatd">{{userMsg.address}}</td>
        </tr>
      </tbody>
    </table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.close')}}</el-button>
    </div>
 </el-dialog>
</template>
<script>
export default {
  name:"",
  data() {
    return {
      visible:false,
      userMsg:{
        name: Vue.oemSwitch === true ? Vue.oemProductName : (Vue.archIs('x86') ? Vue.t('base.mainTitle') : Vue.t('base.mainTitleAK')),
        version: Vue.oemSwitch === true ? Vue.oemVersion : (Vue.archIs('x86') ? 'V1.0.0' : 'V1.0.0'),
        email: Vue.oemSwitch === true ? Vue.oemEmail : '',
        // phone: '400-860-0011; 800-860-0011',
        address: Vue.oemSwitch === true ? Vue.oemAddress : Vue.t('base.companyAddress')
      }
    }
  },
  mounted() {
  },
  methods:{
    show() {
      this.visible = true;
    }
  }
}
</script>