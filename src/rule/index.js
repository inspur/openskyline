import rules from "./rules";
import Schema from 'async-validator';

export default {
  init() {
    for (let item of rules) {
      Schema.messages[item.type] = Vue.t(item.message);
      Schema.register(item.type, item.validator);
    }
  }
};

