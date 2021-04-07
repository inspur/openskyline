<template>
  <div>
    <el-table
      ref='imageListTable'
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>    
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="ID">
              <span>{{ props.row.id }}</span>
            </el-form-item>
            <el-form-item label="最小磁盘大小">
              <span>{{ props.row.min_disk }}</span>
            </el-form-item>
            <el-form-item label="最小内存">
              <span>{{ props.row.min_ram }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('owner') >= 0"
        label="所有者"
        prop="owner">
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('name') >= 0"
        label="名称"
        prop="name">
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('status') >= 0"
        label="状态"
        prop="status">
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('visibility') >= 0"
        label="可见性"
        prop="visibility">
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('protected') >= 0"
        label="受保护的"
        prop="protected">
        <template slot-scope="scope">
          <span>{{ protectedRender(scope.row.protected) }}</span>
        </template>
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('disk_format') >= 0"
        label="磁盘格式"
        prop="disk_format">
      </el-table-column>
      <el-table-column  v-if="columnsChecked.indexOf('size') >= 0"
        label="大小"
        prop="size">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
            <span>当前选中 {{multipleSelection.length}}条</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>请选择列</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <el-pagination  style="float: right;"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        tableData: [{"status": "active", "properties": {"direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/983fcd79-8669-48f2-b6ea-8a8bc2aa9e8e/snap"}, "name": "awdqtemplate_example.iso-1503653698313", "checksum": "4b5e3f2130e3dd6a62a87ac620eb5485", "created_at": "2017-08-25T09:31:37Z", "disk_format": "iso", "updated_at": "2017-08-25T09:32:02Z", "visibility": "public", "id": "983fcd79-8669-48f2-b6ea-8a8bc2aa9e8e", "min_disk": 0, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": true, "min_ram": 0, "size": 59969}, {"status": "active", "properties": {"direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/588a040a-a72f-4fea-9435-a701359346ca/snap"}, "name": "testtemplate_example.iso-1503653557841", "checksum": "4b5e3f2130e3dd6a62a87ac620eb5485", "created_at": "2017-08-25T09:29:16Z", "disk_format": "iso", "updated_at": "2017-08-25T09:29:19Z", "visibility": "public", "id": "588a040a-a72f-4fea-9435-a701359346ca", "min_disk": 0, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": true, "min_ram": 0, "size": 59969}, {"status": "active", "properties": {"direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/60b64762-4386-4a6a-bfab-a561e88d3bda/snap"}, "name": "xzxzxcirros-0.3.3-x86_64-disk.img-1503682308780", "checksum": "133eae9fb1c98f45894a4e60d8736619", "created_at": "2017-08-25T09:28:37Z", "disk_format": "qcow2", "updated_at": "2017-08-25T09:28:41Z", "visibility": "public", "id": "60b64762-4386-4a6a-bfab-a561e88d3bda", "min_disk": 0, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": true, "min_ram": 0, "size": 13200896}, {"status": "active", "properties": {"direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/6554a698-a32d-4ee3-a444-243665e83e98/snap"}, "name": "centos7centos7-5.qcow2-1503653033095", "checksum": "666679c7762bd01542de7a75da43a837", "created_at": "2017-08-25T09:26:17Z", "disk_format": "qcow2", "updated_at": "2017-08-25T09:27:13Z", "visibility": "public", "id": "6554a698-a32d-4ee3-a444-243665e83e98", "min_disk": 0, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": true, "min_ram": 0, "size": 1202192384}, {"status": "active", "properties": {"direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/196fee7c-6fbd-4380-8727-8f3bdea0b9f4/snap"}, "name": "crrioscirros-0.3.0-x86_64-disk.qcow2-1503652599140", "checksum": "f54fe98f1d85ef7ff3f6b76ce2c347bc", "created_at": "2017-08-25T09:19:03Z", "disk_format": "qcow2", "updated_at": "2017-08-25T09:19:06Z", "visibility": "public", "id": "196fee7c-6fbd-4380-8727-8f3bdea0b9f4", "min_disk": 0, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": true, "min_ram": 0, "size": 14286848}, {"status": "active", "properties": {"instance_uuid": "3d9ae5f0-28f8-4ee7-ac1b-dbfb08c09aeb", "image_location": "snapshot", "image_state": "available", "user_id": "f15aa130256d4c2e929a472aceaa05df", "image_type": "snapshot", "boot_roles": "admin", "direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/ff459257-23d8-43cc-b4d0-59db3b990012/snap", "base_image_ref": "7b0834f8-ba27-4737-9e6c-b53ca8e2250d", "owner_id": "9e6da8119e034b6a899c299b5de1a427"}, "name": "10G", "checksum": null, "created_at": "2017-08-25T07:59:35Z", "disk_format": "raw", "updated_at": "2017-08-25T08:00:07Z", "visibility": "private", "id": "ff459257-23d8-43cc-b4d0-59db3b990012", "min_disk": 10, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": false, "min_ram": 0, "size": 10737418240}, {"status": "active", "properties": {"instance_uuid": "5fb7187c-f8f0-415a-bb06-ee5bcf8f1c64", "image_location": "snapshot", "image_state": "available", "user_id": "f15aa130256d4c2e929a472aceaa05df", "image_type": "snapshot", "boot_roles": "heat_stack_owner,admin", "direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/7e1c5ed1-a840-4990-a174-6c3bea5b87f8/snap", "base_image_ref": "95852c3c-d386-4e7f-9530-3c46b442a282", "owner_id": "42f4d8484d1b43bfa3ac07c2349645ff"}, "name": "00001", "checksum": null, "created_at": "2017-08-25T07:54:53Z", "disk_format": "raw", "updated_at": "2017-08-25T07:56:42Z", "visibility": "public", "id": "7e1c5ed1-a840-4990-a174-6c3bea5b87f8", "min_disk": 1, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": true, "min_ram": 0, "size": 1073741824}, {"status": "active", "properties": {"instance_uuid": "cb48de42-b816-4b12-b964-7caee9162d63", "image_location": "snapshot", "image_state": "available", "user_id": "f15aa130256d4c2e929a472aceaa05df", "image_type": "snapshot", "boot_roles": "admin", "direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/a8152c9b-ce1e-4d1b-bd3d-914786e9d4f5/snap", "base_image_ref": "7b0834f8-ba27-4737-9e6c-b53ca8e2250d", "owner_id": "9e6da8119e034b6a899c299b5de1a427"}, "name": "\u5feb\u71673", "checksum": null, "created_at": "2017-08-25T07:43:35Z", "disk_format": "raw", "updated_at": "2017-08-25T07:44:39Z", "visibility": "private", "id": "a8152c9b-ce1e-4d1b-bd3d-914786e9d4f5", "min_disk": 20, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": false, "min_ram": 0, "size": 21474836480}, {"status": "active", "properties": {"instance_uuid": "3d9ae5f0-28f8-4ee7-ac1b-dbfb08c09aeb", "image_location": "snapshot", "image_state": "available", "user_id": "f15aa130256d4c2e929a472aceaa05df", "image_type": "snapshot", "boot_roles": "admin", "direct_url": "rbd://2d7c6e88-cb2b-4f2f-9397-4b8fc5f321fe/images/1db62f05-b84c-40c4-bf94-fdc7ac4cf868/snap", "base_image_ref": "7b0834f8-ba27-4737-9e6c-b53ca8e2250d", "owner_id": "9e6da8119e034b6a899c299b5de1a427"}, "name": "\u5feb\u71672", "checksum": null, "created_at": "2017-08-25T07:43:19Z", "disk_format": "raw", "updated_at": "2017-08-25T07:43:51Z", "visibility": "private", "id": "1db62f05-b84c-40c4-bf94-fdc7ac4cf868", "min_disk": 10, "protected": false, "architecture": null, "container_format": "bare", "owner": "admin", "is_public": false, "min_ram": 0, "size": 10737418240}],
        pageSizes: [10, 30, 50],
        pageSize: 10,
        total: 0,
        currentPage: 1,
        columnsChecked: ['owner', 'name', 'status', 'visibility', 'protected', 'disk_format', 'size'],
        columns:[],
        multipleSelection: []
      }
    },
    mounted() {
      let imageListTable = this.$refs.imageListTable;
      imageListTable.$children.forEach((item, index) => {
        if (item.label && item.prop) {
          this.columns.push({
            prop: item.prop,
            label: item.label
          });
        }
      });
      this.total = this.tableData.length;
    },
    methods: {
      protectedRender(val) {
        if (val === true) {
          return "是";
        } else {
          return "否";
        }
      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      onRefresh() {
      }
    }
  }
</script>
<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>