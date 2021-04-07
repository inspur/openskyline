<template>
  <div>
    <icos-page-header :title="$t('calcStorLang.imageDetails')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
    <el-row style="padding: 16px;">
      <el-col :span="24">
        <!-- <el-collapse v-model="activeNames" style="text-align:left">
          <el-collapse-item :title="$t('calcStorLang.imageDetails')" name="1"> -->
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
                    <th class="idatath">{{$t('lang.status')}}：</th>
                    <td class="idatatd">{{imageInfo.status}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath">{{$t('container.size')}}：</th>
                    <td class="idatatd">{{sizeRender(imageInfo["OS-EXT-IMG-SIZE:size"])}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">最小内存：</th>
                    <td class="idatatd">{{imageInfo.minRam}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">最小磁盘大小：</th>
                    <td class="idatatd">{{imageInfo.minDisk}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">创建于：</th>
                    <td class="idatatd">{{imageInfo.created}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath">更新于：</th>
                    <td class="idatatd">{{imageInfo.updated}}</td>
                  </tr>
                </tbody>
                </table>
            </div>
            <!-- </el-collapse-item>
        </el-collapse> -->
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "ImageDetail",
  data () {
    return {
      imageId: this.$route.params.imageId,
      activeNames: ["1", "2"],
      imageInfo: {
        id: "",
        name: "",
        description: "",
        created: "",
        minDisk: "",
        minRam: "",
        progress: "",
        status: "",
        updated: "",
        username: ""
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
          url: "api/sahara/v2/images/"+this.imageId,
          errFun() {
            self.$router.push({
                path: '/clouddata/image'
            });
          }
        });
        self.imageInfo = result['image'];
      } catch (res) {
      }
    },
    handlePageHeaderBack() {
      this.$router.push({
        path:'/clouddata/image'
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
