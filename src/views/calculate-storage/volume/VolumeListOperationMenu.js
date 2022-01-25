module.exports = function() {
    return [
        {
            icon: "fa-plus",
            name: this.$t("storage.createVolume"), //创建云硬盘
            showflg: this.isUser(),
            readOnly: true,
            handler: function (selectRows) {
                let me = this;
                me.newVolumeFlg = true;
                me.newVolumeCode = "NewVolume"
                me.$nextTick(() => {
                    me.$refs.newVolume.show();
                });
            }.bind(this)
        },
        {
            icon: "fa-play",
            name: Vue.t("lang.startUp"), //启动
            showflg: Vue.roleType != "3",
            multi: false,
            enable(rowData) {
                return (
                    rowData["status"] + "" == "available" &&
                    rowData["bootable"] + "" == "true" &&
                    rowData["migration_status"] + "" != "migrating"
                );
            },
            handler: function (selectRows) {
                const volume = selectRows[0];
                this.createInstanceDialog.sourceId = volume.id;
                this.createInstanceDialog.sourceName = volume.name;
                if (volume.glance_metadata && volume.glance_metadata.os_distro) {
                  this.createInstanceDialog.sourceOSDistro = volume.glance_metadata.os_distro;
                }
                if (volume.volume_image_metadata) {
                  this.createInstanceDialog.sourceMinRam.min_ram = volume.volume_image_metadata.min_ram;
                } else {
                  this.createInstanceDialog.sourceMinRam = 0;
                }
                this.createInstanceDialog.sourceSize = volume.size ? volume.size : 0;
                this.createInstanceDialog.projectId = volume['os-vol-tenant-attr:tenant_id'];
                this.createInstanceDialog.visible = true;
            }.bind(this)
        },
        {
            icon: "fa-plus",
            name: this.$t("storage.applyVol"), //申请云硬盘
            showflg: !this.isUser(),
            readOnly: true,
            handler: function (selectRows) {
                let me = this;
                me.applyVolumeFlg = true;
                me.$nextTick(() => {
                    me.$refs.applyVolume.show();
                });
            }.bind(this)
        },
        {
            icon: "fa-pencil-square-o",
            name: this.$t("lang.edit"), //编辑
            showflg: true,
            enable(rowData) {
                return (
                    (rowData["status"] == "available" || rowData["status"] == "in-use") && rowData["migration_status"] + "" != "migrating"
                );
            },
            handler: function (selectRows) {
                let me = this;
                me.volumeEntity = selectRows[0];
                me.editVolumeFlg = true;
                me.$nextTick(() => {
                    me.$refs.editVolume.show();
                    me.volumeTempId = selectRows[0].id;
                    me.$refs.editVolume.editVolumeForm.multiattach = selectRows[0].multiattach;
                    if (
                        typeof selectRows[0].name == "undefined" ||
                        null == selectRows[0].name ||
                        "" == selectRows[0].name
                    ) {
                        me.$refs.editVolume.editVolumeForm.name = selectRows[0].id;
                    } else {
                        me.$refs.editVolume.editVolumeForm.name = selectRows[0].name;
                    }
                    me.$refs.editVolume.editVolumeForm.description =
                        selectRows[0].description || "";
                    if (selectRows[0].bootable == "true") {
                        me.$refs.editVolume.editVolumeForm.bootable = true;
                    } else {
                        me.$refs.editVolume.editVolumeForm.bootable = false;
                    }
                });
            }.bind(this)
        },
        {
            icon: "fa-arrows",
            name: this.$t("storage.applyExpansion"), //申请扩容
            showflg: !this.isUser(),
            enable(rowData) {
                return (rowData["status"] == "available" || rowData["status"] == "in-use") && rowData["migration_status"] + "" != "migrating";
            },
            handler: function (selectRows) {
                let me = this;
                if (this.isHasApplyExpansion(selectRows[0].id)) {
                    return;
                }
                me.detailVolume = selectRows[0];
                me.expandVolumeFlg = true;
                me.dialogTittle = me.$t("storage.applyExpansion");
                me.$nextTick(() => {
                    me.$refs.expandVolume.show();
                    me.$refs.expandVolume.expandVolume.name = selectRows[0].name;
                    me.$refs.expandVolume.expandVolume.projectId =
                        selectRows[0]["os-vol-tenant-attr:tenant_id"];
                    me.$refs.expandVolume.expandVolume.volumeId = selectRows[0].id;
                    me.$refs.expandVolume.expandVolume.size = selectRows[0].size * 1;
                    me.$refs.expandVolume.expandVolume.sizeInfinite =
                        selectRows[0].size * 1;
                    me.$refs.expandVolume.oldSize = selectRows[0].size * 1;
                });
            }.bind(this)
        },
        {
            icon: "fa-times",
            name: this.$t("lang.delete"), //删除
            multi: true,
            showflg: Vue.roleType + "" === "3", //用于项目用户
            enable(rowData) {
                return ["error", "available"].includes(rowData["status"]);
            },
            handler: async function (selectRows) {
                var self = this;
                let statusList = [];
                for (let i = 0; i < selectRows.length; i++) {
                    const element = selectRows[i];
                    let tempStatus = self.volumeStatusRender(selectRows[i]["status"], selectRows[i]);
                    if (!statusList.includes(tempStatus)) {
                        statusList.push(tempStatus);
                    }
                }
                statusList = statusList.join("/");
                let content = `${this.$t('storage.forceDeleteVolumeMsg', statusList)},${this.$t('lang.inputYesToContinue')}`;
                self.$prompt(
                    content,
                    this.$t("lang.confirm"),
                    {
                        confirmButtonText: this.$t("lang.confirm"),
                        cancelButtonText: this.$t("lang.cancel"),
                        inputPattern: /^YES$|^NO$/i,
                        inputValue: "NO",
                        customClass: "promptConfirmDel",
                        inputErrorMessage: this.$t("lang.onlyAcceptYesOrNo")
                    }
                ).then(async ({ value }) => {
                    if ("yes" == value.toLowerCase()) {
                        let url = "";
                        if (Vue.roleType == "0") {
                            url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/{id}?force=True";
                        } else {
                            url = "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/{id}";
                        }
                        self.$sequence({
                            type: "delete",
                            url: url,
                            params: selectRows,
                            headers: {
                                "OpenStack-API-Version": "volume 3.23"
                            },
                            errorKey: "badRequest",
                            log: {
                                description: {
                                    en: "Delete volume {name}({id})",
                                    zh_cn: "删除云硬盘{name}({id})"
                                },
                                target: Vue.logTarget.storage_volume
                            },
                            successFun: function () {
                                for (var r = 0; r < selectRows.length; r++) {
                                    var row = selectRows[r];
                                    var volume = self.volumeMaps.get(row.id);
                                    row['status'] = 'deleting';
                                    volume["status"] = "deleting";
                                }
                                self.loading = true;
                                self.$refs.volumeTable.clearSelection();
                                self.currentPage = 1;
                                setTimeout(function () {
                                    self.loadData(self.queryParams);
                                    self.loading = false;
                                }, 5000);
                            }
                            // successMsg: "删除发送成功",
                        }).then(data => {
                                self.$message(Vue.t("storage.sendDeleteSuccess"));
                        }).catch(err => { });
                    }
                }).catch(() => {
                        //取消
                });
            }.bind(this)
        },
        {
            icon: "fa-times",
            name: this.$t("lang.delete"), //删除
            multi: true,
            showflg: Vue.roleType + "" != "3", //用于超管和项目管理员
            enable(rowData) {
                return rowData["status"] != "in-use";
            },
            handler: async function (selectRows) {
                var self = this;
                let statusList = [];
                for (let i = 0; i < selectRows.length; i++) {
                    const element = selectRows[i];
                    let tempStatus = self.volumeStatusRender(selectRows[i]["status"], selectRows[i]);
                    if (!statusList.includes(tempStatus)) {
                        statusList.push(tempStatus);
                    }
                }
                statusList = statusList.join("/");
                let pid = this.$cookie.get('pid');
                let content = `${self.$t('storage.forceDeleteVolumeMsg', [statusList])}${this.$t('lang.inputYesToContinue')}`;
                let body = {
                    "os-force_delete": {}
                };
                body = JSON.stringify(body);
                self.$prompt(
                    content,
                    this.$t("lang.confirm"),
                    {
                        confirmButtonText: this.$t("lang.confirm"),
                        cancelButtonText: this.$t("lang.cancel"),
                        inputPattern: /^YES$|^NO$/i,
                        inputValue: "NO",
                        customClass: "promptConfirmDel",
                        inputErrorMessage: this.$t("lang.onlyAcceptYesOrNo")
                    }
                ).then(async ({ value }) => {
                    if ("yes" == value.toLowerCase()) {
                        self.$sequence({
                            type: "post",
                            url: `api/cinderv3/v3/${pid}/volumes/{id}/action`,
                            data: body,
                            params: selectRows,
                            log: {
                                description: {
                                    en: "Delete volume {name}({id})",
                                    zh_cn: "删除云硬盘{name}({id})"
                                },
                                target: Vue.logTarget.storage_volume
                            },
                            successFun: function () {
                                for (var r = 0; r < selectRows.length; r++) {
                                    var row = selectRows[r];
                                    var volume = self.volumeMaps.get(row.id);
                                    row['status'] = 'deleting';
                                    volume["status"] = "deleting";
                                }
                                self.loading = true;
                                self.$refs.volumeTable.clearSelection();
                                self.currentPage = 1;
                                setTimeout(function () {
                                    self.loadData(self.queryParams);
                                    self.loading = false;
                                }, 5000);
                            }
                            // successMsg: "删除发送成功",
                        }).then(data => {
                            self.$message(Vue.t("storage.sendDeleteSuccess"));
                        }).catch(err => { });
                    }
                }).catch(() => {
                    //取消
                });
            }.bind(this)
        },
        {
            icon: "fa-recycle",
            name: this.$t("calcStorLang.SOFT_DELETE"), //软删除
            multi: true,
            showflg: false,
            enable(rowData) {
                return rowData["status"] == "available";
            },
            handler: async function (selectRows) {
                var self = this;
                this.$confirm(this.$t('storage.if_soft_deleted_msg'), this.$t('lang.confirm'), {
                    confirmButtonText: this.$t('lang.confirm'),
                    cancelButtonText: this.$t('lang.cancel'),
                    type: 'warning'
                }).then(async () => {
                    var body = { "os-soft_delete_inspur": null };
                    body = JSON.stringify(body);
                    self.$sequence({
                        type: "post",
                        url: "api/cinderv3/v3/" + this.$cookie.get("pid") + "/volumes/{id}/action",
                        params: selectRows,
                        data: body,
                        headers: {
                            "OpenStack-API-Version": "volume 3.0"
                        },
                        log: {
                            description: {
                                en: "soft-delete volume",
                                zh_cn: "软删除云硬盘"
                            },
                            key: "name",
                            target: Vue.logTarget.storage_volume
                        },
                        successFun: function () {
                            for (var r = 0; r < selectRows.length; r++) {
                                var row = selectRows[r];
                                var volume = self.volumeMaps.get(row.id);
                                row['status'] = 'soft_deleting';
                                volume["status"] = "soft_deleting";
                            }
                            self.$refs.volumeTable.clearSelection();
                            self.currentPage = 1;
                            self.loadData(self.queryParams);
                        }
                    }).then(data => {
                        self.$message(Vue.t("calcStorLang.SOFT_DELETE_SENT_SUCCESSFULLY"));
                    }).catch(err => { });
                }).catch(() => {});
            }.bind(this)
        },
        {
            icon: "fa-refresh",
            name: this.$t("storage.refreshStatus"), //更新状态
            showflg: this.isAdmin(),
            enable(rowData) {
                return true;
            },
            handler: function (selectRows) {
                let me = this;
                let row = selectRows[0];
                me.volumeTempId = row["id"];
                me.temp_volume_name = row["name"];
                me.refreshStatusFlg = true;
                me.$nextTick(() => {
                    me.$refs.refreshStatus.show();
                });
            }.bind(this)
        },
        {
            icon: "fa-refresh",
            name: this.$t("storage.editVolType"), //云硬盘类型修改
            operateMore: true,
            showflg: false,
            enable(rowData) {
                return rowData["migration_status"] + "" != "migrating";
            },
            handler: function (selectRows) {
                let me = this;
                me.editVolumeTypeFlg = true;
                me.$nextTick(() => {
                    me.$refs.editVolumeType.show();
                    me.$refs.editVolumeType.editVolumeType.name = selectRows[0].name;
                });
            }.bind(this)
        },
        {
            icon: "fa-truck",
            name: this.$t("storage.migration"), //迁移
            operateMore: true,
            showflg: false, //this.isAdmin(),story#25539
            enable(rowData) {
                return (
                    rowData["status"] == "available" &&
                    (rowData["volume_type"] == null || rowData["volume_type"] == "") &&
                    rowData["migration_status"] + "" != "migrating"
                );
            },
            handler: function (selectRows) {
                let me = this;
                if (selectRows[0]["is_active_active"]) {
                    me.$message(Vue.t("storage.doubleActiveVolMsg"));
                    return false;
                }
                me.volumeMoveFlg = true;
                me.$nextTick(() => {
                    me.$refs.volumeMove.show();
                    me.$refs.volumeMove.volumeMove.volumeId = selectRows[0].id;
                    me.$refs.volumeMove.volumeMove.name = selectRows[0].name;
                    me.$refs.volumeMove.volumeMove.host =
                        selectRows[0]["os-vol-host-attr:host"];
                });
            }.bind(this)
        },
        {
            icon: "fa-gear",
            name: this.$t("storage.manageConnect"), //管理连接
            showflg: true,
            operateMore: true,
            enable(rowData) {
                return (
                    (rowData["status"] == "available" || rowData["status"] == "in-use") && rowData["migration_status"] + "" != "migrating"
                );
            },
            handler: function (selectRows) {
                let me = this;
                me.manageLinkFlg = true;
                me.detailVolume = selectRows[0];
            }.bind(this)
        },
        {
            icon: "fa-arrows",
            name: this.$t("storage.onlineExtending"), //在线扩容
            showflg: this.isUser(),
            operateMore: true,
            enable(rowData) {
                return rowData["status"] == "in-use" && rowData["migration_status"] + "" != "migrating" && !rowData['encrypted'];
            },
            handler: function (selectRows) {
                let me = this;
                if (selectRows[0]["is_active_active"]) {
                    me.$message(Vue.t("storage.doubleActiveVolMsg"));
                    return false;
                }
                me.detailVolume = selectRows[0];
                me.expandVolumeFlg = true;
                me.dialogTittle = me.$t("storage.onlineExtending");
                me.$nextTick(() => {
                    me.$refs.expandVolume.show();
                    me.$refs.expandVolume.expandVolume.name = selectRows[0].name;
                    me.$refs.expandVolume.expandVolume.projectId =
                        selectRows[0]["os-vol-tenant-attr:tenant_id"];
                    me.$refs.expandVolume.expandVolume.volumeId = selectRows[0].id;
                    me.$refs.expandVolume.expandVolume.size = selectRows[0].size * 1;
                    me.$refs.expandVolume.oldSize = selectRows[0].size * 1;
                    me.$refs.expandVolume.expandVolume.status = selectRows[0].status;
                    me.$refs.expandVolume.qryVolhasSnapsolt(selectRows[0].id);
                });
            }.bind(this)
        },
        {
            icon: "fa-arrows",
            name: this.$t("storage.offlineExtending"), //离线扩容
            showflg: this.isUser(),
            operateMore: true,
            enable(rowData) {
                return rowData["status"] == "available" && rowData["migration_status"] + "" != "migrating";
            },
            handler: function (selectRows) {
                let me = this;
                me.detailVolume = selectRows[0];
                me.expandVolumeFlg = true;
                me.dialogTittle = me.$t("storage.offlineExtending");
                me.$nextTick(() => {
                    me.$refs.expandVolume.show();
                    me.$refs.expandVolume.expandVolume.name = selectRows[0].name;
                    me.$refs.expandVolume.expandVolume.projectId =
                        selectRows[0]["os-vol-tenant-attr:tenant_id"];
                    me.$refs.expandVolume.expandVolume.volumeId = selectRows[0].id;
                    me.$refs.expandVolume.expandVolume.size = selectRows[0].size * 1;
                    me.$refs.expandVolume.oldSize = selectRows[0].size * 1;
                    me.$refs.expandVolume.expandVolume.status = selectRows[0].status;
                    me.$refs.expandVolume.qryVolhasSnapsolt(selectRows[0].id);
                });
            }.bind(this)
        },
        {
            icon: "fa-camera",
            name: this.$t("storage.createImage"), //创建镜像
            showflg: this.isUser(),
            operateMore: true,
            enable(rowData) {
                let roleType = Vue.roleType + "";
                return ((rowData["status"] == "available") && roleType != "3") && rowData["migration_status"] + "" != "migrating" && rowData['bootable'] === "true" && !rowData['encrypted'] && !rowData['multiattach'];
            },
            handler: function (selectRows) {
                let me = this;
                let row = selectRows[0];
                me.detailVolume = selectRows[0];
                me.volumeTempId = row["id"];
                me.temp_volume_name = row["name"];
                me.volumeImageFlg = true;
                me.$nextTick(() => {
                    me.$refs.volumeImage.show();
                    me.$refs.volumeImage.volumeImageForm.volumeName =
                        selectRows[0].name;
                        me.$refs.volumeImage.volumeImageForm.project = me.volumeProjectRender(selectRows[0]['os-vol-tenant-attr:tenant_id'], null);
                    });
            }.bind(this)
        },
        {
            icon: "fa-clone",
            name: this.$t("storage.createvolumeBak"), //创建备份
            showflg: this.isUser(),
            operateMore: true,
            enable(rowData) {
                return (
                    (rowData["status"] == "available" || rowData["status"] == "in-use") && rowData["migration_status"] + "" != "migrating"
                );
            },
            handler: function (selectRows) {
                let me = this;
                me.addVolumeBakFlg = true;
                me.detailVolume = selectRows[0];
                me.vId = selectRows[0].id;
                me.vStatus = selectRows[0].status;
            }.bind(this)
        },
        {
            icon: "fa-camera",
            name: this.$t("storage.createSnapshot"), //创建快照
            showflg: this.isUser(),
            operateMore: true,
            enable(rowData) {
                if (rowData["status"] == "available" || rowData["status"] == "in-use") {
                    if (rowData["migration_status"] + "" != "migrating") {
                        if (rowData['storage_type'] =='rbd' && rowData["multiattach"]) {
                          return false;
                        } else {
                            return true;
                        }
                    }
                }
                return false;
            },
            handler: function (selectRows) {
                let me = this;
                me.volumeSnapshotFlg = true;
                me.vId = selectRows[0].id;
                me.detailVolume = selectRows[0];
                me.$nextTick(() => {
                    me.$refs.volumeSnapshot.show();
                });
            }.bind(this)
        },
        {
            icon: "fa-plus",
            name: this.$t("storage.revertSnapshot"), //快照恢复
            showflg: Vue.roleType == "2" || Vue.roleType == "0",
            operateMore: true,
            enable(rowData) {
                return rowData["status"] == "available" || rowData["status"] == "in-use";
            },
            handler: function (selectRows) {
                let me = this;
                me.revertBySnapshotFlag = true;
                me.volumeInfo = selectRows[0];
            }.bind(this)
        },
        {
            icon: "fa-plus",
            name: this.$t("storage.migration"), //迁移
            //story#25539
            //name: this.$t("storage.updateType"),
            showflg: Vue.roleType == "2",
            operateMore: true,
            enable(rowData) {
                return !rowData['encrypted'] && (rowData["status"] == "available" || rowData["status"] == "in-use" ) && rowData["migration_status"] + "" != "migrating";
            },
            handler: function (selectRows) {
                let me = this;
                if (selectRows[0]["is_active_active"]) {
                    me.$message.warning(Vue.t("storage.doubleActiveVolMsg"));
                    return false;
                }
                if (selectRows[0]["status"] == "in-use" && selectRows[0]["multiattach"]) {
                    me.$message.warning(Vue.t("storage.volumeMigrationMsg"));
                    return false;
                }
                me.updateTypeFlg = true;
                me.detailVolume = selectRows[0];
            }.bind(this)
        },
        {
            icon: "fa-times",
            name: this.$t('storage.safeDelete'), //安全删除按钮
            showflg: this.isUser() && Vue.showSafeDelete,
            multi: false,
            operateMore: true,
            enable(rowData) {
                // return rowData["status"] === "available" || rowData["status"] === "error";
                return rowData["status"] === "available";
            },
            handler: function (selectRows) {
                let self = this;
                let pid = this.$cookie.get('pid');
                let status = self.volumeStatusRender(selectRows[0]["status"], selectRows[0]);
                let { id: volumeId = "", name: volumeName = "" } = selectRows[0];
                if (volumeName) {
                    volumeName = `${volumeName}(${volumeId})`;
                } else {
                    volumeName = volumeId;
                }
                this.$prompt(this.$t('lang.inputYesToContinue'), this.$t('lang.confirm'), {
                    confirmButtonText: this.$t('lang.confirm'),
                    cancelButtonText: this.$t('lang.cancel'),
                    inputPattern: /^YES$|^NO$/i,
                    inputValue: "NO",
                    customClass: "promptConfirmDel",
                    inputErrorMessage: this.$t('lang.onlyAcceptYesOrNo')
                }).then(async ({ value }) => {
                    if ("yes" == value.toLowerCase()) {
                        //try {
                        let result = await self.$ajax({
                            type: "DELETE",
                            url: `api/cinderv3/v3/${pid}/volumes/${volumeId}?clear=True`,
                            showErrMsg: true,
                            headers: {
                                "OpenStack-API-Version": "volume 3.52"
                            },
                            log: {
                                description: {
                                    en: "Send Safe-Delete volume " + volumeName,
                                    zh_cn: "发送安全删除云硬盘" + volumeName
                                },
                                target: Vue.logTarget.storage_volume
                            }
                        });
                        self.$message(self.$t('calcStorLang.safeDeleteMsg'));
                        self.$refs.volumeTable.clearSelection();
                        setTimeout(function () {
                            self.loadData(self.queryParams);
                            self.loading = false;
                        }, 2000);
                        // } catch (res) {
                        // }
                    }
                }).catch(() => {
                    //取消
                });
            }.bind(this)
        },
        {
            icon: "fa-clone",
            name: this.$t("storage.transfer"), //转让
            showflg: !this.isAdmin(),
            operateMore: true,
            enable(rowData) {
                return rowData["status"] == "available" && rowData["migration_status"] + "" != "migrating";
            },
            handler: function (selectRows) {
                let me = this;
                me.transferVolumeFlg = true;
                me.vId = selectRows[0].id;
                me.vStatus = selectRows[0].status;
                me.$nextTick(() => {
                    me.$refs.transferVolume.volumeName = selectRows[0].name;
                    me.$refs.transferVolume.show();
                });
                // }
            }.bind(this)
        },
        {
            icon: "fa-plus",
            name: this.$t("storage.acceptTransfer"), //接受转让
            showflg: !this.isAdmin(),
            operateMore: true,
            nonSelected: true,
            handler: function (selectRows) {
                let me = this;
                me.acctransferVolumeFlg = true;
            }.bind(this)
        },
        {
            icon: "fa-clone",
            name: this.$t("storage.cancleTransfer"), //取消转让
            showflg: !this.isAdmin(),
            operateMore: true,
            enable(rowData) {
                return rowData["status"] == "awaiting-transfer" && rowData["migration_status"] + "" != "migrating";
            },
            handler: function (selectRows) {
                let me = this;
                //me.addVolumeBakFlg = true;
                me.deleteVolumeTransfer(selectRows[0]);
            }.bind(this)
        },
        {
            icon: "fa-plus",
            name: this.$t("storage.cloneVolume"), //克隆云硬盘
            // showflg: this.isUser(),
            showflg: false,
            operateMore: true,
            multi: false,
            enable(rowData) {
                return (
                    rowData["status"] + "" == "available" ||
                    rowData["status"] + "" == "in-use"
                );
            },
            handler: function (selectRows) {
                let me = this;
                // if ( selectRows[0].encrypted||selectRows[0].multiattach) {
                //     me.$message.warning(Vue.t("storage.notAllowedMultiattachClone"));
                //     return false
                // }
                me.cloneVolumeFlg = true;
                me.volumeInfo = selectRows[0];
                me.$nextTick(() => {
                    me.$refs.cloneVolume.show();
                });
            }.bind(this)
        },
        {
            icon: "fa-clone",
            name: this.$t("storage.volumeManagment"), //云硬盘纳管
            showflg: Vue.roleType == "0",
            operateMore: true,
            handler: function (selectRows) {
                this.volumeManagmentFlg = true;
            }.bind(this)
        },
        {
            icon: "fa-trash",
            name: this.$t("storage.unmanageDisk"), //移除
            multi: true,
            showflg: this.isAdmin(),
            operateMore: true,
            enable(rowData) {
                return rowData["status"] + "" == "available" || rowData["status"] + "" == "error" || rowData["status"] + "" == "error_restoring" ||
                        rowData["status"] + "" == "error_extending" || rowData["status"] + "" == "error_managing"
            },
            handler: async function (selectRows) {
                var self = this;
                let statusList = [];
                for (let i = 0; i < selectRows.length; i++) {
                    const element = selectRows[i];
                    let tempStatus = self.volumeStatusRender(selectRows[i]["status"], selectRows[i]);
                    if (!statusList.includes(tempStatus)) {
                        statusList.push(tempStatus);
                    }
                }
                statusList = statusList.join("/");
                let pid = this.$cookie.get('pid');
                let content = `${self.$t('storage.forceDeleteVolumeMsg', [statusList])}${this.$t('lang.inputYesToContinue')}`;
                let body = {
                    "os-unmanage": {}
                };
                body = JSON.stringify(body);
                self.$prompt(
                    content,
                    this.$t("lang.confirm"),
                    {
                        confirmButtonText: this.$t("lang.confirm"),
                        cancelButtonText: this.$t("lang.cancel"),
                        inputPattern: /^YES$|^NO$/i,
                        inputValue: "NO",
                        customClass: "promptConfirmDel",
                        inputErrorMessage: this.$t("lang.onlyAcceptYesOrNo")
                    }
                ).then(async ({ value }) => {
                    if ("yes" == value.toLowerCase()) {
                        self.$sequence({
                            type: "post",
                            url: `api/cinderv3/v3/${pid}/volumes/{id}/action`,
                            data: body,
                            params: selectRows,
                            log: {
                                description: {
                                    en: "unmanage volume {name}({id})",
                                    zh_cn: "移除云硬盘{name}({id})"
                                },
                                target: Vue.logTarget.storage_volume
                            },
                            successFun: function () {
                                for (var r = 0; r < selectRows.length; r++) {
                                    var row = selectRows[r];
                                    var volume = self.volumeMaps.get(row.id);
                                    row['status'] = 'unmanaging';
                                    volume["status"] = "unmanaging";
                                }
                                self.loading = true;
                                self.$refs.volumeTable.clearSelection();
                                self.currentPage = 1;
                                setTimeout(function () {
                                    self.loadData(self.queryParams);
                                    self.loading = false;
                                }, 5000);
                            }
                            // successMsg: "删除发送成功",
                        }).then(data => {
                            self.$message(Vue.t("storage.sendUnmanageSuccess"));
                        }).catch(err => { });
                    }
                }).catch(() => {
                    //取消
                });
            }.bind(this)
        },
        {
            icon: "fa-plus",
            name: this.$t("storage.manageQosSpec"), // QoS规格
            showflg: this.isUser(),
            operateMore: true,
            multi: false,
            enable(rowData) {
                return (
                    rowData["status"] + "" == "available" ||
                    rowData["status"] + "" == "in-use"
                );
            },
            handler: function (selectRows) {
                let $self = this;
                $self.qosVolumeFlg = true;
                $self.volumeInfo = selectRows[0];
            }.bind(this)
        }
    ];
}
