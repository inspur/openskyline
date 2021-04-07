<template>
  <div>
    <icos-page-header :title="$t('container.detail')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <el-row style="padding: 16px;">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.name')}}：</th>
                    <td class="idatatd">{{imageInfo.name}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">ID：</th>
                    <td class="idatatd">{{imageInfo.id}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('lang.desc')}}：</th>
                    <td class="idatatd">{{imageInfo.description}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">公有：</th>
                    <td class="idatatd">{{imageInfo.is_public}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">受保护的：</th>
                    <td class="idatatd">{{imageInfo.is_protected}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">基础镜像：</th>
                    <td class="idatatd">{{imageInfo.image_id}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">使用自动配置：</th>
                    <td class="idatatd">{{imageInfo.use_autoconfig}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">自动安全组：</th>
                    <td class="idatatd">{{imageInfo.auto_security_group}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">安全组：</th>
                    <td class="idatatd">{{imageInfo.security_groups}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">Boot from Volume：</th>
                    <td class="idatatd">{{imageInfo.boot_from_volume}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">创建于：</th>
                    <td class="idatatd">{{imageInfo.created_at}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">更新于：</th>
                    <td class="idatatd">{{imageInfo.updated_at}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath">服务进程：</th>
                    <td class="idatatd">{{imageInfo.node_processes}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">每个节点的卷存储：</th>
                    <td class="idatatd">{{imageInfo.volumes_per_node}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">卷大小(G)：</th>
                    <td class="idatatd">{{imageInfo.volumes_size}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">卷类型：</th>
                    <td class="idatatd">{{imageInfo.volume_type}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">卷存储挂载到实例的本地存储：</th>
                    <td class="idatatd">{{imageInfo.volume_local_to_instance}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "ImageDetail",
  data () {
    return {
      templateId: this.$route.params.templateId,
      activeNames: ["1", "2"],
      imageInfo: {
        id: "",
        name: "",
        description: "",
        created_at: "",
        updated_at: "",
        flavor_id: "",
        boot_from_volume: false,
        auto_security_group: false,
        floating_ip_pool: "",
        image_id: "",
        is_default: false,
        is_protected: false,
        use_autoconfig: false,
        node_processes: [],
        security_groups: [],
        volume_local_to_instance: false,
        volume_mount_prefix: "",
        volume_type: "",
        volumes_per_node: "",
        volumes_size: ""
      }
    };
  },
  mounted() {
    this.getImageDetail();
  },
  methods: {
    async getImageDetail() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/sahara/v2/node-group-templates/"+this.templateId,
          errFun() {
            self.$router.push({
                path: '/clouddata/nodeGroup'
            });
          }
        });
        self.imageInfo = result['node_group_template'];
      } catch (res) {
      }
    },
    handlePageHeaderBack() {
      this.$router.push({
        path:'/clouddata/nodeGroup'
      });
    },
    sizeRender(value) {
      var self = this;
      var size = 0;
      var initFlag = 0;
      var unitFlag = " Bytes";
      while (value>=1024) {
        value = value/1024;
        initFlag++;
      }
      switch (initFlag) {
        case 1:
        unitFlag = " KB";
        break;
        case 2:
        unitFlag = " MB";
        break;
        case 3:
        unitFlag = " GB";
        break;
        default:
        break;
      }
      if (value) {
        value = value.toFixed(2);
      } else {
        value = 0;
      }
      size = value+unitFlag;
      return size;
    }
  }
}
</script>
