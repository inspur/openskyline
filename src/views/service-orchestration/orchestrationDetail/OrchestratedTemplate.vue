<template>
  <div>
    <el-form label-position="right" label-width="100px">
      <el-form-item :label="$t('heat.templateContent')">
        <el-input type="textarea" :autosize="{minRows:2}" v-model="fileContent" readonly></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import json2yaml from "json2yaml"
export default {
  name: 'OrchestratedTemplate',
  data() {
    return {
      fileContent: "",
      stackName: this.$route.params.stackName,
      stackId: this.$route.params.stackId
    };
  },
  mounted() {
    this.getTemplateDetail();
  },
  watch: {},
  methods: {
    async getTemplateDetail() {
      let self = this;
      try {
        let response = await this.$ajax({
          type: "get",
          url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/" + self.stackName + "/" + self.stackId + "/template",
          successFun: (response) => {
            let jsonTemplate = response;
            let newJson = {};
            if (jsonTemplate.heat_template_version) {
              newJson.heat_template_version = jsonTemplate.heat_template_version;
            }
            if (jsonTemplate.description) {
              newJson.description = jsonTemplate.description;
            }
            if (jsonTemplate.parameters) {
              newJson.parameters = jsonTemplate.parameters;
            }
            if (jsonTemplate.resources) {
              newJson.resources = jsonTemplate.resources;
            }
            if (jsonTemplate.outputs) {
              newJson.outputs = jsonTemplate.outputs;
            }
            if (jsonTemplate.parameter_groups) {
              newJson.parameter_groups = jsonTemplate.parameter_groups;
            }
            self.fileContent = json2yaml.stringify(newJson);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
}

</script>
