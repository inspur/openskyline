<template>
  <ul :id="treeId" class="ztree" style="overflow: auto;">
    <div style='text-align: center;' v-if="!data || data.length === 0">
      <slot name="empty">没有资源，请先添加资源</slot>
    </div>
  </ul>

</template>
<script>
var index = 0
var defaultSetting = {
  async: {
    enable: false,
    contentType: 'application/json',
    type: 'post',
    dataType: 'json'
  },

  data: {
    key: {
      name: 'label'
    }
  },
  view:{
    selectedMulti:false
  },
  callback: {}
};

export default {
  props: {
    // ztree 原生配置 参考 http://www.treejs.cn/v3/api.php
    setting: {
      type: Object,
      default: function () {
        return {}
      }
    },
    /**
     * options.url [String] 获取节点数据的接口
     * options.dataFilter [Function] 对接口返回数据对处理函数
     * options.params [Object] 调用接口时的参数
     */
    extraSetting: {
      type: Object,
      default: function () {
        return {}
      }
    },

    // 非懒加载
    data: {
      type: Array,
      default: function () {
        return []
      }
    }
  },

  data: function () {
    return {
      treeId: 'ztree-' + index++,
      currentSelectedNodeId: ''
    }
  },

  watch: {
    data: {
      handler: function (data) {
        this.init();
      },
      deep: true
    }
  },

  created() {
    var event = ['onDblClick', 'onMouseDown', 'onCheck', 'onCollapse',
      'onDblClick', 'onCollapse', 'beforeDrag', 'onDrag', 'onDragMove', 'onDrop',
      'onMouseUp', 'onNodeCreated', 'beforeEditName',
      'beforeRemove', 'onRemove', 'beforeRename', 'onRename', 'onRightClick', 'onClick',
      'onExpand', 'onAsyncError', 'onAsyncSuccess'];
    event.forEach( (item) => {
      defaultSetting.callback[item] = this.treeEvent(item);
    });

    // 如果不是使用ztree自带的async做懒加载
    if (this.extraSetting.url) {
      defaultSetting.callback.onExpand = this.onExpand
      defaultSetting.callback.onClick = this.onClick
    }
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      var setting = $.extend({}, defaultSetting, this.setting)
      this._setting = setting
      if (this.data) {
        $.fn.zTree.init($(this.$el), setting, this.data)
      } else if (this.extraSetting.url) {
        $.fn.zTree.init($(this.$el), setting)
        this.load(null, true)
      }
    },
    load(treeNode, inited) {
      $.ajax({
        type: this._setting.async.type,
        contentType: this._setting.async.contentType,
        url: this.extraSetting.url,
        data: this.extraSetting.params
      }).done((res) => {
        var treeNodes = []
        if (this.extraSetting.dataFilter) {
          treeNodes = this.extraSetting.dataFilter(res)
        }

        var treeObj = $.fn.zTree.getZTreeObj(this.treeId);
        treeObj.addNodes(treeNode, treeNodes);

        if (inited) {
          Vue.nextTick(() => {
            this.$emit('inited', treeNodes)
          })
        }
      })
    },

    onExpand(event, treeId, treeNode) {
      var treeObj = $.fn.zTree.getZTreeObj(this.treeId);

      this.$emit('on-expand', treeNode, event, treeId)

      if (this.extraSetting.url) {
        Vue.nextTick( () => {
          this.load(treeNode)
        })
      }
    },

    onClick(event, treeId, treeNode) {
      // 已选中节点避免重复选中
      if (treeNode.tId != this.currentSelectedNodeId) {
        this.$emit('on-click', treeNode, event, treeId)
        this.currentSelectedNodeId = treeNode.tId
      }
    },

    /***
     * 调用ztree的原生方法
     * @param actionName 必选 需要调用的原生ztree方法名称
     * @param args 可选参数 调用方法时传入的参数
     * @returns 调用ztree原生方法的返回值
     */
    action(actionName, ...args) {
      var treeObj = $.fn.zTree.getZTreeObj(this.treeId);
      return treeObj[actionName](...args);
    },

    treeEvent(eventName) {
      return (...args) => {
        // this.$emit(Vue.util.hyphenate(eventName), ...args)
        this.$emit(eventName, ...args);
        return false;
      }
    }
  }
}
</script>
<style>
/*.ztree li span.button.add {
  margin-left: 2px;
  margin-right: -1px;
  background-position: -144px 2px;
  vertical-align: top;
  *vertical-align: middle
}*/
</style>
