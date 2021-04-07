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
    <el-dropdown  trigger="click"  v-if="operateMore" @command="menusMoreHandler">
      <el-button  type="primary" size="small">
        {{$t('calcStorLang.instMoreOperate')}}<i class="el-icon-caret-bottom el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item class="clearfix" 
          v-for="(menu, index) in menusMore" 
          :key="index"
          :disabled="!!!menu.enableFlg"
          :command="index"
          v-if="menu.showflg">
          {{menu.name}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'OperationPanel',
  props: {
    selectRows: {
      type: Array,
      default: []
    },
    operationMenus: {
      type: Array,
      default: []
    },
    operateMore: false
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
        if (menu.readOnly || menu.nonSelected) {
          menu.enableFlg = true;
        }
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
        if (menu.readOnly || menu.nonSelected) {
          menu.enableFlg = true;
        }
        if (menu.operateMore) {
           menus.push(menu);
        }
      });
      return menus;
    },
    menusMoreHandler(index, row) {
      (this.menusMore)[index].handler(this.selectRows);
    },
    reset(rows) {
      this.menus.forEach( (item, index) => {
        let menu = item;
        let len = rows.length;
        if (menu.nonSelected) {
          menu.enableFlg = (len < 1);
        } else if (menu.readOnly) {
          menu.enableFlg = true;
        } else if (len < 1) {
          menu.enableFlg = false;
        } else if (!menu.multi && len > 1) {
          menu.enableFlg = false;
        } else {
          let index = rows.findIndex((row) => (Object.prototype.toString.call(menu.enable) === "[object Function]" && menu.enable(row) === false));
          menu.enableFlg = (index == -1);
        }
        this.menus.splice(index, 1, menu);
      });
      //更多菜单
      this.menusMore.forEach( (item, index) => {
        let menu = item;
        let len = rows.length;
        if (menu.nonSelected) {
          menu.enableFlg = (len < 1);
        } else if (menu.readOnly) {
          menu.enableFlg = true;
        } else if (len < 1) {
          menu.enableFlg = false;
        } else if (!menu.multi && len > 1) {
          menu.enableFlg = false;
        } else {
          let index = rows.findIndex((row) => (Object.prototype.toString.call(menu.enable) === "[object Function]" && menu.enable(row) === false));
          menu.enableFlg = (index == -1);
        }
        this.menusMore.splice(index, 1, menu);
      });
    }
  }
}
</script>
<style scoped>
</style>
