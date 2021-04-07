<template>
  <tr class="odd heatDetail">
    <th class="idatath" style="width:20%">{{$t('heat.' + k)}}</th>
    <td class="idatatd" style="width:80%" v-if="!(k === 'heat_admin_pass' || k === 'admin_pass')">
      <el-input v-model="val" :disabled="true"></el-input>
    </td>
    <td class="idatatd" style="width:80%" v-if="k === 'heat_admin_pass' || k === 'admin_pass'">
      <el-input v-model="val" :type="inputTytpe" :disabled="true"></el-input>
      <span v-if="k === 'heat_admin_pass' || k === 'admin_pass'" @click="showPwd" :class="[showPwdFlag ? eye : eyeSlash]"></span>
    </td>
  </tr>
</template>
<script>
import * as d3 from "d3";
import topoIcons from "../../../../static/topoImages/topoIcons.png";
import topoIconsDark from "../../../../static/topoImages/topoIconsDark.png";
import topoIconsEn from "../../../../static/topoImages/topoIconsEn.png";
import topoIconsDarkEn from "../../../../static/topoImages/topoIconsDarkEn.png";
export default {
  name: 'Row',
  props: ["val", "k"],
  data() {
    return {
      pwdText: "",
      eye: "el-icon-fa-eye",
      eyeSlash: "el-icon-fa-eye-slash",
      showPwdFlag: false,
      inputTytpe: "password"
    }
  },
  methods: {
    showPwd() {
      this.showPwdFlag = !this.showPwdFlag;
      if (this.showPwdFlag) {
        this.inputTytpe = "";
      } else {
        this.inputTytpe = "password";
      }
    }
  },
  mounted() {
  }
}

</script>
<style>
  .heatDetail input {
    border: 0 !important;
    background-color: transparent !important;
    padding-left: 0 !important;
    color: #333 !important;
    cursor: text !important;
  }
  .heatDetail .el-input {
    width: 40%;
  }
</style>
