<template>
  <div>
    <vue-progress-bar></vue-progress-bar>
  </div>
</template>

<script>
import * as utils from 'utils/index.js';
const Base64 = require('js-base64').Base64;
export default {
  name: 'login-with-token',
  methods: {
    getQueryString() {
      const href = location.href;
      const queryString = href.split('?')[1];
      const keyValueStrings = queryString.split('&');
      let keyValues = {};
      for (let i = 0; i < keyValueStrings.length; i++) {
        const keyValue = keyValueStrings[i].split('=');
        keyValues[keyValue[0]] = keyValue[1];
      }
      return keyValues;
    }
  },
  async mounted() {
    const $this = this;
    const keyValues = $this.getQueryString();
    const loginData = {
      token: keyValues['token'] || '',
      sessionTimeout: '10',
      ip: keyValues['ip'] || '127.0.0.1',
      userId: keyValues['userId'] ? Base64.decode(keyValues['userId']) : '',
      userName: keyValues['userName'] ? Base64.decode(keyValues['userName']) : '',
      language: 'zh-cn',
      domainId: keyValues['domainId'] || 'Default',
      domainName: keyValues['domainName'] || 'Default'
    }
    let result = await this.$ajax({
      type: 'post',
      dataType: 'jsonp',
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      data: loginData,
      url: "/node-api/login?timestamp=" + (new Date()).getTime()
    });
    document.location.href = "/index.html";
  }
}
</script>

<style>

</style>
