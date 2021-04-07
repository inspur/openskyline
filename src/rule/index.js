import rules from "./rules";
const Schema = require('async-validator');
export default {
  init() {
    rules.forEach((item, index) => {
      Schema.messages[item.type] = Vue.t(item.message);
      Schema.register(item.type, item.validator);
    });
  }
};
