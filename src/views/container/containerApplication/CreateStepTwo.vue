<template>
<div>
  <el-form class="margin-tb20 me-require-form" ref="teamlistForm" :model="teamlistForm" label-width="100px" v-show="addFormVisable">
    <el-form-item :label="$t('container.containerTeamList')"  class="is-required">
      <el-button @click="handleAddClick()" type="primary" icon='plus' size="small" style="padding-bottom:5px;">{{$t('opt.add')}}</el-button>
      <el-table ref="containerTeamLis" 
        :data="containerTeamListData" 
        highlight-current-row stripe border
        row-key="id" 
        @row-click="rowClick">
        <el-table-column prop="name" :label="$t('container.containerTeamName')" show-overflow-tooltip align="left" min-width="100">
        </el-table-column>
        <el-table-column prop="image" :label="$t('base.image')" show-overflow-tooltip align="left" min-width="200">
        </el-table-column>
        <el-table-column prop="operate" :label="$t('base.operating')" show-overflow-tooltip align="left" min-width="120">
          <template slot-scope="scope">
            <el-button @click="handleEditClick(scope.row)" type="text" size="small">{{$t('base.edit')}}</el-button>
            <el-button @click="handleDeleteClick(scope.row)" type="text" size="small">{{$t('base.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </el-form>
  <el-card class="box-card" v-show="!addFormVisable">
    <div slot="header" class="clearfix">
      <span>{{$t('container.addContainer')}}</span>
    </div>
    <el-form class="margin-tb20 me-require-form" ref="createInstanceForm" :model="createInstanceForm" :rules=rules label-width="100px" :loading="loading">
      <el-form-item :label="$t('container.containerTeamName')" prop="name" class="is-required">
        <el-input class="col-12" v-model="createInstanceForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.image')" prop="image" class="is-required">
        <el-select class="col-12" v-model="createInstanceForm.image" @change="imageListChange" filterable>
          <el-option v-for="item in imageListOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('container.version')" prop="tag" class="is-required">
        <el-select class="col-12" v-model="createInstanceForm.tag" @change="tagListChange">
          <el-option v-for="item in tagListOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="CPU" prop="cpu" class="is-required">
        <el-select v-model="createInstanceForm.cpu" class="col-8" filterable>
          <el-option label="0.1" value="0.1"></el-option>
          <el-option label="0.2" value="0.2"></el-option>
          <el-option label="0.3" value="0.3"></el-option>
          <el-option label="0.4" value="0.4"></el-option>
          <el-option label="0.5" value="0.5"></el-option>
          <el-option label="0.6" value="0.6"></el-option>
          <el-option label="0.7" value="0.7"></el-option>
          <el-option label="0.8" value="0.8"></el-option>
          <el-option label="0.9" value="0.9"></el-option>
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
          <el-option label="4" value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('lang.memory')" prop="memory_t" class="is-required">
        <el-input v-model="createInstanceForm.memory_t" class="col-8" v-if="unitMem=='G'"></el-input>
        <el-select v-model="createInstanceForm.memory_t" class="col-8" v-if="unitMem=='M'">
          <el-option label="128" value="128"></el-option>
          <el-option label="256" value="256"></el-option>
          <el-option label="512" value="512"></el-option>
        </el-select>
        <el-select v-model="unitMem" class="col-4" @change="unitMemChange">
          <el-option label="GB" value="G"></el-option>
          <el-option label="MB" value="M"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('calcStorLang.high')">
        <el-switch v-model="advanceSet" on-text="" off-text=""></el-switch>
      </el-form-item>
      <!--环境变量 -->
      <el-form-item :label="$t('container.environmentParam')" v-show="advanceSet">
        <el-col class="col-8">
          <el-form-item prop="envName">
            <el-input v-model="createInstanceForm.envName" :placeholder="$t('container.key')" @change="checkEnvName"></el-input>
            <div class="el-form-item__error" id="env-name-exist-error" hidden>{{$t('container.keyExistError')}}</div>
            <div class="el-form-item__error" id="env-key-error" hidden>{{$t('container.required')}}</div>
            <div class="el-form-item__error" id="env-exit-error" hidden>{{$t('validation.containerApplicationEnvRule')}}</div>
            <div class="el-form-item__error" id="env-key-max-error" hidden>{{$t('container.maxis')}}100</div>
          </el-form-item>
        </el-col>
        <el-col class="col-8" style="padding-left:5px;">
          <el-form-item prop="envValue">
            <el-input v-model="createInstanceForm.envValue" :placeholder="$t('container.value')" @change="checkEnvValue"></el-input>
            <div class="el-form-item__error" id="env-value-error" hidden>{{$t('container.required')}}</div>
            <div class="el-form-item__error" id="env--value-max-error" hidden>{{$t('container.maxis')}}2000</div>
          </el-form-item>
        </el-col>
        <el-col class="col-3" style="padding-left:5px;">
          <el-form-item>
            <el-button type="primary" icon='fa-plus' size="small" @click="addEnvironmentParam()">{{$t('container.add')}}</el-button>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item style="width: 620px; max-height: 250px;overflow-y:auto;overflow-x:hidden;padding-top:6px;" v-show="advanceSet">
        <el-table ref="environmentTable" :data="environmentTableData" highlight-current-row stripe border row-key="id">
          <el-table-column prop="envName" :label="$t('container.key')" align="left" show-overflow-tooltip min-width="200"></el-table-column>
          <el-table-column prop="envValue" :label="$t('container.value')" align="left" show-overflow-tooltip min-width="200"></el-table-column>
          <el-table-column prop="operate" :label="$t('container.operate')" align="left" show-overflow-tooltip min-width="70">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="removeEnvironmentRow(scope.row)">{{$t('lang.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <!-- 命令与参数 -->
      <el-form-item :label="$t('container.command')" v-show="advanceSet">
        <el-col class="col-8">
          <el-form-item prop="commandValue">
            <el-input v-model="createInstanceForm.commandValue" @change="checkCommandValue"></el-input>
            <div class="el-form-item__error" id="command-value-error" hidden>{{$t('container.required')}}</div>
            <div class="el-form-item__error" id="command-input-error" hidden>{{$t('validation.startwithLetter_NoChineseDot')}}</div>
            <div class="el-form-item__error" id="command-max-error" hidden>{{$t('container.maxis')}}100</div>
          </el-form-item>
        </el-col>  
        <el-col class="col-3" style="padding-left:5px;">
          <el-form-item>
            <el-button type="primary" icon='fa-plus' size="small" @click="addCommandValue()">{{$t('container.add')}}</el-button>
          </el-form-item>
        </el-col>
        <el-col class="col-24" style="padding-top:24px;width: 620px; max-height: 250px;overflow-y:auto;overflow-x:hidden;">
          <el-table ref="commandTable" :data="createInstanceForm.commandDomains" highlight-current-row stripe border row-key="id">
            <el-table-column prop="value" :label="$t('container.command')" align="left" show-overflow-tooltip min-width="200"></el-table-column>
            <el-table-column prop="operate" :label="$t('container.operate')" align="left" show-overflow-tooltip min-width="70">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="removeCommandRow(scope.row)">{{$t('lang.delete')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('container.parameter')" v-show="advanceSet">
        <el-col class="col-8">
          <el-form-item prop="parameterValue">
            <el-input v-model="createInstanceForm.parameterValue" @change="checkParameterValue"></el-input>
            <div class="el-form-item__error" id="parameter-value-error" hidden>{{$t('container.required')}}</div>
            <div class="el-form-item__error" id="parameter-input-error" hidden>{{$t('validation.no_Chinese')}}</div>
            <div class="el-form-item__error" id="parameter-max-error" hidden>{{$t('container.maxis')}}2000</div>
          </el-form-item>
        </el-col>  
        <el-col class="col-3" style="padding-left:5px;">
          <el-form-item>
            <el-button type="primary" icon='fa-plus' size="small" @click="addParameterValue()">{{$t('container.add')}}</el-button>
          </el-form-item>
        </el-col>
        <el-col class="col-24" style="padding-top:24px;width: 620px; max-height: 250px;overflow-y:auto;overflow-x:hidden;">
          <el-table ref="parameterTable" :data="createInstanceForm.comParaDomains" highlight-current-row stripe border row-key="id">
            <el-table-column prop="value" :label="$t('container.parameter')" align="left" show-overflow-tooltip min-width="200"></el-table-column>
            <el-table-column prop="operate" :label="$t('container.operate')" align="left" show-overflow-tooltip min-width="70">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="removeComParaDomain(scope.row)">{{$t('lang.delete')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col> 
      </el-form-item>
    </el-form>
    <div class="me-form-footer" v-if="!addFormVisable">
      <el-button @click="cancelFormClick()">{{$t('lang.cancel')}}</el-button>
      <el-button @click="addFormClick()" type="primary" >{{$t('lang.confirm')}}</el-button>
    </div>
  </el-card>
  <div class="me-form-footer" v-show="addFormVisable">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary">{{$t('lang.preStep')}}</el-button>
    <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
  </div>
</div>
</template>
<script>
  export default {
    name: "CreateInstanceStepTwo",
    props:["k8sClusterId", "insecure_registry_id", "insecure_registry"],
    data() {
      return {
        createInstanceForm: {
          pods:[],
          env: [],
          image:"",
          name:"",
          tag:"",
          cpu:"1",
          memory_t:"1",
          envName: "",
          envValue: "",
          commandDomains:[],
          comParaDomains:[],
          commandValue:'',
          parameterValue:'',
          id:0
        },
        teamlistForm:{},
        addFormVisable: false,
        containerTeamListData:[],
        containerTeamId:0,
        imageListOptions:[],
        tagListOptions:[],
        environmentTableData:[],
        environmentTableId:0,
        commandTableId:0,
        parameterTableId:0,
        unitMem:"G",
        portDatas:[],
        portList:[],
        advanceSet: false,
        loading: false,
        editable:false,
        rules: {
          name: [
            {type: 'required', trigger: 'blur change'},
            {type: 'maxSize', value: 40},
            {type: 'containerApplicationNameRule'}
          ],
          image: [
            {type: 'required', trigger: 'blur change'}
          ],
          tag: [
            {type: 'required', trigger: 'blur change'}
          ],
          memory_t: [
            {type: 'integer'},
            {type: 'required'},
            {type: 'min', value: 1},
            {type: 'max', value: 512}
          ]
        }
      }
    },
    mounted() {
    },
    methods: {
      initLabelTable() {
        this.getImageList();
        this.environmentTableData = [];
      },
      async getImageList() {
        let me = this;
        me.imageListOptions.length = 0;
        me.tagListOptions.length = 0;
        me.createInstanceForm.image = '';
        me.createInstanceForm.tag = '';
        me.loading = true;
        let allData = await me.$ajax({
          url: 'api/cetus/v1/harbor/search',
          type: 'post',
          data: JSON.stringify({
            harbor_id:me.insecure_registry_id
          })
        });
        me.loading = false;
        let dockerImageList = allData.repository;
        $(dockerImageList).each(function(i, obj) {
          me.imageListOptions.push({
            label: obj.repository_name,
            value: obj.repository_name
          });
        });
      },
      async imageListChange(val) {
        let self = this;
        self.tagListOptions.length = 0;
        self.createInstanceForm.tag = '';
        if (val == "" || self.insecure_registry_id == "") {
          return;
        }
        let tags = await self.$ajax({
          url: "api/cetus/v1/harbor/tags",
          type: 'post',
          data: JSON.stringify({
            "harbor_id": self.insecure_registry_id,
            "repository_name": val
          })
        });
        $(tags).each(function (i, obj) {
          self.tagListOptions.push({
            label: obj.name,
            value: obj.name
          });
        });
      },
      handleAddClick() {
        if (this.containerTeamListData.length >= 5) {
           this.$message.error(this.$t('container.maxteamLength'));
           return false;
        }
        this.addFormVisable = false;
        this.$refs.createInstanceForm.resetFields();
        this.advanceSet = false;
        this.createInstanceForm.commandDomains = [];
        this.createInstanceForm.comParaDomains = [];
        this.unitMem = "G";
        this.createInstanceForm.memory_t = 1;
        this.createInstanceForm.id = self.containerTeamId;
        this.editable = false;
        $('#command-value-error').hide();
        $('#env-key-error').hide();
        $('#env-value-error').hide();
        $('#parameter-value-error').hide();
        $('#env-value-error').hide();
      },
      unitMemChange(val) {
        if (val == "G") {
          this.createInstanceForm.memory_t = '1';
        } else {
          this.createInstanceForm.memory_t = '128';
        }
      },
      cancelFormClick() {
        // this.addFormClick();
        this.addFormVisable = true;
        this.editable = false;
      },
      addFormClick() {
        let self = this;
        if (self.editable == true) {
          const test = this.containerTeamListData.filter(item => item.id !== self.createInstanceForm.id);
          this.containerTeamListData.length = 0;
          this.containerTeamListData.push.apply(this.containerTeamListData, test);
        }
        for (let i=0; i<self.containerTeamListData.length; i++) {
          let temp1 = self.containerTeamListData[i];
          if (temp1["name"] == self.createInstanceForm.name) {
            self.$message.error(self.$t('container.containerTeanNameCheck'));
            return false;
          }
        }
        self.$refs.createInstanceForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          let tempData = {};
          let commands = [];
          $(this.createInstanceForm.commandDomains).each(function(i, obj) {
            commands.push(obj.value);
          });
          let commandargs = [];
          $(this.createInstanceForm.comParaDomains).each(function(i, obj) {
            commandargs.push(obj.value);
          });
          let env = [];
          for (let i=0; i<self.environmentTableData.length; i++) {
            let obj = self.environmentTableData[i];
            env.push({
              'name': obj.envName,
              'value': obj.envValue
            });
          }
          tempData['env'] = env;
          tempData['image'] = self.insecure_registry + "/" + self.createInstanceForm.image + ":" + self.createInstanceForm.tag;
          tempData['name'] = self.createInstanceForm.name;
          tempData['command'] = commands;
          tempData['args'] = commandargs;
          let resource = {
            "limits": {
              "cpu": self.createInstanceForm.cpu,
              "memory": self.createInstanceForm.memory_t + self.unitMem
            }
          };
          tempData["resources"] = resource;
          if (self.editable == false) {
            self.containerTeamId++;
            tempData["id"] = self.containerTeamId;
          } else {
            tempData["id"] = self.createInstanceForm.id;
          }
          tempData['oldcreateInstanceForm'] = JSON.stringify(self.createInstanceForm);
          tempData['ports'] = self.portList;
          self.containerTeamListData.push(tempData);
          self.addFormVisable = true;
        });
      },
      handleEditClick(row) {
        let self = this;
        self.addFormVisable = false;
        self.createInstanceForm = JSON.parse(row.oldcreateInstanceForm);
        self.editable = true;
        self.createInstanceForm.id = row["id"];
      },
      handleDeleteClick(row) {
        this.containerTeamId--;
        const test = this.containerTeamListData.filter(item => item.id !== row['id']);
        this.containerTeamListData.length = 0;
        this.containerTeamListData.push.apply(this.containerTeamListData, test);
      },
      tagListChange(value) {
        if (value) {
          this.getMetaData();
        }
      },
      async getMetaData() {
        let self = this;
        await self.$ajax({
          url: "api/cetus/v1/harbor/manifest",
          type: 'post',
          data: JSON.stringify({
            "harbor_id": self.insecure_registry_id,
            "repository_name": self.createInstanceForm.image,
            "tag_name":self.createInstanceForm.tag
          }),
          successFun:(response) => {
            let configData = JSON.parse(response.config);
            let envDatas = configData.config.Env;
            self.environmentTableData = [];
            if (envDatas.length > 0) {
              envDatas.forEach((data) => {
                let env = data.split("=");
                self.environmentTableId++;
                self.environmentTableData.push({
                  id:self.environmentTableId, envName:env[0], envValue:env[1], operate:""
                });
              });
            }
            let portDatas = configData.config.ExposedPorts;
            let portDataList = [];
            if (portDatas != null && typeof (portDatas) == "object") {
              for (let port in portDatas) {
                let p = port.split("/");
                portDataList.push({
                  containerPort: parseInt(p[0]),
                  protocol:p[1].toUpperCase()
                });
              }
            }
            self.portList = portDataList;
          }
        });
      },
      checkEnvName(val) {
        $('#env-name-exist-error').hide();
        $('#env-key-error').hide();
        $('#env-exit-error').hide();
        $("#env-key-max-error").hide();
        let reg = /^[a-zA-Z_]+([0-9a-zA-Z_]*[a-zA-Z_]+)?$/;
        if (val != "") {
          let flg = true;
          for (let i = 0; i < this.environmentTableData.length; i++ ) {
            if (val == this.environmentTableData[i].envName) {
              $('#env-name-exist-error').show();
              flg = false;
              return false;
            }
          }
          if (flg) {
            if (!reg.test(val) ) {
              $('#env-exit-error').show();
              return false;
             } else {
               if (val.length > 100) {
                 $("#env-key-max-error").show();
                 return false;
               }
             }
          }
        } else {
          $('#env-key-error').show();
          return false;
        }
        return true;
      },
      checkEnvValue(val) {
        $("#env-value-max-error").hide();
        $('#env-value-error').hide();
        if (val != '') {
          if (val.length > 2000) {
            $("#env-value-max-error").show();
            return false;
          }
        } else {
          $('#env-value-error').show();
          return false;
        }
        return true;
      },
      addEnvironmentParam() {
        if (!this.checkEnvValue(this.createInstanceForm.envValue)) {
          return false;
        }
        if (!this.checkEnvName(this.createInstanceForm.envName)) {
          return false;
        }
        this.environmentTableId++;
        let envName = this.createInstanceForm.envName;
        let envValue = this.createInstanceForm.envValue;
        this.environmentTableData.push({
          id:this.environmentTableId, envName:envName, envValue:envValue, operate:""
        });
        this.createInstanceForm.envName = "";
        this.createInstanceForm.envValue = "";
      },
      removeEnvironmentRow(row) {
        this.environmentTableId--;
        const test = this.environmentTableData.filter(item => item.id !== row['id']);
        this.environmentTableData.length = 0;
        this.environmentTableData.push.apply(this.environmentTableData, test);
        this.checkEnvValue(this.createInstanceForm.envValue);
        this.checkEnvName(this.createInstanceForm.envName)
      },
      checkCommandValue(val) {
        $('#command-input-error').hide();
        $('#command-value-error').hide();
        $('#command-max-error').hide();
        let reg = /^[A-Za-z]+[-_A-Za-z0-9]*$/;
        if (val != '') {
          if (!reg.test(val)) {
            $('#command-input-error').show();
            return false;
          } else {
            if (val.length > 100) {
               $('#command-max-error').show();
               return false;
            }
          }
        } else {
          $('#command-value-error').show();
          return false;
        }
        return true;
      },
      addCommandValue() {
        if (!this.checkCommandValue(this.createInstanceForm.commandValue)) {
          return false;
        }
        this.commandTableId++;
        this.createInstanceForm.commandDomains.push({
          id:this.commandTableId, value:this.createInstanceForm.commandValue, key:Date.now(), operate:""
        });
        this.createInstanceForm.commandValue = "";
      },
      removeCommandRow(row) {
        this.commandTableId--;
        const test = this.createInstanceForm.commandDomains.filter(item => item.id !== row['id']);
        this.createInstanceForm.commandDomains.length = 0;
        this.createInstanceForm.commandDomains.push.apply(this.createInstanceForm.commandDomains, test);
      },
      checkParameterValue(val) {
        $('#parameter-value-error').hide();
        $('#parameter-input-error').hide();
        $('#parameter-max-error').hide();
        if (val != '') {
          let reg = /[\u4e00-\u9fa5]/;
          if (reg.test(val+"")) {
            $('#parameter-input-error').show();
            return false;
          } else {
            if (val.length > 2000) {
               $('#parameter-max-error').show();
               return false;
            }
          }
        } else {
          $('#parameter-value-error').show();
          return false;
        }
        return true;
      },
      addParameterValue() {
        if (!this.checkParameterValue(this.createInstanceForm.parameterValue)) {
          return false;
        }
        this.parameterTableId++;
        this.createInstanceForm.comParaDomains.push({
          id:this.parameterTableId, value:this.createInstanceForm.parameterValue, key:Date.now(), operate:""
        });
        this.createInstanceForm.parameterValue = "";
      },
      removeComParaDomain(row) {
        this.parameterTableId--;
        const test = this.createInstanceForm.comParaDomains.filter(item => item.id !== row['id']);
        this.createInstanceForm.comParaDomains.length = 0;
        this.createInstanceForm.comParaDomains.push.apply(this.createInstanceForm.comParaDomains, test);
      },
      rowClick(row) {
        this.$refs.containerTeamLis.toggleRowSelection(row);
      },
      removeSame(arr) {
        for (let i=0; i<arr.length; i++) {
          for (let j=i+1; j<arr.length; j++) {
            if (arr[i] == arr[j]) {
              arr.splice(j, 1);
              j--;
            }
          }
        }
        return arr;
      },
      cancel() {
        this.$emit("cancel");
      },
      prevStep() {
        this.$emit("prevStep", 0, this.createInstanceForm );
      },
      nextStep() {
        if (this.containerTeamListData.length == 0) {
          this.$message.error(Vue.$t('container.addacontainer'));
          return;
        }
        this.portDatas = [];
        for (let i=0; i<this.containerTeamListData.length; i++) {
          let temp1 = this.containerTeamListData[i];
          let ports = temp1["ports"];
          for (let j=0; j<ports.length; j++) {
            this.portDatas.push(ports[j]);
          }
        }
        this.portDatas = this.removeSame(this.portDatas);
        console.log(this.portDatas)
        this.createInstanceForm.pods = this.containerTeamListData;
        this.$emit("stepDone", 2, this.createInstanceForm);
      }
    }
  }
</script>
<style scoped>

</style>