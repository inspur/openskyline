<template>
  <div class="wrapper">
    <div class="content" :style="{ 'background-color': rgb }">
      <div class="stripe">
         <div></div>
         <div></div>
      </div>
      <div class="title">
        <div v-if="!loading && !error" class="title-count">{{ total }}</div>
        <div class="title-tag">{{ title }}</div>
        <i class="el-icon-loading" v-if="loading" />
        <i class="el-icon-fa-exclamation-triangle" v-if="error" />
      </div>
    </div>
    <div class="detail">
      <div class="health-status">
        <div v-if="loading">{{ $t('operationAnalysis.HEALTH_STATUS_FETCHING') }}</div>
        <div v-if="error">{{ $t('operationAnalysis.HEALTH_STATUS_ERROR') }}</div>
        
        <span v-if="!error && !loading" class="health-status-ok">
          {{$t('operationAnalysis.HEALTH_STATUS_OK')}}：
          <span>{{okCount}}</span>
        </span>
        <span v-if="!error && !loading" class="health-status-not-ok">
          {{$t('operationAnalysis.HEALTH_STATUS_NOT_OK')}}：
          <span>{{midCount+errCount}}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'summary-panel',
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    error: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '-'
    },
    okCount: {
      type: Number,
      default: 0
    },
    midCount: {
      type: Number,
      default: 0
    },
    errCount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    };
  },
  computed: {
    rate() {
      if (this.error) {
        return 0;
      }
      if (this.total) {
        return this.okCount / this.total;
      }
      return 1;
    },
    rgb() {
      let f = 0xff;
      let c = [0x0087ed, 0xf04864];
      let l = Math.log(f + 1) / Math.log(2);
      let r1 = (c[0] >>> (l << 1)) & f;
      let g1 = (c[0] >>> l) & f;
      let b1 = c[0] & f;

      let r2 = (c[1] >>> (l << 1)) & f;
      let g2 = (c[1] >>> l) & f;
      let b2 = c[1] & f;

      let r = r2 - (r2 - r1) * this.rate;
      let g = g2 - (g2 - g1) * this.rate;
      let b = b2 - (b2 - b1) * this.rate;

      return `rgb(${r},${g},${b})`;
    }
  }
}
</script>

<style scoped>
.wrapper {
  height: 150px;
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.wrapper:not(:last-child) {
  margin-right: 5px;
}
.content {
  position: relative;
  height: 70%;
  text-align: center;
}
.stripe {
  position: absolute;
  width: 120%;
  left: -60%;
  height: 80%;
  transform-origin: 50% 0%;
  transform: matrix(0.7071067811865476, -0.7071067811865475, 0.7071067811865475, 0.7071067811865476, 0, 0); /* 用矩阵旋转45度 */
}
.stripe div:nth-child(1) {
  height: 50%;
  background-color: rgba(255,255,255,0.2);
}
.stripe div:nth-child(2) {
  height: 50%;
  background-color: rgba(255,255,255,0.1);
}
.title {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-size: 18px;
  color: white;
}
.title .title-count {
  font-size: 20px;
}
.title .title-tag {
  font-size: 14px;
}
.total {
  font-size: 16px;
}
.detail {
  height: 30%;
  text-align: center;
}
.health-status {
  height: 100%;
  font-size: 12px;
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.health-status-ok {
  border-right: 1px solid #eee;
}
.health-status-ok,
.health-status-not-ok {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  height: 90%;
}
.health-status-ok span,
.health-status-not-ok span {
  color: #333;
}
</style>
