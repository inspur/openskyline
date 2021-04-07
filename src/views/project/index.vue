<template>
	<div>
		<instances v-if="listFlag" :flag1="listFlag" :flag2="contentFlag" @changeValue="changeValue"></instances>
		<router-view v-if="contentFlag" :naviName="naviName" @changeValue="changeValue"></router-view>
	</div>
</template>
<script>
import Instances from "./Instances";
export default {
    name: "index",
    components: {Instances},
    data() {
      return {
        listFlag: true,
        contentFlag: false,
        naviName: ''
      }
    },
    methods: {
       changeValue(obj) {
           this.listFlag = false;
           this.contentFlag = true;
           if (obj != null) {
              this.naviName = obj[0];
           }
       }
    }
}
</script>