<!-- 潘启宝写于2020年2月10日 16:17:56 -->
<template>
  <div class="icos-checkbox-group">
    <span
      v-if="_allButton"
      class="icos-checkbox-group-option-all"
      :class="isAll?'is-checked':''"
      v-on:click="click"
    >{{$t("monitor.all")}}</span>
    <span
      class="icos-checkbox-group-option"
      :class="option.select?'is-checked':''"
      v-for="option in options"
      :ref="option.name"
      :key="option.name"
      :data-name="option.name"
      v-on:click="click"
    >{{option.name}}</span>
  </div>
</template>
<script>
export default {
  name: "IcosCheckboxGroup",
  watch: {},
  props: {
    options: Array,
    radio: { type: Number, default: 0 },
    allButton: { type: Number, default: 1 }
  },
  data() {
    return {};
  },
  computed: {
    _allButton() {
      return this.radio ? 0 : this.allButton;
    },
    isAll() {
      return this.options.every(v => v.select);
    },
    isNone() {
      return this.options.every(v => !v.select);
    }
  },
  beforeDestroy() {},
  mounted() {
    this.optionElements = this.$el.getElementsByClassName(
      "icos-checkbox-group-option"
    );
    this.optionElementAll = this.$el.getElementsByClassName(
      "icos-checkbox-group-option-all"
    );
    this.optionElementAll = this.optionElementAll
      ? this.optionElementAll[0]
      : null;
  },
  methods: {
    click(e) {
      let t = e.target;

      let isChange = 1;
      if (t === this.optionElementAll) {
        if (this.isAll) {
          let before = this.options.some(v => v.before);
          if (!before) {
            this.options[0].before = 1; //如果都没有选中过，默认选中第一个
          }
          this.options.forEach(v => {
            v.select = v.before;
          });
        } else {
          this.options.forEach(v => {
            v.before = v.select;
          });
          this.options.forEach(v => {
            v.select = 1;
          });
        }
      } else {
        if (this.radio) {
          this.options.forEach(v => {
            let sn = v.name === t.dataset.name;
            v.select = sn ? 1 : 0;
          });
        } else {
          let selectes = this.options.filter(v => v.select);
          let only = selectes.length === 1 ? selectes[0] : null;
          this.options.forEach(v => {
            let sn = v.name === t.dataset.name;
            if (only === v && sn) {
              isChange = 0;
            } else {
              v.select = sn ? v.select ^ 1 : v.select;
            }
          });
        }
      }

      isChange && this.$emit("change", this.options);
    }
  }
};
</script>


<style scoped>
.icos-checkbox-group {
  display: inline-block;
}
.icos-checkbox-group-option,
.icos-checkbox-group-option-all {
  display: inline-block;
  margin-right: 15px;
  line-height: 100%;
  border-radius: 4px;
  padding: 6px 10px;
  user-select: none;
  cursor: pointer;
}
.is-checked {
  background-color: #0087ed;
  color: #fff;
}
</style>

