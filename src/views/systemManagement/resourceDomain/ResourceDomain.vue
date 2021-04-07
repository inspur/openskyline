<template>
  <div>
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus"
    ></operation-panel>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      border
      stripe
      style="width: 100%"
      row-key="id"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('base.name')"
        align="left"
        sortable="custom"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('desc') >= 0"
        prop="desc"
        align="left"
        :label="$t('base.desc')"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('domainid') >= 0"
        prop="domainid"
        :label="$t('base.DOMAIN_ID')"
        align="left"
        sortable="custom"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('active') >= 0"
        prop="active"
        :label="$t('base.activation')"
        align="left"
        sortable="custom"
        min-width="100"
      ></el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh"></el-button>
          <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox
                class="item"
                v-for="(item, index) in columns"
                :label="item.prop"
                :key="item.prop"
              >{{item.label}}</el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <el-pagination
            class="right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </el-col>
      </el-row>

      <motify-resource-domain ref="motifyDomain" v-if="motifyDomainFlg"></motify-resource-domain>

      <motify-domain-member ref="motifyDomainMember" v-if="motifyMemberFlg"></motify-domain-member>

      <motify-domain-group ref="motifyDomainGroup" v-if="motifyGroupFlg"></motify-domain-group>
    </div>
  </div>
</template>
<script>
import MotifyResourceDomain from "./MotifyResourceDomain";
import MotifyDomainMember from "./MotifyDomainMember";
import MotifyDomainGroup from "./MotifyDomainGroup";
export default {
  name: "metaData",
  data() {
    return {
      motifyDomainFlg: false,
      motifyMemberFlg: false,
      motifyGroupFlg: false,
      tableData: [],
      loading: false,
      multipleSelection: [],
      currentPage: 1,
      pageSizes: [10, 30, 50],
      pageSize: 10,
      total: 0,
      columns: [
        {
          prop: "name",
          label: Vue.t("base.name")
        },
        {
          prop: "desc",
          label: Vue.t("base.desc")
        },
        {
          prop: "domainid",
          label: Vue.t("base.DOMAIN_ID")
        },
        {
          prop: "active",
          label: Vue.t("base.activation")
        }
      ],
      columnsChecked: ["name", "desc", "domainid", "active"],
      operationMenus: [
        {
          icon: "fa-edit",
          name: Vue.t("base.MODIFY_DOMAIN_INFORMATION"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function() {
            let me = this;
            me.motifyDomainFlg = true;
            me.$nextTick(() => {
              me.$refs.motifyDomain.show();
            });
          }.bind(this)
        },
        {
          icon: "fa-edit",
          name: Vue.t("base.MODIFY_DOMAIN_MEMBERS"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function() {
            let me = this;
            me.motifyMemberFlg = true;
            me.$nextTick(() => {
              me.$refs.motifyDomainMember.show();
            });
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: Vue.t("base.MODIFY_DOMAIN_GROUP"),
          showflg: true,
          multi: false,
          enable(rowData) {
            return true;
          },
          handler: function(selectedRows) {
            let me = this;
            me.motifyGroupFlg = true;
            me.$nextTick(() => {
              me.$refs.motifyDomainGroup.show();
            });
          }.bind(this)
        }
      ]
    };
  },
  mounted() {
    this.tableData = [
      {
        id: 1,
        name: "Default",
        desc: "The default domain1",
        domainid: "default",
        active: "true"
      },
      {
        id: 2,
        name: "Default1",
        desc: "The default domain2",
        domainid: "default",
        active: "true"
      },
      {
        id: 3,
        name: "Default2",
        desc: "The default domain3",
        domainid: "default",
        active: "true"
      }
    ];
    this.total = 3;
  },
  methods: {
    onRefresh() {},
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    sortChange(sortItem) {},
    handleSizeChange(val) {},
    handleCurrentChange(val) {},
    onSubmit() {}
  },
  components: {
    MotifyResourceDomain,
    MotifyDomainMember,
    MotifyDomainGroup
  }
};
</script>
