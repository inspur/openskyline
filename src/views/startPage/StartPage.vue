<template>
  <div style="padding: 10px 16px">
    <el-carousel :id="'carousel' + theme" style="z-index: 0;"
      :height="tempHeight"
      :autoplay="false"
      trigger="click"
      v-if="roleType==0"
      @change="carouselChange"
      indicator-position="outside"
      arrow="always"
      :initial-index="0">
      <el-carousel-item name="one">
        <router-view name="startPageOne" ref="pageone" :tempHeight="tempHeight"></router-view>
      </el-carousel-item>
    </el-carousel>
    <router-view v-if="roleType=='2'" name="startPageProject"></router-view>
  </div>
</template>
<script>
import md5 from 'js-md5';
import moment from "moment";
  export default {
    name: 'StartPage',
    data () {
      return {
        theme: this.$cookie.get("theme") == 'dark' ? '-dark' : '',
        roleType:Vue.roleType,
        tempHeight:"900",
        pimParams: {
          switch: false,
          ip: '',
          port: '',
          username: '',
          password: '',
          loggingInPIM: false
        }
      };
    },
    mounted () {
      this.getServerTime();
    },
    beforeRouteLeave (to, from, next) {
      next()
    },
    beforeRouteEnter (to, from, next) {
      next()
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
          // 如果是当前页面切换分类的情况
      }
    },
    methods: {
      carouselChange(index) {
        if (index == 0) {
          this.$refs.pageone.initStartPage();
          this.$nextTick(() => {
            this.tempHeight = this.$refs.pageone.tempHeight + "px";
          });
        } else if (index == 1) {
          this.$refs.pagetwo.initStartPage();
          this.$nextTick(() => {
            this.tempHeight = this.$refs.pagetwo.tempHeight + "px";
          });
        } else if (index == 2) {
          this.$refs.pagethree.initStartPage();
          this.$nextTick(() => {
            this.tempHeight = this.$refs.pagethree.tempHeight + "px";
          });
        } else {
          this.$refs.pagefour.initStartPage();
          this.$nextTick(() => {
            this.tempHeight = this.$refs.pagefour.tempHeight + "px";
          });
        }
      },
      async getServerTime() {
        let self = this;
        let roleType = Vue.roleType + "";
        let url = "api/keystone/v3/projects?domain_id=default";
        if ("0" != roleType) {
          url = "api/keystone/v3/projects/" + this.$cookie.get("pid");
        }
        try {
          const localBefore24Hours = self.$cookie.get('localBefore24Hours');
          let currentTime = new Date().getTime();
          let currentFormatTime = moment(currentTime).format('YYYY-MM-DD HH:mm:ss');
          console.log("当前时间：" + currentFormatTime);
          if (localBefore24Hours && (currentTime - localBefore24Hours < 24*60*60*1000)) {
            return false;
          }
          await self.$ajax({
            type: 'get',
            url: url,
            showErrMsg: false,
            complete: function(XMLHttpRequest, textStatus) {
              let serverData= XMLHttpRequest.getResponseHeader("Date");
              let serverFormatTime = moment.utc(serverData).local().format('YYYY-MM-DD HH:mm:ss');
              let serverTime = new Date(serverData);
              console.log("服务器时间：" + serverFormatTime);
              let serversecond = serverTime.getTime(); // 获取服务器毫秒时间
              let timediff = Math.abs(currentTime - serversecond);
               console.log("时间差(小于300s)：" + timediff/1000)
              if (timediff > 5 * 60 * 1000) {
                const h = self.$createElement;
                let timeNote1 = Vue.t('bigScreen.START_PAGE_TIME_CONFIRM', { 'localTime': currentFormatTime, 'serverTime': serverFormatTime });
                const notify = self.$notify.warning({
                  title: Vue.t('bigScreen.START_PAGE_TIME_TITLE'),
                  message: h('div', [timeNote1, h('el-button', {
                    attrs: {
                      type: 'text'
                    },
                    style: {
                      padding: '2px'
                    },
                    on: {
                      click() {
                        self.$cookie.set('localBefore24Hours', currentTime);
                        notify.close();
                      }
                    }
                  }, Vue.t('bigScreen.START_PAGE_OND_DAY'))]),
                  duration: 5000
                });
              }
            }
          });
        } catch (res) {
        }
      }
    }
  }
</script>
<style>
#pim-area {
  margin-top: -10px;
  text-align: right;
  display: inline-block;
}
.pageset {
  display: inline-block;
}

#carousel .el-carousel__arrow {
    border: none;
    padding: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, .25);
    color: #FFFFFF;
    position: absolute;
    top: 50%;
    z-index: 10;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    text-align: center;
    font-size: 12px;
}

#carousel .el-carousel__arrow:hover {
    background-color: rgba(0, 0, 0, .35);
}

#carousel-dark .el-carousel__arrow {
    border: none;
    padding: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, .25);
    color: #000000;
    position: absolute;
    top: 50%;
    z-index: 10;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    text-align: center;
    font-size: 12px;
}

#carousel-dark .el-carousel__arrow:hover {
    background-color: rgba(255, 255, 255, .35);
}
</style>
