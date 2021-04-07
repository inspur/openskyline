// 仪表盘组件---潘启宝写于2020年2月27日 12:28:37
<template>
  <div class="icos-dashboard">
    <canvas ref="icosDashboardCanvas"></canvas>
  </div>
</template>
<script>
import { utils } from "../../public/utils";
import { tween } from "../../public/tween";
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
        title: {
          text: "inspur",
          textStyle: { fontSize: 13, fontWeight: "normal", color: "#000" }
        },
        content: { text: "", subText: "" },
        progressBar: {
          backgroundColor: "#1991eb",
          backgroundInnerColor: "#52c41a"
        }
      },
      width: 0,
      height: 0,
      canvas: null,
      context: null,
      radius: 70,
      angle: angle,
      offsetAngle: angle / 4,
      startAngle: angle / 8
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
    },
    "option.content.text": function(t, f) {
      this.value.content.text = t;
      this.draw();
    },
    "option.content.subText": function(t, f) {
      this.value.content.subText = t;
      this.draw();
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
      this.canvas = this.$refs.icosDashboardCanvas;
      this.context = this.canvas.getContext("2d");
      setTimeout(() => {
        let p = this.canvas.parentElement;
        this.width = p.clientWidth;
        this.height = p.clientHeight;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        this.draw();
      }, 1);
    },
    draw(v = {}) {
      this.value.percent = Math.max(Math.min(this.value.percent, 100), 0); // 如果大于100就取100   如果小于0就取0
      this.value.percent = this.value.percent || 0;
      if (this.value.content.text.length > 6) {
        this.value.content.text = this.value.content.text.substr(0, 5) + "…";
      }
      if (this.value.content.subText.length > 14) {
        this.value.content.subText =
          this.value.content.subText.substr(0, 13) + "…";
      }
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.fillStyle = utils.dark
        ? "rgba(255,255,255,0.09)"
        : "#f5f5f5"; //圆形背景色
      this.context.arc(
        this.width / 2,
        this.height / 2,
        this.radius + 15,
        0,
        this.angle,
        false
      );
      this.context.fill();

      this.context.lineCap = "round";
      this.context.lineWidth = 16;
      this.context.strokeStyle = this.value.progressBar.backgroundColor;
      this.context.beginPath();
      this.context.arc(
        this.width / 2,
        this.height / 2,
        this.radius,
        this.offsetAngle + this.startAngle,
        this.offsetAngle + this.startAngle + this.angle - this.startAngle * 2,
        false
      );
      this.context.stroke();

      this.context.strokeStyle = this.value.progressBar.backgroundInnerColor;
      this.context.beginPath();
      this.context.arc(
        this.width / 2,
        this.height / 2,
        this.radius,
        this.offsetAngle + this.startAngle,
        this.offsetAngle +
          this.startAngle +
          (this.angle - this.startAngle * 2) * (this.value.percent / 100),
        false
      );
      this.context.stroke();

      this.context.fillStyle = this.value.title.textStyle.color || "#000";
      this.context.font = `${this.value.title.textStyle.fontWeight} ${this.value.title.textStyle.fontSize}px serif`;
      this.context.textAlign = "start";
      this.context.textBaseline = "top";
      this.context.fillText(
        this.value.title.text,
        this.value.title.left || this.width / 2 - this.radius,
        0
      ); //标题文字

      let percentText = this.value.percent;
      if (this.value.style === 1) {
        percentText = this.value.percent.toFixed(2);
      } else if (this.value.style === 2) {
        percentText = parseInt(this.value.percent);
      }
      percentText += "%";
      this.context.fillStyle = utils.dark ? "#fff" : "#000";
      this.context.font = "normal 500 30px Impact";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      if (this.value.style === 1) {
        this.context.fillText(percentText, this.width / 2, this.height / 2); // 进度文字
      }
      if (this.value.style === 2) {
        this.context.fillStyle = utils.dark ? "#fff" : "#333";
        let t = this.value.content && this.value.content.text;
        let oy = 15;
        this.context.fillText(t, this.width / 2, this.height / 2 - oy);

        t = this.value.content && this.value.content.subText;
        this.context.fillStyle = utils.dark ? "#fff" : "#999";
        this.context.font = "normal 500 12px Impact";
        let rl = 8;
        if (t.length > rl) {
          let l = Math.ceil(t.length / rl);
          for (let i = 0; i < l; i++) {
            this.context.fillText(
              t.substr(i * rl, rl),
              this.width / 2,
              this.height / 2 + oy + 14 * i
            );
          }
        }
      }
      this.context.fillStyle = utils.dark ? "#fff" : "#666";
      this.context.font = "13px serif";
      this.context.textAlign = "start";
      this.context.textBaseline = "top";
      this.context.fillText(
        percentText,
        this.width / 2 - this.radius,
        this.height / 2 + this.radius
      ); //左下角进度文字
      this.context.textAlign = "end";
      this.context.fillText(
        `100%`,
        this.width / 2 + this.radius,
        this.height / 2 + this.radius
      ); //右下角进度文字
    }
  }
};
</script>
<style scoped>
.icos-dashboard {
  position: relative;
  width: 100%;
  height: 100%;
}
.icos-dashboard >>> canvas {
}
</style>
