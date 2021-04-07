<!-- <template>
  <span>
    <el-popover
      ref="menu"
      :trigger="trigger"
      :visible-arrow="false"
      :placement="placement"
    >
      <ul>
        <slot></slot>
      </ul>
      <span slot="reference">
        <slot name="button">
          <el-button type="primary" size="small">
            {{ label }} <i class="el-icon-caret-bottom"></i>
          </el-button>
        </slot>
      </span>
    </el-popover>
  </span>
</template> -->

<script>
import LCSubMenu from "./LCSubMenu";
import LCMenuItem from "./LCMenuItem";
import Emitter from "./emitter";
export default {
  name: "LCMenu",
  componentName: "LCMenu",
  props: {
    data: Array,
    label: {
      type: String,
      default: "更多操作"
    },
    placement: {
      type: String,
      default: "bottom-start"
    },
    trigger: {
      type: String,
      default: "click"
    }
  },
  mixins: [Emitter],
  mounted() {
    this.$on('lc-menu-item-click', this.handleMenuItemClick);
  },
  components: {
    "lc-sub-menu": LCSubMenu,
    "lc-menu-item": LCMenuItem
  },
  data() {
    return {};
  },
  render(h) {
    return h("span", [
      h(
        "el-popover",
        {
          ref: "menu",
          props: {
            trigger: this.trigger,
            "visible-arrow": false,
            placement: this.placement,
            'popper-class': 'lc-menu-popover'
          }
        },
        [
          h("ul", [h("slot", this.renderNodes(h, this.data, null))]),
          h("span", { slot: "reference" }, [
            h("slot", { attrs: { name: "button" } }, [
              h("el-button", {
                props: {
                  type: "primary",
                  size: "small"
                },
                domProps: {
                  innerHTML: `${this.label} <i class="el-icon-caret-bottom"></i>`
                }
              })
            ])
          ])
        ]
      )
    ]);
  },
  methods: {
    handleMenuItemClick(absoluteIndex, instance) {
      this.$emit('command', absoluteIndex, instance);
      this.$refs.menu.doClose();
    },
    renderNodes(h, data, pId) {
      let nodes = [];
      data.map(item => {
        if (typeof item.id == "undefined") {
          //没有设定id的节点，默认设置id
          item.id = Symbol();
        }
        if (typeof item.pId == "undefined") {
          //没有设定pId的节点，默认设置pId，值为null
          item.pId = null;
        }
      });

      for (const absoluteIndex in data) {
        const menu = data[absoluteIndex];
        if (menu.pId == pId) {
          if (data.find(d => d.pId == menu.id)) {
            //有其他节点的pId是当前id，则判定为父节点
            if (menu.showflg) {
              const node = h("lc-sub-menu", [
                h("template", { slot: "title", props: {} }, [menu.name]),
                this.renderNodes(h, data, menu.id)
              ]);
              nodes.push(node);
            }
          } else {
            //非父节点
            if (menu.showflg) {
              const node = h(
                "lc-menu-item",
                { props: { disabled: !menu.enableFlg, absoluteIndex: absoluteIndex } },
                [menu.name]
              );
              nodes.push(node);
            }
          }
        }
      }
      return nodes;
    }
  }
};
</script>

<style>
.el-popover[x-placement^=right] {
    margin-left: 2px;
}
.lc-menu-popover {
  border-color: #0062ab;
  padding: 10px 0;
}
</style>