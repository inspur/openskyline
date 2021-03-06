export default {
  db: {
    databaseService:"Database Service",
    databaseServiceDesc:"Before using database services, please upload the mirror first and register the databse type and version." +
        "After the database instance is created, you must bind the floating IP to access.",
    detail:"Detail",
    database:"Database",
    user:"User",
    databaseType:"Type",
    databaseVersion:"Version",
    flavor:"Flavor",
    hardDisk:"Hard disk",
    diskSizeGB:"Disk Size(GB)",
    createDatabaseInstance:"Create Database Instance",
    createDatabase:"Create Database",
    modifyFlavor:"Modify Flavor",
    modifyHardDisk:"Modify Cloud Disk Size",
    deleteDatabaseInstanceConfirmMsg:"Confirm to delete database instance? Input YES to continue.",
    cores:"cores",
    memory:"memory",
    deleteSuccess:"Delete successfully",
    creating:"Creating",
    error:"Error",
    active:"Active",
    shutdown:"Shutdown",
    resize:"Resizing",
    basicInfo:"Basic Information",
    initDatabase:"Init Database",
    startCreateInstance:"Start to create instance",
    availabilityZone:"Availability Zone",
    hardDiskType:"Cloud Disk Type",
    network:"Network",
    networkDesc:"When select a internal network, please make sure it connects with external network.",
    databaseName:"Database Name",
    userNameDesc:'mongodb user name must be in the form of "database.username",' +
        '<br/>Others just use the form of "username". This user must be authorized.',
    userNameErrorMsg:'mongodb user name must be in the form of "database.username"',
    hostDesc:"Input host ip that have access to database. All hosts have access if not set.<br/>" +
    "When selecting IP, please input full IP address, when selecting the IP segment, input the 192.168.1 format.",
    characterSet:"Character set",
    sortRule:"Collection",
    createSuccess:"Create successfully",
    currentFlavor:"Current Flavor",
    modifySuccess:"Modify successfully",
    currentDiskSize:"Current Disk Size(GB)",
    authorizedDatabase:"Authorized Database",
    createUser:"Create User",
    authorize:"Authorize",
    unauthorize:"Unauthorize",
    unauthorizeUser:"Unauthorize",
    selectDatabase:"Select Database",
    operation:"Operation",
    selectDatabaseErrorMsg:"Please select at least one database",
    authorizeSuccessMsg:"Authorize successfully",
    unauthorizeSuccessMsg:"Unauthorize successfully",
    deleteRequestSuccessMsg:"Delete request send successfully",
    modifyRequestSuccessMsg:"Modify request send successfully",
    userExistError:"User is already exist",
    ipRange:"IP Segment",
    mongodbHostDesc:"mongo database host is *,editing is not allowed",
    redisInitDesc:"When the database type is redis, you do not need to initialize the database.Please click Finish.",
    reservedKeyMsg:"{0} is reserved words and not allowed to be used ad a databese name"
  }
};
