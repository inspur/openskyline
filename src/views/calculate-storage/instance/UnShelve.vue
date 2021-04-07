
<template>
  <div>
    <el-dialog :title="$t('calcStorLang.instUnShelving')" :visible.sync="dialogVisible" :before-close="handleClose" width="500px" size="tiny">
      <el-form class="me-required-form" label-position="left" v-model="azzone" ref="azzone" label-width="100px" :rules="rules">
        <el-form-item :label="$t('calcStorLang.az')" class="is-required" prop="az_name">
          <el-select v-model="azzone.az_name" class="col-20">
            <el-option v-for="item in zoneOptions" :key="item.value" :label="item.zoneName" :value="item.zoneName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <div style="font-size: 12px; line-height: 14px;" class="col-20">{{ $t('calcStorLang.unShelvingInstTips') }}</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
        <el-button type="primary" @click="confirmzone()" :loading="saving">{{$t('lang.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: ['selectRows1', 'instanceMaps'],
  data() {
    return {
      rules:{
        az_name: [
          {type: 'required', trigger: 'blur change'}
        ]
      },
      azzone:{
        az_name: ""
      },
      dialogVisible: false,
      loading: false,
      saving: false,
      zoneOptions:[]
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      var self = this;
      self.dialogVisible = true;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: 'api/nova/v2.1/inspur-availability-zone/detail'
        });
        self.loading = false;
        var list = result['availabilityZoneInfo'];
        var zones = [];
        if (list != null) {
          for (var z = 0; z < list.length; z++) {
            var zone = list[z];
            var zoneState = zone['zoneState'];
            if (zone['zoneName'] != "internal" && zoneState['available'] == true) {
              var arr = self.loadZoneAndHostCompare(zone.hosts);
              if (arr.length > 0) {
                zones.push(zone);
              }
            }
          }
        }
        self.zoneOptions = zones;
        if (zones.length > 0) {
          self.projectCreateForm.domain = zones[0].zoneName || "";
        }
      } catch (res) {
        self.loading = false;
      }
    },
    loadZoneAndHostCompare(list) {
      var rets = [];
      for (var z in list) {
        var obj = list[z];
        if (z.indexOf("ironic") >= 0) {
          continue;
        } else {
          rets.push(z);
        }
      }
        return rets;
    },
    confirmzone() {
      var self = this;
      var selectRows = self.selectRows1;
      if (self.azzone.az_name != "") {
        self.saving = true;
        var body = { "unshelve": {"availability_zone":self.azzone.az_name} };
        body = JSON.stringify(body);
        self.$sequence({
          type: 'post',
          data: body,
          url: 'api/nova/v2.1/servers-inspur/{id}/action',
          params: selectRows,
          // confirmMsg: Vue.t('calcStorLang.unShelvingInstConfirm'),
          log: {
            description: {
              en: "UnShelve Instance",
              zh_cn: "取消搁置云主机"
            },
            key: "name",
            target: Vue.logTarget.computeInstance
          }
        }).then((data) => {
          for (var r = 0; r < selectRows.length; r++) {
            var row = selectRows[r];
            var instance = self.instanceMaps.get(row.id);
            instance['OS-EXT-STS:task_state'] = "BUSY";
          }
          self.$message(Vue.t('calcStorLang.unShelvingInstSuccess'));
          self.$emit("deatilTempFlg", {});
        }).catch((err) => {
          self.saving = false;
        });
      } else {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.selectazzone'),
          type: 'warning'
        });
      }
    },
    handleClose (done) {
      this.$emit("deatilTempFlg", {});
    },
    cancel() {
      this.$emit("deatilTempFlg");
    }
  }
}
</script>

<style>

</style>
