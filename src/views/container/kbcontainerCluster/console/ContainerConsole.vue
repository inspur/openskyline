<template>
  <div>
    <el-dialog :title="titleConsole" :visible.sync="visible" :before-close="cancel" size="large" v-dialogDrag>
      <el-row v-loading="loading" :element-loading-text="$t('container.connecting')">
        <el-col :span="24">
          <div class="console" id="terminal" style="height:500px;"></div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Terminal from './Xterm'
export default {
  name: "AddNode",
  props: ["clusterInfo"],
  data() {
    return {
      loading: false,
      visible: true,
      authorization: "",
      term: null,
      socket: null,
      lockReconnect: false, // 避免ws重复连接
      timeoutnum: null, // 断开，重连倒计时
      msgIndex: false,
      startWord: 'IyBSdW4ga3ViZWN0bCBjb21tYW5kcyBpbnNpZGUgaGVyZQ0KIyBlLmcuIGt1YmVjdGwgZ2V0IGFsbA0K',
      titleConsole: Vue.t('calcStorLang.console')
    };
  },
  mounted() {
    this.titleConsole = this.clusterInfo["name"] + Vue.t('calcStorLang.console')
    this.getClusterToken();
    this.term = new Terminal({
      cursorBlink: true,
      useStyle: true,
      fontSize: 12
    });
  },
  methods: {
    async getClusterToken() {
      let tokens = await this.$ajax({
        type: 'get',
        url: "api/cetus/v1/cluster/get_cluster_token",
        showErrMsg:false
      });
      if (tokens['result']) {
        this.$message({
          message: Vue.$t('container.clustertokenfailed'),
          type: "error"
        });
      } else {
        this.authorization = tokens["Authorization"];
        this.initTerminal();
      }
    },
    initWebSocket() {
      this.loading = true;
      let host = window.location.host;
      let protocol = window.location.protocol;
      let wsurl = "ws://"+host+"/webSocket/"+host+"/v3/clusters/"+this.clusterInfo["rancher_cluster_id"]+"?shell=true&key="+ encodeURIComponent(this.authorization);
      if (protocol == "https:") {
        wsurl = "wss://"+host+"/webSocket/"+host+"/v3/clusters/"+this.clusterInfo["rancher_cluster_id"]+"?shell=true&key="+ encodeURIComponent(this.authorization);
      }
      this.socket = new WebSocket(wsurl, 'base64.channel.k8s.io');
      this.socket.onopen = this.onopenTerminal;
      this.socket.onmessage = this.onmessageTerminal;
      this.socket.onclose = this.oncloseTerminal;
      this.socket.onerror = this.onerrorTerminal;
      this.msgIndex = true; // 每次重连置为true
    },
    initTerminal() {
      let terminalContainer = document.getElementById('terminal')
      this.term.open(terminalContainer);
      this.term._initialized = true
      this.term.fit();
      this.term.focus();
      this.term.on('data', (data) => {
        this.msgIndex = false;
        this.socket.send(`0${AWS.util.base64.encode(data)}`);
      });
      this.term.toggleFullScreen();
      this.initWebSocket();
    },
    onopenTerminal () {
      console.log("open")
      this.loading = false;
      this.term.write(AWS.util.base64.decode(this.startWord).toString());
    },
    onmessageTerminal(message) {
      const data = message.data.slice(1);
      switch (message.data[0]) {
        case '1':
        case '2':
        case '3':
          if (!this.msgIndex) {
            this.term.write(AWS.util.base64.decode(data).toString());
          }
          break;
      }
    },
    onerrorTerminal () {
      console.log('error')
      if (!this.lockReconnect) {
        this.reconnect();
      }
    },
    oncloseTerminal () {
      console.log('close')
      if (!this.lockReconnect) {
        this.reconnect();
      }
    },
    reconnect() {
      console.log('reconnect')
      let self = this;
      if (self.lockReconnect) {
        return;
      }
      self.lockReconnect = true;
      self.timeoutnum && clearTimeout(this.timeoutnum);
      self.timeoutnum = setTimeout(function() {
        self.initWebSocket();
        self.lockReconnect = false;
      }, 1000)
    },
    onResize() {
      this.term.fit();
    },
    cancel() {
      this.lockReconnect = true;
      this.term.dispose();
      this.socket.close();
      this.$emit("cancelAddNode", {});
    }
  },
  beforeDestroy () {
    this.lockReconnect = true;
    this.term.dispose()
    this.socket.close();
  }
};
</script>
