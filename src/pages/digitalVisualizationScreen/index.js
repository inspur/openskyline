// 潘启宝写于2020年3月28日 13:53:30，地点---中国济南

import vueLocal from '../../locale';
import {
  loginAnimation
} from '../login/animation';
import {
  tween
} from '../../views/intelligentMonitoring/public/tween';
import Dashboard from './components/Dashboard';
import Vertex from './components/Vertex';
import List from './components/List';
import logoImg from '../../assets/img/login/logo.png';

if (window.URLSearchParams) {
  window.urlSearchParams = new URLSearchParams(window.location.search);
}

export default {
  components: {
    Dashboard, Vertex, List
  },
  data() {
    let d = {
      title: Vue.oemSwitch === true ? Vue.oemProductName : (Vue.archIs('x86') ? Vue.t('base.mainTitle') : Vue.t('base.mainTitleAK')),
      logo: Vue.oemSwitch === true ? Vue.oemProductLogo : logoImg,
      opener: window.opener || (window.urlSearchParams && window.urlSearchParams.get('test')),
      flex0Data: {
        virtualMachine: { title: Vue.t('bigScreen.VM', { 'total': Vue.t('bigScreen.TOTAL') }), value: '-', show: 1 },
        host: { title: Vue.t('bigScreen.HOST', { 'total': Vue.t('bigScreen.TOTAL') }), value: '-', show: 1 },
        cloudDiskDrive: { title: Vue.t('bigScreen.DISK', { 'total': Vue.t('bigScreen.TOTAL') }), value: '-', show: 1 },
        storageBack: { title: Vue.t('bigScreen.STORAGE', { 'total': Vue.t('bigScreen.TOTAL') }), value: '-', show: 1 },
        physicalhost: { title: Vue.t('bigScreen.CPM', { 'total': Vue.t('bigScreen.TOTAL') }), value: '-', show: 0 },
        baremachine: { title: Vue.t('bigScreen.BARE_MACHINES', { 'total': Vue.t('bigScreen.TOTAL') }), value: '-', show: 0 }
      },
      flex1Data: { title: Vue.t('bigScreen.CPU_DISTRIBUTION_RATIO'), name0: Vue.t('bigScreen.CPU_TOTAL_AUDIT'), value0: '-', name1: Vue.t('bigScreen.CPU_ALLOCATED'), value1: '-', name2: '', value2: '-', percent0: 0, percent1: 0, percent2: 0 },
      flex2Data: { title: Vue.t('bigScreen.MEMORY_ALLOCATION_RATIO'), name0: Vue.t('bigScreen.TOTAL_MEMORY'), value0: '-', name1: Vue.t('bigScreen.MEMORY_ALLOCATED'), value1: '-', name2: '', value2: '-', percent0: 0, percent1: 0, percent2: 0 },
      flex3Data: {
        title: Vue.t('bigScreen.SYSTEM_HAS_RUN_SMOOTHLY'),
        createdAtTime: -1,
        currentTime: -1,
        date: { key: Vue.t('bigScreen.DAY'), value: -1 },
        hour: { key: Vue.t('bigScreen.HOUR'), value: -1 },
        minutes: { key: Vue.t('bigScreen.MINUTE'), value: -1 },
        seconds: { key: Vue.t('bigScreen.SECOND'), value: -1 }
      },
      flex4Data: {
        cpu: { title: Vue.t('bigScreen.CPU_UTILIZATION'), percent: 0 },
        mem: { title: Vue.t('bigScreen.MEMORY_UTILIZATION'), percent: 0 },
        storage: { title: Vue.t('bigScreen.STORAGE_UTIZATION'), name0: Vue.t('bigScreen.TOTAL_STORAGE_CAPACITY'), value0: '-', name1: Vue.t('bigScreen.STORAGE_ACTUAL_CAPACITY'), value1: '-', percent: 0 }
      },
      flex5Data: { title: `${Vue.t('bigScreen.VIRTUAL_MACHINE_CPU_USAGE')}-TOP10`, list: [] },
      flex6Data: { title: `${Vue.t('bigScreen.VIRTUAL_MACHINE_MEMORY_USAGE')}-TOP10`, list: [] },
      flex7Data: { title: `${Vue.t('bigScreen.VIRTUAL_MACHINE_NETWORK_RATE')}-TOP10`, list: [] },
      flex8Data: { title: `${Vue.t('bigScreen.VIRTUAL_MACHINE_NETWORK_OUT_RATE')}-TOP10`, list: [] },
      setTimeoutID: 0,
      setTimeoutID1: 0
    };
    return d;
  },
  computed: {
    flex0DataComputed() {
      return Object.values(this.flex0Data).filter(v => v.show);
    }
  },
  beforeDestroy() {
    clearTimeout(this.setTimeoutID);
    clearTimeout(this.setTimeoutID1);
    loginAnimation.destroy(this);
  },
  mounted() {
    loginAnimation.init({
      vm: this,
      maxHeight: 0.7,
      coreCenterOffsetHeight: 1.23456789
    });
    this.getTime();
    this.setTimeoutHandler();
  },
  methods: {
    initFontSize(v) {
      function f(v) {
        let el = document.documentElement || document.body.parentElement;
        let w = el.clientWidth || document.body.clientWidth;
        el.style.fontSize = `${20 * (w / 640)}px`;
      }
      window.addEventListener('resize', f);
      document.addEventListener('DOMContentLoaded', f);
    },
    close(v) {
      window.close();
    },
    pad0(v) {
      return v < 10 ? `0${v}` : v;
    },
    setTimeoutHandler(v) {
      this.getData();

      let flag = !(window.urlSearchParams && window.urlSearchParams.get('notimeout'));
      if (flag) {
        this.setTimeoutID = setTimeout(this.setTimeoutHandler, 1000 * 60); //TODO
      }
    },
    getData(v) {
      let vm = this;
      let pid = vm.$cookie.get('pid') || '';
      let bigscreen = vm.$cookie.get('bigscreen') || '';

      // 云主机总数
      vm.$ajax({
        type: 'get',
        url: 'api/nova/v2.1/servers-inspur/detail?all_tenants=1&limit=10&sort_key=created_at&sort_dir=desc&not-tags=%40',
        headers: {
          'X-OpenStack-Nova-API-Version': 2.67
        }
      }).then(v => {
        let d = v['all_instances_info'] || {};
        d = d['total_instances'] || '-';
        vm.flex0Data['virtualMachine']['value'] = d;
      }, v => { });

      // CPU 内存 宿主机总数
      vm.$ajax({
        type: 'get',
        url: 'api/nova/v2.1/os-hypervisors/detail'
      }).then(v => {
        let d = v['hypervisors'] || [];
        let vc = 0;
        let vcu = 0;
        let mm = 0;
        let mmu = 0;
        d = d.filter(v => v['hypervisor_type'] !== 'ironic');
        d.forEach(v => {
          if (v['alert_status'] === "LOST") {
            return;
          }
          vc += parseFloat(v['vcpus']);
          vcu += parseFloat(v['vcpus_used']);
          mm += parseFloat(v['memory_mb']);
          mmu += parseFloat(v['memory_mb_used']);
        });
        vm.flex1Data['value0'] = parseInt(vc);
        vm.flex1Data['value1'] = parseInt(vcu);
        vm.flex2Data['value0'] = mm * (1024 ** 2);
        vm.flex2Data['value1'] = mmu * (1024 ** 2);

        if (vc > vcu) {
          vm.flex1Data['percent0'] = 1;
          vm.flex1Data['percent1'] = vcu / vc;
        } else {
          vm.flex1Data['percent1'] = 1;
          vm.flex1Data['percent0'] = vc / vcu;
        }
        if (mm > mmu) {
          vm.flex2Data['percent0'] = 1;
          vm.flex2Data['percent1'] = mmu / mm;
        } else {
          vm.flex2Data['percent1'] = 1;
          vm.flex2Data['percent0'] = mm / mmu;
        }

        vm.flex1Data['percent2'] = vcu / vc;
        vm.flex2Data['percent2'] = mmu / mm;

        vm.flex0Data['host']['value'] = d.length;// 宿主机总数
      }, v => { });

      // 云硬盘总数
      vm.$ajax({
        type: 'get',
        url: `api/cinderv3/v3/${pid}/inspur-volumes/detail?metadata={'store_image_data':'False'}&limit=10&with_count=True&offset=0&sort_key=created_at&sort_dir=desc&all_tenants=True&soft_deleted=False`,
        headers: {
          'OpenStack-API-Version': 'volume 3.45'
        }
      }).then(v => {
        let d = v['count'] || '-';
        vm.flex0Data['cloudDiskDrive']['value'] = d;
      }, v => { });

      // 裸机总数
      vm.flex0Data['baremachine']['show'] = bigscreen.indexOf('baremachine') + 1;
      if (vm.flex0Data['baremachine']['show']) {
        vm.$ajax({
          type: 'get',
          url: 'api/ironic/v1/nodes_inspur?is_adopt=no&detail=True',
          headers: {
            'X-Openstack-Ironic-Api-Version': 'latest'
          }
        }).then(v => { vm.flex0Data['baremachine']['value'] = v['nodes']['length']; }, v => { });
      }

      // 云物理机总数
      vm.flex0Data['physicalhost']['show'] = bigscreen.indexOf('physicalhost') + 1;
      if (vm.flex0Data['physicalhost']['show']) {
        vm.$ajax({
          type: 'get',
          url: `api/nova/v2.1/servers-inspur/detail?all_tenants=1&tags=@`,
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          }
        }).then(v => {
          let d = v['all_instances_info'] || {};
          d = d['total_instances'] || 0;
          vm.flex0Data['physicalhost']['value'] = d;
        }, v => { });
      }

      // CPU实际使用率 内存实际使用率
      vm.$ajax({
        type: 'get',
        url: 'api/pluto/v1/monitor/sub_resources?subclass_id=hs&page_size=999999'
      }).then(v => {
        let d = v['resource_list'] || [];
        let cu = 0;
        let mu = 0;
        d.forEach(v => {
          cu += parseFloat(v['cpu_usage']) || 0;
          mu += parseFloat(v['mem_usage']) || 0;
        });
        cu = cu / d.length;
        mu = mu / d.length;
        vm.flex4Data['cpu']['percent'] = cu / 100;
        vm.flex4Data['mem']['percent'] = mu / 100;
      }, v => { });

      // 存储总容量 存储实际使用容量 存储实际使用率
      vm.$ajax({
        type: 'get',
        url: `api/cinder/v3/${pid}/inspur-scheduler-stats/get_pools?detail=True`
      }).then(v => {
        let f4d = vm.flex4Data['storage'];
        // let d = v['pools'] || [];
        let d = v['storage_summary'] || {};
        let v1 = parseFloat(d['total_capacity']) || 0;
        let v2 = v1 - (parseFloat(d['total_free_capacity']) || 0);
        // d.forEach(v => {
        //   let c = v['capabilities'];
        //   v1 += parseFloat(c['total_capacity_gb']);
        //   v2 += parseFloat(c['total_capacity_gb'] - c['free_capacity_gb']);
        // });
        f4d['value0'] = v1 * (1024 ** 3);
        f4d['value1'] = v2 * (1024 ** 3);
        f4d['percent'] = v2 / v1;

        vm.flex0Data['storageBack']['value'] = (v['pools'] || []).length;// 存储后端总数
      }, v => { });

      vm.getTop10({ type: 'vm_cpu', data: vm.flex5Data, unit: '%' });// 虚拟机CPU使用率TOP10
      vm.getTop10({ type: 'vm_mem', data: vm.flex6Data, unit: '%' });// 虚拟机内存使用率TOP10
      vm.getTop10({ type: 'vm_netin', data: vm.flex7Data, unit: 'KB/s' });// 虚拟机网络进速率-TOP10
      vm.getTop10({ type: 'vm_netout', data: vm.flex8Data, unit: 'KB/s' });// 虚拟机网络出速率-TOP10
    },
    getTop10(v = {}) {
      return this.$ajax({
        type: 'get',
        url: `api/pluto/v1/monitor/bigscreen/topN?${$.param({ type: v['type'], num: '10', history: '0' })}`
      }).then(v_ => {
        let d = v_['data'] || {};
        d = d['realtime'] || [];
        d.length = Math.min(d.length, 10);
        if (!d.length) {
          return;
        }

        v['data']['list'] = Array.from(new Array(d.length), v_ => { return { name: '-', value: 0, percent: 0, unit: v['unit'] }; });
        let maxValue = 1;// 默认分母为1
        let isNet = v['type'] === 'vm_netin' || v['type'] === 'vm_netout';
        if (isNet) {
          maxValue = +d.reduce((v, vv) => {
            return +v['value'] > +vv['value'] ? v : vv;
          })['value'];
        }
        d.forEach((v_, i) => {
          let value = +v_['value'];
          let p = value;
          if (isNet) {
            p = value / maxValue * 100;
          }
          p = +p.toFixed(2);
          v['data']['list'][i]['percent'] = p;
          v['data']['list'][i]['value'] = value;
          v['data']['list'][i]['name'] = v_['name'];
        });
      }, v => { });
    },
    computeTime(v) {
      if (this.flex3Data['createdAtTime'] === -1) {
        return;
      }
      let t = new Date().getTime();
      let d = (t - this.flex3Data['createdAtTime']) / 1000 / 60 / 60 / 24;
      let h = (d % 1) * 24;// %1取小数部分，乘以区间整体得到真正的时间
      let m = (h % 1) * 60;
      let s = (m % 1) * 60;
      this.flex3Data['date']['value'] = this.pad0(parseInt(d));
      this.flex3Data['hour']['value'] = this.pad0(parseInt(h));
      this.flex3Data['minutes']['value'] = this.pad0(parseInt(m));
      this.flex3Data['seconds']['value'] = this.pad0(parseInt(s));

      this.setTimeoutID1 = setTimeout(this.computeTime, 1000);
    },
    async getTime(v) {
      const res = await this.$ajax({
        type: 'get',
        url: `api/keystone/v3/inspur/users?domain_id=default`
      });

      let users = res.users || [];
      let admin = users.filter(v => v.name === 'admin' && v.created_at)[0];
      let date = new Date(admin && admin['created_at']);

      date = date ? new Date(date.getTime() + -date.getTimezoneOffset() * 60 * 1000) : date;// UTC时间比中国时间慢，所以要加上

      this.flex3Data['createdAtTime'] = date.getTime();
      this.flex3Data['currentTime'] = this.flex3Data['createdAtTime'];
      this.computeTime({
        time: this.flex3Data['createdAtTime']
      });
    }
  }
};
