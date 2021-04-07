<template>
<div>
  <div style="line-height: 26px;height:26px;font-size: 14px;">{{$t('base.passwordStrategyInfo')}}</div>
  <el-form ref="passwordStrategyForm" label-width="230px" :model="passObj" v-loading="loading" :element-loading-text="$t('base.loadingData')">
    <el-form-item :label="$t('base.minStr')" class="is-required" prop="minChar">
      <el-input style="width:200px" auto-complete="off" @change="minChangeFun" @blur="minBlurFun" v-model="passObj.minChar"></el-input>
      <span>
        <el-tooltip effect="dark" :content="$t('base.passwordEnterWarn')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </span>
    </el-form-item>
    <el-form-item :label="$t('base.maxStr')" class="is-required" prop="maxChar">
      <el-input style="width:200px" auto-complete="off" @change="maxChangeFun" @blur="maxBlurFun" v-model="passObj.maxChar"></el-input>
      <span>
        <el-tooltip effect="dark" :content="$t('base.passwordEnterWarn')">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </span>
    </el-form-item>
    <el-form-item :label="$t('base.ifHasSpeChar')">
      <el-radio-group v-model="passObj.special_character">
        <el-radio :label="1">{{$t('base.yes')}}</el-radio>
        <el-radio :label="0">{{$t('base.no')}}</el-radio>
      </el-radio-group>
      <span style="margin-left: 20px;">
        <el-tooltip effect="dark" :content="$t('base.speCharContain')+':!@#$%^&*?_'">
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </span>
    </el-form-item>
    <el-form-item :label="$t('base.ifContainUserName')">
      <el-radio-group v-model="passObj.asc_or_desc_user">
        <el-radio :label="1">{{$t('base.yes')}}</el-radio>
        <el-radio :label="0">{{$t('base.no')}}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item class="is-required">
      <el-button type="primary" size="small" @click="confirmFun">{{$t('base.confirm')}}</el-button>
    </el-form-item>
  </el-form>
</div>
</template>
<script>
export default {
  name:"passwordStrategy",
  data() {
    return {
      loading:false,
      passObj:{
        minChar:5,
        minBak:5,
        maxChar:30,
        maxBak:30,
        special_character:0,
        asc_or_desc_user:0
      },
      arr:[]
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      let me = this;
      this.loading = true;
      await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/system/config/password-strategy",
        successFun(data) {
          let obj = data.strategy;
          me.passObj.minChar = obj.min_characters;
          me.passObj.minBak = obj.min_characters;
          me.passObj.maxChar = obj.max_characters;
          me.passObj.maxBak = obj.max_characters;
          me.passObj.special_character = obj.special_character;
          me.passObj.asc_or_desc_user = obj.asc_or_desc_user;
        }
      })
      this.loading = false;
    },
    minBlurFun() {
      let val = arguments[0].target.value;
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.checkMin(val);
    },
    minChangeFun(val) {
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.arr.push(setTimeout(() => {
        this.checkMin(val);
      }, 3000));
    },
    checkMin(val) {
      if (isNaN(val)) {
        this.passObj.minChar = this.passObj.minBak;
      } else {
        if (val.indexOf('.')>-1) {
          this.passObj.minChar = this.passObj.minBak;
        } else {
          if (val < 5) {
            this.passObj.minChar = 5;
          } else if (parseInt(val) > parseInt(this.passObj.maxChar)) {
            this.passObj.minChar = this.passObj.maxChar;
          }
        }
      }
      this.passObj.minBak = this.passObj.minChar;
    },
    maxBlurFun() {
      let val = arguments[0].target.value;
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.checkMax(val);
    },
    maxChangeFun(val) {
      this.arr.forEach((item) => {
        clearTimeout(item)
      })
      this.arr.push(setTimeout(() => {
        this.checkMax(val);
      }, 3000));
    },
    checkMax(val) {
      if (isNaN(val)) {
        this.passObj.maxChar = this.passObj.maxBak;
      } else {
        if (val.indexOf('.')>-1) {
          this.passObj.maxChar = this.passObj.maxBak;
        } else {
          if (val > 30) {
            this.passObj.maxChar = 30;
          } else if (parseInt(val) < parseInt(this.passObj.minChar)) {
            this.passObj.maxChar = this.passObj.minChar;
          }
        }
      }
      this.passObj.maxBak = this.passObj.maxChar;
    },
    confirmFun() {
      let me = this;
      this.loading = true;
      this.$ajax({
        type: 'post',
        url: "api/keystone/v3/inspur/system/config/password-strategy",
        data:JSON.stringify({
          "strategy":{
            "min_characters": parseInt(me.passObj.minChar),
            "max_characters": parseInt(me.passObj.maxChar),
            "special_character": parseInt(me.passObj.special_character),
            "asc_or_desc_user":parseInt(me.passObj.asc_or_desc_user)
          }
        }),
        log:{
          description:{
            en:"password strategy update",
            zh_cn:"密码策略修改"
          },
          target:Vue.logTarget.parameterSetting
        },
        successMsg:Vue.t('base.saveSuccess'),
        successFun() {
          me.loading = false;
        }
      })
    }
  }
}
</script>
