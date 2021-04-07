<template>
  <div class="operation-panel">
    <el-button type="primary" size="small"
      :icon="menu.icon"
      :disabled="!!!menu.enableFlg"
      @click="menu.handler(selectRows, $event)"
      v-for="(menu, index) in menus"
      :key="index"
      v-if="menu.showflg">
      {{menu.name}}
    </el-button>

    <lc-menu v-if="operateMore" :data="menusMore" @command="menusMoreHandler" :label="$t('calcStorLang.instMoreOperate')">
      <!-- <div v-for="(menu, index) in menusMore"
        :key="index">
        <lc-menu-item
          v-if="(typeof menu.pId == 'undefined') && menu.showflg"
          :disabled="!!!menu.enableFlg"
          :label="menu.name"
          @click="menusMoreHandler[index].handler(this.selectRows)">
        </lc-menu-item>

        <lc-sub-menu
          v-if="(typeof menu.pId != 'undefined') && menu.showflg">
          <template slot="title">{{ menu.name }}</template>
          <lc-menu-item label="B"></lc-menu-item>
          <lc-menu-item label="B"></lc-menu-item>
          <lc-menu-item label="B"></lc-menu-item>
          <lc-sub-menu>
            <template slot="title">B</template>
            <lc-menu-item label="C"></lc-menu-item>
            <lc-menu-item label="C"></lc-menu-item>
          </lc-sub-menu>
          <lc-menu-item label="D"></lc-menu-item>
          <lc-menu-item label="D"></lc-menu-item>
        </lc-sub-menu>
      </div>
      <lc-menu-item label="E">
      </lc-menu-item> -->
    </lc-menu>

  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import LCMenu from './customMenu/LCMenu'
import LCSubMenu from './customMenu/LCSubMenu'
import LCMenuItem from './customMenu/LCMenuItem'
export default {
  name: 'OperationPanelNew',
  props: {
    selectRows: {
      type: Array,
      default: []
    },
    operationMenus: {
      type: Array,
      default: []
    },
    operateMore: false,
    selectedMoreMenu: []
  },
  components: {
    'lc-menu': LCMenu,
    'lc-sub-menu': LCSubMenu,
    'lc-menu-item': LCMenuItem
  },
  data() {
    return {
      menus: this.initMenus(),
      menusMore: this.initMoreMenus()
    }
  },
  computed: {
  },
  watch: {
    selectRows: {
      handler: function (rows, oldVal) {
        this.reset(rows);
      },
      deep: true
    },
    operationMenus: {
      handler: function (rows, oldVal) {
        this.menus = this.initMenus();
        this.menusMore = this.initMoreMenus();
      },
      deep: true
    }
  },
  mounted() {
  },
  methods: {
    initMenus() {
      let menus = [];
      this.operationMenus.forEach( (item, index) => {
        let menu = item;
        menu.enableFlg = false;
        if (menu.readOnly) { menu.enableFlg = true; }
        if (!menu.operateMore) {
           menus.push(menu);
        }
      });
      return menus;
    },
    initMoreMenus() {
      let menus = [];
      this.operationMenus.forEach( (item, index) => {
        let menu = item;
        menu.enableFlg = false;
        if (menu.readOnly) { menu.enableFlg = true; }
        if (menu.operateMore) {
           menus.push(menu);
        }
      });
      return menus;
    },
    menusMoreHandler(index, row) {
      (this.menusMore)[index].handler(this.selectRows);
    },
    renderMoreMenus(h) {
      return h('div');
    },
    reset(rows) {
      this.menus.forEach( (item, index) => {
        let menu = item;
        if (menu.readOnly) {
          menu.enableFlg = true;
        } else if (rows.length <=0) {
          menu.enableFlg = false;
        } else if (!menu.multi && rows.length>1 ) {
          menu.enableFlg = false;
        } else {
          let flg = true;
          rows.forEach( (row, index) => {
            if (!menu.enable(row) ) {
              flg = false;
            }
          });
          menu.enableFlg = flg;
        }
        this.menus.splice(index, 1, menu);
      });
      //更多菜单
      this.menusMore.forEach( (item, index) => {
        let menu = item;
        if (menu.readOnly) {
          menu.enableFlg = true;
        } else if (rows.length <=0) {
          menu.enableFlg = false;
        } else if (!menu.multi && rows.length>1 ) {
          menu.enableFlg = false;
        } else {
          let flg = true;
          rows.forEach( (row, index) => {
            if (!menu.enable(row) ) {
              flg = false;
            }
          });
          menu.enableFlg = flg;
        }
        this.menusMore.splice(index, 1, menu);
      });
    }
  }
}
</script>

<style scoped>
.el-popover {
  padding: 0px;
}
</style>