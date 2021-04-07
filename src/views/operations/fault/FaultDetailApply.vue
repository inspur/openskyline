<template>
  <div>
    <el-col :span="24">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath" style="width:20%">{{$t('opt.oddnumber')}}</th>
              <td class="idatatd" style="width:80%">{{applyData.oddNumber}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('opt.faultlevel')}}</th>
              <td class="idatatd">{{applyData.faultLevel}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('opt.detailType')}}</th>
              <td class="idatatd">{{applyData.faultType}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('opt.handlefeedback')}}</th>
              <td class="idatatd" v-html="applyData.processFeedback"></td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('opt.detailDesc')}}</th>
              <td class="idatatd">
                <el-tooltip :content="applyData.description" v-show="applyData.description.length > 20">
                  <span>{{applyData.description.substring(0, 20) + "..."}}</span>
                </el-tooltip>
                <span v-show="applyData.description.length <= 20">{{applyData.description}}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-col>
  </div>
</template>
<script>
export default {
  props: ['orderId', 'applyData'],
  components: {},
  data() {
    return {
    }
  },
  mounted() {},
  methods: {
  }
}
</script>
