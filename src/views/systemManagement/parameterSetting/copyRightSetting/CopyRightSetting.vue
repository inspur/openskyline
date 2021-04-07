<template>
  <div>
    <div>
      <h3>登录页产品LOGO</h3>
      <div class="logo-img-contain">
        <div class="logo-img-c">
          <div class="logo-img-title">原图片</div>
          <div class="logo-img-content logo-img-content-old"></div>
        </div>
        <div class="logo-img-c">
          <div class="logo-img-title">现图片</div>
          <div class="logo-img-content">
            <el-upload
              action
              :on-success="successFun"
              :before-upload="beforeUpload"
              :show-file-list="false"
            >
              <img :src="imageUrl" class="logo-img-content-new" />
              <el-button slot="trigger" type="primary" size="small" class="logo-btn-preview">浏览</el-button>
              <el-button size="small" type="primary" class="logo-btn-save">保存</el-button>
            </el-upload>
          </div>
        </div>
      </div>
      <span>图片为314X66的透明图片，不符合标准尺寸的会变形，影响美观。</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "copyRightSetting",
  data() {
    return {
      imageUrl: ""
    };
  },
  mounted() {},
  methods: {
    successFun(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error(Vue.t("base.UPLOADED_IMAGE_ONLY_JPG"));
      }
      if (!isLt2M) {
        this.$message.error(Vue.t("base.UPLOADED_IMAGE_NOT_BE_TOO_LARGE"));
      }
      return isJPG && isLt2M;
    }
  },
  components: {}
};
</script>
<style scoped>
.logo-img-contain {
  width: 100%;
  height: 100px;
}
.logo-img-c {
  width: 314px;
  height: 100%;
  float: left;
  margin-right: 30px;
}
.logo-img-title {
  text-align: center;
}
.logo-img-content-old {
  background: url(../../../../assets/img/login-logo.png) no-repeat center;
}
.logo-img-content {
  width: 100%;
  height: 66px;
  background-color: #b5b5b5;
  position: relative;
}
.logo-img-content-new {
  width: 314px;
  height: 66px;
  font-size: 18px;
  line-height: 50px;
}
.logo-btn-preview {
  position: absolute;
  right: -60px;
  top: 3px;
}
.logo-btn-save {
  position: absolute;
  right: -120px;
  top: 3px;
}
</style>
