export default {
  storage: {
    //---------ObjStor 文件存储部分--------------
    volumetype: "Volume Type",
    shareType: "Share Type",
    protocol: "Protocol",
    host: "host",
    createShareStorage: "Create File Storage",
    createSnapshot: "Create Snapshot",
    refreshStatus: "Update Status",
    selectStatus: "Select Status",
    resetCloudDiskMigrateStatus: "Reset Volume Migrate Status",
    create: "Create",
    updateCapability: "Update Capability",
    visitAccess: "Authority Manage",
    visitAccess2: "Authority Manage",
    editVolume: "Edit Volume",
    active: "Active",
    queuedToApply: "Queued To Apply",
    applying: "Applying",
    available: "Available",
    creating: "Creating",
    deleted: "Deleted",
    inactive: "Inactive",
    deleting: "Deleting",
    completing: "Completing",
    error: "Error",
    errorDeleting: "ErrorDeleting",
    error_deleting: "ErrorDeleting",
    errorManaging: "ErrorManaging",
    errorUnmanaging: "ErrorUnmanaging",
    unmanageDisk: "Unmanage disk",
    unmanaging: "unmanaging",
    managing: "Managing",
    manageError: "Manage Error",
    unmanageStarting: "Unmanage Starting",
    umanageError: "Umanage Error",
    unmanaged: "Unmanaged",
    extending: "Extending",
    onlineExtending: "Online Extending",
    offlineExtending: "Offline Extending",
    extendingStatus: "Extending",
    extendingError: "Extending Error",
    shrinking: "Shrinking",
    shareStorageType: "File Storage Type",
    total: "Total",
    pc: "",
    used: "Used",
    haveUsed: "Have Used",
    extendingInfo: "Total {0}GB,Used {1}GB,reserved {2}GB, Surplus {3}GB.",
    capability: "Capability",
    capabilityGB: "Capacity(GB)",
    number: "Number",
    infinite: "Infinite",
    publicVisit: "Public Visit",
    origin: "Origin",
    shareStorageSnapshot: "File Storage Snapshot",
    freeNumNotEnough: "Free number not enough!",
    freeCapabilityNotEnough: "Free capability not enough!",
    addshareStorageSuccess: "Send add File Storage success.",
    originSnapshotCannotBeNull: "Origin snapshot can not be null!",
    shareStoragecapabilityLessThanTheSizeOfSnapshot: "File Storage capability less than the size of snapshot!",
    access: "Access",
    spec: "Spec",
    public: "Public",
    private: "Private",
    editShareStorage: "Edit File Storage",
    editShareStorageCapability: "Edit Capability",
    createShareStorageType: "Create File Storage Type",
    shareServer: "Share Server",
    bakendnameInfo: "The value of share_backend_name in the conifg file.",
    driverHandlesShareServersConf: "Driver handles share servers params conf, dirve whether need share server.",
    supportCreateSnapshot: "Support create snapshot.",
    supportSnapshotCreateShareStorage: "Support snapshot create File Storage.",
    extraSpecs: "Extra Specs",
    pleaseCheckExtraspecs: "Please check extraspecs",
    addshareStorageTypeSuccess: "Add File Storage type success.",
    editShareStorageType: "Edit File Storage Type",
    editshareStorageTypeSuccess: "Add File Storage type success.",
    baseProperty: "Base Property",
    protocolType: "Protocol Type",
    createdTime: "Created Time",
    owner: "Owner",
    availabilityZone: "Availability Zone",
    shareStoragePath: "File Storage Path",
    close: "Close",
    sharePath: "Share Path",
    visitControl: "Visit Control",
    level: "Level",
    accessTo: "Access To",
    snapshotName: "Name",
    sendShareStorageSnapshotSuccess: "Send File Storage snapshot success!",
    grade: "Grade",
    visitReadWriteControlSelect: "Visit read write control select.",
    visitReadWriteControlTypeSelect: "Visit read write control type select.",
    visit: "Visit",
    accessToVisitCert: "Access to visit cert,e.g IPV4 address",
    accessToVisitCert1: "Access to visit cert,e.g user name",
    readonly: "Readonly",
    readWrite: "Read write",
    sendAddVisitAccessToSuccess: "Send add visit access to success!",
    sendDeleteVisitAccessToSuccess: "Send delete visit access to success!",
    deleteDocStoreConfirmMsg: "Please make sure there are no subdirectories in the selected file store,otherwise the deletion will fall. And confirm that no virtual machine is in use,otherwise the file storage in the virtual machine will be unavailable. If you confirm to continue, please enter YES",
    //-------对象存储部分--------
    objectStorageTip: "Object storage can handle big data.",
    currentContainer: "Current Container:",
    path: "Path:",
    size: "Size",
    contentType: "Content Type",
    updatedTime: "Updated Time",
    instruction: "Instruction:",
    catalogNotSupportDetail: "Catalog not support detail",
    type: "Type",
    createCatalog: "Create Catalog",
    prefix: "Prefix",
    targetNotExist: "Target not exist",
    copy: "Copy",
    replace: "Replace",
    download: "Download",
    reply: "Reply",
    catalog: "Catalog",
    document: "Document",
    catalogsNotMoreThanFiveLayers: "Catalogs in container not more than 5 layers!",
    thereHasSameNameCatalog: "There has same name catalog in this containner!",
    createCatalogSuccess: "Create catalog success!",
    thereHasSameNameContainer: "Create Catalog Success!",
    createContainerSuccess: "Create Container Success!",
    copyObj: "Copy Obj",
    carefulOperation: "Careful operation!",
    carefulOperation1: "Careful operation!",
    desContainer: "Des Container",
    desCatalog: "Des Catalog",
    copyObjSuccess: "Copy obj success",
    chooseCatalog: "Choose Catalog",
    pleaseChooseOneCatalog: "Please choose one catalog",
    replaceObj: "Replace Object",
    draftObjOr: "Draft Object or",
    clickUpload: "Click Upload",
    onlyUploadOneAndSizeLessthanFiveG: "Only upload one and size less than 5 G in Google,size less than 4 G in IE",
    replaceObjSuccess: "Replace obj success!",
    notAllowUploadMorethanOneObj: "Not allow upload more than one obj!",
    sizeMorethanFiveG: "Size more than 5 G!",
    uploadDocument: "Upload Document",
    uploadObjSuccess: "Upload object success!",
    thereHasSameNameObj: "There has same name object!",
    thereHasSameNameObjInContainer: "There has same name object in container!",
    //--------云硬盘------
    volumeZone: "Available Zone",
    acceptTransfer: "Accept Transfer",
    transferID: "Transfer ID",
    attestationkey: "Witness key",
    acceptDiskSuccess: "Accept Disk Success",
    createvolumeBak: "Create Backup",
    volumeBakOnlyAvailInUse: "Only available or in-use block storage can backup",
    bakType: "Backup Type",
    allBackup: "All Backup",
    increaseBackup: "Increase Backup",
    inBakMustAfterAllBak: `When the same volume creates an incremental backup for the first time, it will become a full backup, and the subsequent incremental backup types will not change. When ceph is the backup backend, only the rbd volume supports incremental backup, and other storage backend volume created backups are automatically converted to full backups.`,
    hostDescriptionFst: "1.Full backup and first incremental backup can specify any host.",
    hostDescriptionSnd: "2.For non first incremental backup,the backup host must be consistent with the host used for the first time.",
    capabilityNotEnough: "Capability not enough!",
    numNotEnough: "Num not enough!",
    sendCreateVolBakSuccess: "Send Create Backup Success!",
    canNotExeBak: "Can not exe backup",
    confirmBakStatus: "Confirm Backup Status",
    createVolType: "Create Volume Type",
    safeDelete: "safe delete",
    yes: "Yes",
    no: "No",
    createVolTypeSuccess: "Create volume type success!",
    applyVol: "Apply Volume",
    volName: "Volume Name",
    volSnapshot: "Volume Snapshot",
    image: "Image",
    instanceSolt: "Instance Snapshot",
    instanceSoltNotAllowNull: "InstanceSolt not allow null!",
    volCapaLessThaninstanceSolt: "Volume capability less than instanceSolt!",
    volSizeMoreThanTeninstanceSoltSize: "Volume size more than ten instanceSolt size.",
    volSizeAdvise: "Volume size advise!",
    volume: "Volume",
    region: "Available Zone",
    volDesc: "Volume Desc",
    new: "New",
    snapshot: "Snapshot",
    getFailed: "Capability must be init!",
    capaMustBeInit: "Capability must be init",
    sendApplyVolSuccess: "Send apply volume success!",
    volCapaLessThanShot: "Volume Capability less than shot!",
    imageNotAllowNull: "Image not allow null!",
    volCapaLessThanimage: "Volume capability less than image!",
    originVolNotAllowNull: "Origin volume not allow null!",
    volCapaLessThanOriginVol: "Volume Capability less than origin volume!",
    createQosSpec: "Create Qos Spec",
    createQosSpecSuccess: "Create qos spec success!",
    createExtendSpec: "Create Extend Spec",
    key: "Key",
    value: "Value",
    createFailed: "Create Failed!",
    updateVolType: "Update Volume Type",
    updateVolTypeSuccess: "Update volume type success!",
    editExtendSpec: "Edit Extend Spec",
    deleteExtengSpecConfirm: "Delete extend spec confirm?",
    sendDeleteSuccess: "Send delete success",
    editFailed: "Edit Failed!",
    sendUnmanageSuccess: "Send unmanage success",
    manageConnection: "Manage Connection",
    manageConnectDeleteConfirm: "When dismounting thie cloud disk,please ensure that the service has stopped and the directory has been unmounted,otherwise the mounted directory will be unavailabe",
    descoludInstance: "Des Cloud Instance",
    connection: "Connection",
    instanceId: "Instance Id",
    instance: "Instance",
    device: "Device",
    operation: "Operation",
    uninstall: "Uninstall",
    selectInstance: "Select Instance.",
    selectMax10Instance: "Shared volume can mount up to ten cloud hosts at a time",
    sendMountSuccess: "Send mount success.",
    sendUninstallSuccess: "Send uninstall success.",
    createVolume: "Create Volume",
    maxSizevolNumOnceCreate: "Max number of creations allowed once is 100",
    surplus: "Surplus",
    volSizeMoreThanTenimagesSize: "Volume size more than ten images size.",
    numMustBeInit: "Number must be init",
    createVolSuccess: "Create volume success!",
    userNotNull: "User can not be null!",
    projectNotNull: "Project can not be null!",
    volNameMaxSize: "Volume name max size!",
    storageShareMaxSize: "Storage Share max size!",
    quoteOptions: "Quote Options",
    ioBytesInstruction: "1~2147483647",
    ioBytesInstruction2: "IO times per second , max is 2147483647",
    ioBytesInstruction3: "bandwidth, byte，max is 2147483647",
    createQuote: "Create Quote",
    editQuote: "Edit Quote",
    createQosSpecOptionSuccess: "Create Qos spec option success!",
    createQosSpecOption: "Create Qos Spec Option",
    editeQosSpecOptionSuccess: "Edite Qos spec option success!",
    turnOnQosControlSuccess: "Turn On Qos controll success!",
    turnOffQosControlSuccess: "Turn Off Qos controll success!",
    editQosConfirm: "Modifying the QoS control switch takes effect only after it is unloaded and mounted to the virtual machine",
    colonsVal:"Only letters,numbers,underscores,connectors and colons are accepted",
    qosTooltipText: "Control whether to use cloud disk type and cloud disk QoS specification",
    mutiIncreAlert: "Batch deletion of incremental backup is not supported",
    mutiIncreAndFullAlert: "It is not supported to delete full backup and incremental backup in batch at the same time",
    editQosSpecOption: "Edit Qos Spec Option",
    optionConflict: "Option conflict!",
    deleteQosSpecCofirm: "Delete Qos spec cofirm?",
    deleteQosSpecSucceee: "Delete Qos spec succeee.",
    QosConnect: "Qos Connect",
    QosSpecConnect: "Qos Spec Connect",
    select: "Select",
    QosSpecOptionConnectConfirm: "Qos spec option connect confirm?",
    QosSpecConnectSuccee: "Qos spec connect success!",
    QosSpecConnectConfirm: "Qos spec connect confirm?",
    sendUpdateStatusSuccess: "Send update status success.",
    uninstaling: "Uninstaling",
    installing: "Installing",
    updateSuccess: "Update Success",
    volumeList: "Volume List",
    volumeType: "Volume Type",
    volumeTypeNull: "(NULL)",
    volumeBak: "Volume Backup",
    bakName: "Bak Name",
    container: "Container",
    back: "Back",
    recovery: "Restore",
    volBakWillBeUsed: "Volume backUp will be used",
    dontDelete: "Do not delete!",
    volumeIsNotExist: "Volume is not exist!",
    recoverying: "Restoring",
    recoveryError: "Restore Error",
    bakRecovery: "Backup Restore",
    checkRecoveryWay: "Restore Way",
    recoveryToNewVol: "Restore to new volume",
    recoveryToResVol: "Restore to resource volume",
    unUsedVolCanotRecovery: "UnUsed volume canot Restore!",
    sendRecoverySuccess: "Send Restore success!",
    position: "Position",
    bootable: "Bootable",
    encrypt: "Encrypt",
    connectDevice: "ConnectDevice",
    connectHost: "ConnectInstance",
    metaData: "MetaData",
    migrationing: "Migrationing",
    reserved: "Reserved",
    backUP: "Backup",
    editVol: "Edit Volume",
    editVolSuccess: "Edit Volume Success",
    editVolNameDescSuccess: "Edit Volume Name Desc Success!",
    applyExpansion: "Apply Expansion",
    capabilityNotChanged: "Capability Not Changed",
    notAllowExpansion: "Not Allow Expansion!",
    cannotSubmitExpansion: "Not Allow Expansion!",
    expansionSuccess: "Send Expansion Success",
    applyExpansionSuccess: "Send Apply Expansion Success",
    createImage: "Create Image",
    imageName: "Image Name",
    diskFormat: "Disk Format",
    operationSystem: "Operation System",
    sendApplySuccess: "Send Apply Success",
    reverting: "Reverting",
    revertSnapshot: "Revert Snapshot",
    needShutoffToContinue: "Need Shutoff ALl VM To Continue",
    migrationStatus: "Migration Status",
    connectTo: "Connect To",
    remove: "Remove",
    min1Max100: "The range of number is 1-100",
    sendRemoveSuccess: "Send Remove Success!",
    volumeManagmentMsg: "The name of the volume whitch will be managmented",
    editVolType: "Edit Volume Type",
    migration: "Migration",
    manageConnect: "Manage Connect",
    transfer: "Transfer",
    notAllowTransfer: "NotAllowTransfer",
    cancleTransfer: "CancleTransfer",
    backUping: "Backuping",
    soft_deleted: "Soft deleted",
    soft_deleting: "Soft deleting",
    if_soft_deleted_msg: "wheter to move the selected volume to Recycle-Bin",
    bakRecoverying: "Backup Restoring",
    downloadImaging: "Downloading Image",
    uploadImaging: "Uploading Image",
    waitTransfering: "Wait Transfer",
    inUsing: "In Use",
    notAllowCancleAgain: "Be transfered or canceled, not allow operate!",
    cancleTransferSuccess: "CancleTransferSuccess!",
    pleaseWaitUntilApproved: "PleaseWaitUntilApproved!",
    beginMigration: "BeginMigration",
    migrating: "Migrating",
    migratesuccess: "success",
    migratetarget: "Target",
    volMigration: "VolumeMigration",
    currentInstance: "Cur Instance",
    desInstance: "DesInstance",
    forceMigration: "Force Migration",
    connectedVolType: "Connected Volume Type",
    deleteQosSpec: "Delete Qos Spec",
    deleteQosSpecConfirm: "Delete Qos Spec Confirm?",
    deleteQosSpecSuccess: "Delete Qos Spec Success!",
    manageQosSpec: "Manage Qos Spec",
    qosControl: "QoS Controll",
    nameMaxLength: "Name Max Length!",
    sendVolSapshotSuccess: "Send VolSapshot Success!",
    createVolSnapShotConfirm: "Create Volume Snapshot Confirm?",
    transferVol: "Transfer Volume",
    identificationKey: "Identity Key",
    inputTransferName: "Input Transfer Name",
    transferVolSuccess: "Transfer Volume Success!",
    volTypeList: "Volume Type List",
    connectedQos: "Connected Qos",
    qosSpec: "Qos Spec",
    qosControll: "QoS Controll",
    createEncrypt: "Create Encrypt",
    manageExpandSpec: "Manage Expand Spec",
    connectQosConnect: "Connect Qos Connect",
    cancleQosConnection: "Cancel Qos Connection",
    refreshMetaData: "Refresh MetaData",
    cancleQosSpecConfirm: "Cancel Qos Spec Confirm?",
    cancleConnectedQosSuccess: "Cancel Connected Qos Success!",
    user: "User",
    increaseNum: "Increase Num",
    allNum: "All Num",
    null: ":Null",
    maxSizeOnevolCapa: "Max Size One volume Capability is 128TB",
    maxSizeVolCapa: "Max Szie is {0}GB.",
    shareStorage: "File Storage",
    migrationFailed: "Migration Failed",
    docStoreName: "File Storage Name",
    unableUse: "Unable Use",
    pleaseDeleteDocStorFromSnapShot: "Please delete doc storage from snapShot!",
    deleteDocStoreConfirm: "Delete file storage confirm?",
    inputNameTooLong: "Input name too long",
    restoring: "Restoring",
    editDocStoreSnapShot: "Edit File Storage Snapshot",
    editDocStoreSnapShotSuccess: "Edit file storage snapShot success!",
    editVolumeSnapShot: "Edit volume snapshot",
    editVolSnapShotSuccess: "Edit volume snapshot success!",
    snapShotId: "Snapshot Id",
    editSnapShot: "Edit Snapshot",
    pleaseDeleteVolFromSnapShot: "Please delete volume from snapShot!",
    deleteVolSnapShotConfirm: "Delete volume snapShot confirm?",
    deleteVolSnapShotSuccess: "Delete volume snapShot success.",
    nullE: ":NullE",
    createVolSnap: "Create Volume Snap",
    bakendname: "Back End Logo",
    bakend: "backend",
    removing: "Removing",
    supportCreateSnapshotN: "Support Create Snapshot",
    share_backend_name: "Backend Name",
    plsSelctNewBakendname: "Please Selct A New Bakend Name",
    create_share_from_snapshot_support: "Create Share From Snapshot Support",
    revert_to_snapshot_support: "Revert To Snapshot Support",
    mount_snapshot_support: "Mount Snapshot Support",
    snapshot_support: "Snapshot Support",
    driver_handles_share_servers: "Driver Handles Share Servers",
    supportSnapshotCreateShareStorageN: "Support Snapshot Create File Storage",
    bakendStorename: "Share Backend Name",
    driverHandlesServers: "Driver Handles Share Servers",
    unmountInstanceTip: "The cloud instance is locked and does not allow uninstallation",
    true: "True",
    false: "False",
    rootPath: "Root",
    forceDelete: "Force Delete",
    bakRecoveryError: "RecoveryError",
    backUPError: "Backup Error",
    docExpandTip: "Please contact the administrator if expand failed.",
    rootDiskDeleteTip: "Unmounting system volume when active is not allowed.",
    rootDiskDeleteTip2: "Project user unmounting system volume is not allowed.",
    rootDiskDeleteTip3: "Project user mounting system volume is not allowed.",
    updateType: "Update Type",
    retyping: "Retyping",
    dataCopying: "Datacopying",
    downloadTransferCert: "Download Transfer-Certificate",
    successCreatedExtraSpec: "Extra Sepc Created Successfully.",
    successEditedExtraSpec: "Extra Sepc Edited Successfully.",
    volumeBackendName: "volume_backend_name",
    volumeBackendNameTip: "The value of volume_backend_name in configuration file",
    multiattach: "multiattach",
    multiattachTip: "Depends on whether supported by storage",
    multiattachSupport: "<is> True",
    custom: "custom",
    customTip: "User-defined key/value pair",
    driversRsizeDesc: "Before setting the user-defined key value,please click Help-helpmanual in the upper right corner to view the reference table of user defined key value in section 3.2.3.17,and set it according to the reference table.",
    notAllowedMultiattachClone: "Cross storage replication is not supported for the source cloud disk that encrypts live shared properties.",
    forceDeleteVolSoltMsg: "The volumeslot is in {0} status. Please be cautious. ",
    forceDeleteBackupVolSoltMsg: "Deleting the cloud disk snapshot in the backup will affect the cloud disk online backup operation.Please operate with caution",
    forceDeleteVolumeMsg: "The selected cloud disk is in the {0} state, please operate with caution",
    cantExpansion: "This volume has snapshot that it can not expansion",
    doubleActiveVolMsg: "This is a is_active_active volume, it can not to online expansion or migration",
    cloneVolume: "Clone Volume",
    storageDown: "storage downed",
    volumeManagment: "Volume Managment",
    sendVolumeManagmentSuccess: "Send volume managment success",
    coloneVolumeMsg: "Because the source volume in use,so,the coloned volume data may be inconsistent",
    coloneVolumeTypeMsg: "Online snapshot is used in the process of cloning the cloud disk in use.Therefore,it is recommended to ensure that the connected virtual machine QGA is available before cloning.Otherwise,data consistency cannot be guaranteed.in addition,online cloning involves data copy,and the waiting time will be long. Do you want to continue?",
    coloneVolumeBakConfirmMsg: "The cloud disk is in use. It is recommended to ensure that the connected virtual machine QGA is available before creating a backup. Otherwise,data consisitency cannot be guaranteed. Do you want to continue?",
    selectRowVolumeSolt: "Please select a volume solt",
    volumeMigrationMsg: "Shared volume does not support online migration",
    //------S3对象存储-------
    S3_ROOT_DIR: "Root Dir",
    S3_BUCKET_NOTEMPTY_DELETE_FAILED: "The Bucket is not empty, delete failed.",
    S3_UPLOADMSG: "Only supports file upload smaller than 5GB, otherwise please use API tool",
    S3_OBJECT_UPLOAD_SUCCESS: "File upload success",
    S3_OBJECT_UPLOAD_FAILED: "File upload failed",
    S3_BUCKET_NOTEXISTED: "The bucket is not existed",
    S3_BUCKETINFO_QUERYFAILED: "Query bucket info failed",
    S3_CATALOG_LEVEL_MAX_10: "The catalog can not more than 10 levels",
    //-------云硬盘类型-加密管理-----
    encryptManage: "Encrypt Manage",
    provider: "Provider",
    controlPosition: "Control Position",
    encryptAlgorithm: "Encrypt Algorithm",
    keySize: "Key Size",
    submit: "submit",
    deleteEncryptSettingMsg: "Whether to delete the current encrypt setting",
    //-------文件存储---CIFS用户列表---
    CIFS: "CIFS",
    userName: "User Name",
    userGroup: "User Group",
    password: "Password",
    createCIFSUser: "Create CIFS User",
    createCIFSUserSuccess: "Create CIFS user success",
    createCIFSUserFailed: "Create CIFS user failed",
    editCIFSUser: "Edit CIFS User",
    editCIFSUserSuccess: "Edit CIFS user success",
    editCIFSUserFailed: "Edit CIFS user failed",
    deleteCIFSUserSuccess: "Delete CIFS user success",
    deleteCIFSUserFailed: "Delete CIFS user failed",
    CIFSUserIsExisted: "CIFS user is existed",
    max_capacity: "Max capacity(GB)",
    max_buckets: "Max buckets",
    max_objects: "Max Objects",
    bucketsSet: "Set",
    objectNums: "Object num in bucket",
    objectCapacity: "object capacity in bucket",
    bucketsPeie: "buckets config",
    currentState: "current status",
    bucketquotaTip1: "Single bucket object number cannot more than the project",
    bucketquotaTip2: "Single bucket capacity cannot more than the project",
    bucketACLSet: "ACL Set",
    commonJust: "Common authority",
    commonRead: "READ",
    tempUrlValidPeriod: "Temporary URL validity",
    generateUrl: "Generate",
    validDay: "days",
    validHour: "hours",
    validMinute: "minutes",
    validSecond: "seconds",
    tempUrl: "Temp URL",
    shareDiskNoBootable: "It is forbidden to make the shared cloud disk bootable.",
    snapAndBak: "Snap&Backup",
    FULL_CONTROL: "FULL_CONTROL",
    READWRITE: "READWRITE",
    publicUrl: "Public URL",
    // 对象存储-复制对象
    COPY_OBJECT: 'Copy',
    COPY_OBJECT_ORIGIN_OBJECT: 'Source',
    COPY_OBJECT_TARGET_BUCKET: 'Target Bucket',
    COPY_OBJECT_TARGET_DIR: 'Target Dir',
    COPY_OBJECT_FILE_NAME: 'File Name',
    COPY_OBJECT_TARGET_SAME: 'Target cannot be the same with source.',
    COPY_OBJECT_COVERAGE_CONFIRM: 'Destination path has the same file name, sure to cover?',
    COPY_OBJECT_BUCKET_QUOTA_EXCEEDED: 'Target bucket quota exceeded.',
    COPY_OBJECT_SUCCESSFULLY: 'Copy object successfully.',
    VOLUME_EXCEED_SIZE: "The disk size smaller than virtual size",
    ExceedQuota: "Exceed Quota",
    ALC_NOTE1: "Attention:READ authority will allow user visit the object in the bucket, this will be a risk, please check.",
    ALC_NOTE2: "Attention:READWRITE authority will allow anonymous visit the object in the bucket, and can delete object and upload object, and you can only delete the object from anonymous,this will be a big risk, it is not recommended, please check carefully.",
    multipartFile: "Multipart File",
    multipartName: "Fragment Name",
    uploadId: "Unload Task ID",
    makeTempUrl: "Generate temporary links",
    idDeleteMulti: "Confirm delete these fragment?",
    objectPath: "Path",
    objectUploadSize: "Parts Size",
    objectPartnum: "Part Number",
    CLONGING: "clonging",
    clone_error: "clone failed",
    mountedPath: "Mounted Path",
    moreselectInstance: "Only Select one vm",
    uninstallvm: "Unmount VM",
    mountvm: "Mount VM",
    inBakMustAfterAllBak2: "When G2 is the backup backend. Due to the limitation of G2 backup mechanism, if the volume on G2 has been backed up on G2. After the volume is expanded, the volume cannot be backed up again.",
    currSelectFile: "Select File",
    currNoSelectFile: "No File Selected",
    startpage_blockstorage: "Volume incloud cloud disk and cloud disk snapshot",
    qosNote: "if you adjust the QoS of the cloud disk in use, you need to remount it to take effect.",
    VOLUME_MUST_GREATER_THAN_MIN_DISK: 'Volume size must be greater than min disk.',
    VOLUME_REFRESH_STATUS_TIPS: 'Update volume status is mainly updated from running status to stable status.',
    RESET_VOLUME_MIGRATE_STATUS_TIPS: 'Please confirm whether the migration process is interrupted or abnormal. Please do not reset the normail migration.',
    ENCRYPT_NO_SETTINGS: 'There are currently no encryption settings',
    ENCRYPT_DESC: 'Description',
    ENCRYPT_DESC_MAIN: 'After creating encryption for a volume type, all volume using this type will be encrypted. If the current volume type is being used by the volume, you cannot add encrypted information.',
    ENCRYPT_DESC_FOR_PROVIDER: `Provider is the provider of encrypted format, currently only supports'lulks'.`,
    ENCRYPT_DESC_FOR_CONTROL_POSITION: `Control Position is suitable for specifying which service to encrypt the volume (for example: "Frontend" corresponds to Nova). Currently only "frontend" is supported.`,
    ENCRYPT_DESC_FOR_ENCRYPT_ALGORITHM: 'Encrypt Algorithm is the algorithm method used for encryption (for example: aes-xts-plain64).',
    ENCRYPT_DESC_FOR_KEY_SIZE: 'Key Size is the size of the encryption key in bits (for example: 256).',
    ENCRYPT_CONTROL_POSITION_FRONT_END: 'Front End',
    VOLUME_SOURCE_DELETED: 'This source is deleted.',
    VOLUME_SOURCE_INSTANCE_SNAPSHOT: 'Instance Snapshot',
    VOLUME_SOURCE_IMAGE: 'Image',
    VOLUME_SOURCE_VOLUME_BACKUP: 'Volume Backup',
    VOLUME_SOURCE_VOLUME: 'Volume',
    VOLUME_SOURCE_VOLUME_SNAPSHOT: 'Volume Snapshot',
    VOLUME_SOURCE_NAME: 'Name',
    VOLUME_SOURCE_SIZE: 'Size',
    VOLUME_SOURCE_STATUS: 'Status',
    VOLUME_SOURCE_CREATE_AT: 'Create Time',
    VOLUME_SOURCE_TYPE: 'Type',
    VOLUME_SOURCE_BOOTABLE: 'Bootable',
    VOLUME_SOURCE_AVAILABILITY_ZONE: 'Availablity Zone',
    VOLUME_SOURCE_IMAGE_ID: 'Image ID',
    VOLUME_SOURCE_IMAGE_NAME: 'Image Name',
    VOLUME_SOURCE_IMAGE_MIN_DISK: 'Image Min Disk',
    VOLUME_SOURCE_IMAGE_MIN_RAM: 'Image Min Memory',
    VOLUME_SOURCE_OS_DISTRO: 'OS Distro',
    VOLUME_SOURCE_OS_TYPE: 'OS Type',
    VOLUME_SOURCE_IMAGE_SIZE: 'Image Size',
    VOLUME_SOURCE_IMAGE_FORMAT: 'Image Format',
    VOLUME_SOURCE_IMAGE_DESCRIPTION: 'Description',
    VOLUME_SOURCE_IMAGE_MD5: 'MD5',
    VOLUME_SOURCE_INSTANCE_ID: 'Instance ID',
    VOLUME_SOURCE_INSTANCE_NAME: 'Instance Name',
    VOLUME_SOURCE_INSTANCE_SNAPSHOT_SIZE: 'Instance Snapshot Size',
    VOLUME_SOURCE_MIN_DISK: 'Min Disk',
    VOLUME_SOURCE_MIN_RAM: 'Min Memory',
    CIFS_NEW_USER_DESC: 'Description',
    CIFS_NEW_USER_USERNAME: 'User Name',
    CIFS_NEW_USER_USERNAME_DESC: `Consists of two parts: the default prefix and the custom name. The default prefix is'icos_'.`,
    CIFS_NEW_USER_OTHER_DESC: `The custom part rules are 1-16 characters, which can contain English alphabet and numbers.`,
    backToFirst: "Back to First",
    nextPage: "Next",
    TYPE_CHANGE_NOTE: "Unencrypted cloud disk unsupport select encrypted type to migration",
    TYPE_UNCHANGE: "UnChange cloud disk type!",
    partsUpload: "Upload from break"
  }
}