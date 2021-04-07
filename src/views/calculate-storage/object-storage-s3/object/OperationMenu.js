module.exports = function() {
  return [{
    icon: "fa-plus",
    name: this.$t('storage.createCatalog'),
    showflg: true,
    readOnly: true,
    handler: function (selectRows) {
      let self = this;
      if (self.pathList.length > 10) {
        self.$message.error(self.$t("storage.S3_CATALOG_LEVEL_MAX_10"));
        return false;
      }
      self.createCatalogFlg = true;
      self.filePath = self.currentPath;
    }.bind(this)
  }, {
    icon: "fa-upload",
    name: this.$t('lang.uploadDoc'),
    showflg: true,
    readOnly: true,
    enable(rowData) {
      return true;
    },
    handler: function (selectRows) {
      let self = this;
      self.filePath = self.currentPath;
      self.uploadDocFlg = true;
      self.multipartFlag = false;
    }.bind(this)
  }, {
    icon: "fa-clone",
    name: this.$t('storage.COPY_OBJECT'),
    showflg: true,
    enable(rowData) {
      return rowData.type === 'object';
    },
    handler: function (selectRows) {
      const $this = this;
      const obj = selectRows[0];
      $this.copyObjectDialog.fileName = obj.name;
      $this.copyObjectDialog.fullPath = $this.currentPath + obj.name;
      $this.copyObjectDialog.visible = true;
    }.bind(this)
  }, {
    icon: "fa-download",
    name: this.$t('storage.download'),
    showflg: true,
    multi: false,
    enable(rowData) {
      return rowData.type === "object";
    },
    handler: function (selectRows) {
      let self = this;
      let obj = selectRows[0];
      let maxSize = 5 * 1024 * 1024 * 1024; //5GB 单个文件不得大于5GB
      if (obj.bytes > maxSize) {
        self.$message.error("所选文件大于5G，推荐使用API工具下载");
        return false;
      }
      self.$refs.objectTable.clearSelection();
      self.$recordLog({
        target: Vue.logTarget.storage_object_storage,
        level: {
          en: "info",
          zh_cn: "信息"
        },
        description: {
          en: `Download file(${obj.name}), from the Bucket(${self.bucketName}), and the Path(${this.$t("storage.S3_ROOT_DIR")}/${self.currentPath})`,
          zh_cn: `下载文件（${obj.name}），来自桶（${self.bucketName}）内路径（${this.$t("storage.S3_ROOT_DIR")}/${self.currentPath}）`
        }
      });
      let url = "/s3-api/rgw/" + self.bucketName + "/" + self.currentPath + obj.name;
      url = url.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/#/g, " ").replace(/@/g, " ").replace(/%/g, " ").replace(/"/g, "&quot;");
      window.open(url, '_blank');
    }.bind(this)
  }, {
    icon: "fa-times",
    name: this.$t('lang.delete'),
    showflg: true,
    multi: true,
    enable(rowData) {
      return true;
    },
    handler: function (selectRows) {
      var self = this;
      self.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
        confirmButtonText: this.$t('lang.confirm'),
        cancelButtonText: this.$t('lang.cancel'),
        inputPattern: /^YES$|^NO$/i,
        inputValue: "NO",
        customClass: "promptConfirmDel",
        inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
      }).then(async ({ value }) => {
        if ("yes" == value.toLowerCase()) {
          self.deleteButtonFun(selectRows);
        }
      }).catch(() => {
        //取消
      });
    }.bind(this)
  }, {
    icon: "fa-edit",
    name: this.$t('storage.bucketACLSet'),
    showflg: true,
    multi: false,
    enable(rowData) {
      return rowData.type === "object";
    },
    handler: function (selectRows) {
      let self = this;
      let row = selectRows[0];
      this.filePath = this.currentPath;
      this.fileName = row.name;
      self.setaclFlag = true;
    }.bind(this)
  }, {
    icon: "fa-file-archive-o",
    name: this.$t('storage.multipartFile'),
    showflg: true,
    readOnly: true,
    handler: function (selectRows) {
      let self = this;
      self.multipartFlag = true;
      this.$nextTick(() => {
        self.$refs.multipart.getFragmentList();
     });
    }.bind(this)
  }, {
    icon: "fa-reply",
    name: this.$t('lang.backToPrevious'),
    showflg: true,
    readOnly: true,
    handler: function (selectRows) {
      let self = this;
      if (self.canClickCatalogFlag) {
        return false;
      }
      self.canClickCatalogFlag = true;
      self.$refs.objectTable.clearSelection();
      if (self.pathList && self.pathList.length > 1) {
        self.pathList.pop();
        self.currentPath = self.pathList[self.pathList.length - 1]["path"];
        self.NextMarker = self.currentPath;
        self.prevDisabled = true;
        self.currentPage = 1;
        self.reqParams = {
          "Prefix": self.currentPath,
          "Delimiter": "/",
          "Marker": self.NextMarker,
          "MaxKeys": self.pageSize
        };
        self.$refs.icosSearchBar.clearValidatedBasicConditionNotSearch();
        self.loadData(self.reqParams);
      } else {
        self.$router.push({
          path: '/calculate-storage/object-storage-s3/bucketList'
        });
      }
    }.bind(this)
  }];
}
