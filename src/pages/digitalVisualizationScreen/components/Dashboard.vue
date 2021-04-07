// 仪表盘组件---潘启宝写于2020年3月28日 13:53:30，地点---中国济南
<template>
  <div class="dashboard">
    <canvas ref="dashboardCanvas" style="width:100%;height:100%;"></canvas>
  </div>
</template>
<script>
import { tween } from "../../../views/intelligentMonitoring/public/tween";
export default {
  name: "IcosDashboard",
  components: {},
  props: {
    option: {
      type: Object,
      default: { percent: 0, style: 1 }
    }
  },
  data() {
    let angle = Math.PI * 2;
    return {
      value: {
        percent: 0,
        style: 1,
        content: { text: "", subText: "" },
        progressBar: {
          innerShow: 1,
          backgroundColor: "#0a5ceb",
          backgroundInnerColor: "#ffa500"
        }
      },
      width: 0,
      height: 0,
      canvas: null,
      context: null,
      radius: 50,
      angle: angle,
      offsetAngle: angle / 1,
      startAngle: -angle / 4
    };
  },
  watch: {
    "option.percent": function(t, f) {
      t = t || 0; // 防止t传入的是空字符串
      f = f || 0; // 防止f传入的是空字符串
      tween.to(
        f,
        t,
        1000,
        tween.ease.quintic.out,
        v => {
          this.value.percent = v;
          this.draw({ from: "percent" });
        },
        v => {}
      );
    }
  },
  beforeDestroy() {},
  mounted() {
    $.extend(true, this.value, this.option);

    this.init();
    // this.value.style = 1; //test
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  methods: {
    init(v) {
      this.canvas = this.$refs.dashboardCanvas;
      this.context = this.canvas.getContext("2d");

      window.addEventListener("resize", this.draw);
      this.draw();
    },
    draw(v = {}) {
      let p = this.canvas.parentElement;
      this.width = p.clientWidth;
      this.height = p.clientHeight;
      let minSize = Math.min(this.width, this.height);
      this.radius = minSize / 2.5;

      this.canvas.setAttribute("width", this.width);
      this.canvas.setAttribute("height", this.height);

      // this.value.percent = Math.max(Math.min(this.value.percent, 1), 0); // 如果大于1就取1   如果小于0就取0
      this.value.percent = this.value.percent || 0;
      this.context.clearRect(0, 0, this.width, this.height);
      let lw = minSize / 15;
      this.context.lineWidth = lw;
      this.context.lineCap = "round";
      this.context.strokeStyle = this.value.progressBar.backgroundColor;
      this.context.beginPath();
      this.context.arc(
        this.width / 2,
        this.height / 2,
        this.radius,
        0,
        this.angle,
        false
      );
      this.context.stroke();
      this.context.closePath();

      if (this.value.progressBar.innerShow) {
        this.context.strokeStyle = this.value.progressBar.backgroundInnerColor;
        let ea =
          this.offsetAngle + this.startAngle + this.angle * this.value.percent;
        if (this.value.percent >= 1) {
          ea = this.offsetAngle + this.startAngle + Math.PI * 2;
        }
        this.context.beginPath();
        this.context.arc(
          this.width / 2,
          this.height / 2,
          this.radius,
          this.offsetAngle + this.startAngle,
          ea,
          false
        );
        this.context.stroke();
        this.context.closePath();
      }

      let percentText = this.value.percent * 100;
      if (this.value.style === 1) {
        percentText = +percentText.toFixed(1); // 前面的'+'号是将toFixed后的字符串小数点后是纯0的给转成整数，请不要改我的代码，不要去掉我的‘+’号。例如+2.0等于2
      } else if (this.value.style === 2) {
        percentText = parseInt(percentText);
      }
      percentText += "%";
      this.context.fillStyle = "#fff";
      this.context.font = `normal 500 ${this.radius * 0.44}px Impact`;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.fillText(percentText, this.width / 2, this.height / 2); // 进度文字
      this.context.font = "normal 500 13px Impact";
      this.context.fillStyle = "rgba(255,255,255,0.8)";
      this.context.fillText(
        this.value.content.text,
        this.width / 2,
        this.height / 2 + this.radius * 0.43456789
      );
    }
  }
};
</script>
<style scoped>
.dashboard {
  position: relative;
  width: 100%;
  height: 100%;
}
.dashboard >>> canvas {
}
</style>
