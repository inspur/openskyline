// 潘启宝写于2020年3月28日 13:53:30，地点---中国济南
<template>
  <div class="list">
    <div class="title">{{option.title}}</div>
    <div class="content" ref="content">
      <div class="item" v-for="(v,i) in option.list" :key="i" :ref="'item'+i">
        <span class="i0">{{i+1}}</span>
        <span class="i1">{{v.name}}</span>
        <span class="i2">
          <span>
            <span :style="{width:v.percent+'%'}"></span>
          </span>
        </span>
        <span class="i3 value2">{{v.value}} {{v.unit}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { tween } from "../../../views/intelligentMonitoring/public/tween";

export default {
  name: "List",
  components: {},
  props: {
    option: {
      type: Object,
      default: { percent: 0, style: 1 }
    }
  },
  data() {
    return {
      value: {},
      items: [],
      offsetY: 0,
      requestAnimationFrameID: 0
    };
  },
  watch: {
    "option.value": function(t, f) {},
    "option.list": function(t, f) {
      this.init();
    }
  },
  beforeDestroy() {
    this.destroy();
  },
  mounted() {
    this.value = $.extend(true, this.value, this.option);
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  methods: {
    init(v) {
      let vm = this;
      vm.destroy();
      vm.$nextTick(v => {
        let a = vm.$el.getElementsByClassName("item");
        vm.items = Array.from(a, v => {
          return { el: v };
        });
        vm.items.reduce((p, c, i) => {
          c.brother = p; //哥哥
          p.youngerBrother = c; //弟弟
          return c;
        }, vm.items[vm.items.length - 1]);
        vm.items.current = vm.items[0];

        vm.layout();
        let flag = !(
          window.urlSearchParams && window.urlSearchParams.get("noanimation")
        );
        if (flag && vm.option.list.length > 5) {
          vm.requestAnimationFrameID = requestAnimationFrame(
            vm.animation.bind(vm)
          );
        }
      });
    },
    animation() {
      this.layout();

      this.requestAnimationFrameID = requestAnimationFrame(
        this.animation.bind(this)
      );
    },
    layout(v) {
      let c = this.items.current;
      c.el.style.top = `${(this.offsetY -= 0.2)}px`;

      let ch = this.$refs.content.clientHeight;
      let oh = ch / 5;
      let elh = c.el.clientHeight;
      if (ch < elh * 5 + 5 * (5 - 1)) {
        oh = elh + 5; //设最小间距
      }

      this.items.forEach((v, i) => {
        if (v === c) {
          return;
        }
        v.el.style.top = `${v.brother.el.offsetTop + oh}px`;
      });

      if (c.youngerBrother.el.offsetTop < 0) {
        this.offsetY = 0;
        this.items.current = c.youngerBrother;
      }
    },
    destroy(v) {
      cancelAnimationFrame(this.requestAnimationFrameID);
    }
  }
};
</script>

<style scoped>
.list {
  position: relative;
  width: 100%;
  height: 100%;

  display: flex;
  flex-flow: column nowrap;
}
.list > .title {
  flex: 0 0 auto;
}
.list > .content {
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
}
.list > .content > .item {
  position: absolute;
  display: flex;
  width: 100%;
}
.list > .content > .item > span:not(:last-child) {
  margin-right: 0.7rem;
}
.list > .content > .item > .i0,
.list > .content > .item > .i1,
.list > .content > .item > .i2,
.list > .content > .item > .i3 {
  flex: 0 0 auto;
}

.list > .content > .item > .i0 {
  flex: 0 0 1.56789rem;
  font-style: italic;
  color: #fff;
}
.list > .content > .item > .i1 {
  flex: 0 0 30%;

  white-space: nowrap;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list > .content > .item > .i2 {
  flex: 1 1 auto;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}
.list > .content > .item > .i2 > span {
  position: relative;
  background-color: #192357;
  border-radius: 100px;
  overflow: hidden;
  width: 100%;
  height: 30%;
}
.list > .content > .item > .i2 > span > span {
  background-color: #0a5ceb;
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 100px;
}

.list > .content > .item > .i3 {
  font-size: 0.85rem;
  text-align: right;
}
span {
  display: inline-block;
}
</style>
