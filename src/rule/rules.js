import * as util from "./util";
export default [{
  type: 'required',
  message: 'validation.required',
  validator: function (rule, value, cb, source, options) {
    if ((value + "").replace(/^\s+/, "").replace(/\s+$/, "")) {
      return cb();
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'integer',
  message: 'validation.integer',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (/^[-+]?\d+$/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'integerNO000',
  message: 'validation.integerNO000',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (/^(0|\+?[1-9][0-9]*)$/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'min',
  message: 'validation.min',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (value * 1 >= rule.value * 1) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'max',
  message: 'validation.max',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (value * 1 <= rule.value * 1) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'maxIs10',
  message: 'container.maxNodeSizePerOper',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (value * 1 <= rule.value * 1) { return cb(); }
    let err = util.format(options.messages[rule.type]);
    cb(new Error(err));
  }
}, {
  type: 'minSize',
  message: 'validation.minSize',
  validator: function (rule, value, cb, source, options) {
    if (value.length >= rule.value) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'maxSize',
  message: 'validation.maxSize',
  validator: function (rule, value, cb, source, options) {
    if (value.length <= rule.value) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'disableJY',
  message: 'validation.disableJY',
  validator: function (rule, value, cb, source, options) {
    let b = /[#&]/g[Symbol.search](value) > -1;
    if (!b) { return cb(); }
    let err = util.format(options.messages[rule.type]);
    cb(new Error(err));
  }
}, {
  type: 'maxByte',
  message: 'validation.maxByte',
  validator: function (rule, value, cb, source, options) {
    if (value.replace(/[^\x00-\xff]/g, 'xxx').length <= rule.value) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'password',
  message: 'validation.password',
  validator: function (rule, value, cb, source, options) {
    if (/^(?=.*[0-9])(?=.*[A-Za-z])(?=.*[!@#$%^&*?_])/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'passwordLegal',
  message: 'validation.passwordLegal',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (/^[0-9a-zA-Z!@#$%^&*?_]{8,30}$/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'passwordComplexLegal',
  message: 'validation.passwordComplexLegal',
  validator: function (rule, value, cb, source, options) {
    if (!(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(value))) {
      cb(new Error(options.messages[rule.type]));
    } else {
      return cb();
    }
  }
}, {
  type: 'onlyLetter_Number_NoAllNUMBER',
  message: 'validation.onlyLetter_Number_NoAllNUMBER',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (/^(?!\d+$)[0-9a-zA-Z_]+$/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterNumber',
  message: 'validation.onlyLetterNumber',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (/^[0-9a-zA-Z]+$/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'only_Letter',
  message: 'validation.only_Letter',
  validator: function (rule, value, cb, source, options) {
    if (/^[_a-zA-Z]+$/.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'passwordEquals',
  message: 'validation.passwordEquals',
  validator: function (rule, value, cb, source, options) {
    let tempVal = eval('rule.context.' + rule.value);
    if (value === tempVal) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'passwordNotEquals',
  message: 'validation.passwordNotEquals',
  validator: function (rule, value, cb, source, options) {
    let tempVal = eval('rule.context.' + rule.value);
    if (value !== tempVal) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'notEquals',
  message: '不允许输入',
  validator: function (rule, value, cb, source, options) {
    let tempVal = rule.value;
    if (value !== tempVal) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'email',
  message: 'validation.email',
  validator: function (rule, value, cb, source, options) {
    let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'phone',
  message: 'validation.phone',
  validator: function (rule, value, cb, source, options) {
    let reg = /(^\d{10,11}$)|(^\d{7,8}$)|(^(\d{3,4})\-(\d{7,8})$)|(^(\d{3,4})\-(\d{7,8})\-(\d{1,4})$)|(^(\d{7,8})\-(\d{1,4})$)/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'telephone',
  message: 'validation.telephone',
  validator: function (rule, value, cb, source, options) {
    let reg = /^1\d{10}$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'ip',
  message: 'validation.ip',
  validator: function (rule, value, cb, source, options) {
    let reg = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'bmcip',
  message: 'validation.bmcip',
  validator: function (rule, value, cb, source, options) {
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'ipv4',
  message: 'validation.ip',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'ipv4Pre3',
  message: 'validation.ip',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){2}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'cidr',
  message: 'validation.cidr',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'ipv4orcidr',
  message: 'validation.ipv4orcidr',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
    let reg2 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
    if (reg.test(value) || reg2.test(value)) { return cb(); }
    if (value === "0.0.0.0/0") { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'ipv6orcidr',
  message: 'validation.ipv6orcidr',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    let fields = value.split("/");
    if (fields.length === 2) {
      let subNet = fields[1];
      let ipv6 = fields[0];
      if (reg.test(ipv6) && Number(subNet) >= 1 && Number(subNet) <= 128) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    } else if (fields.length === 1) {
      if (reg.test(value)) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    } else {
      cb(new Error(options.messages[rule.type]));
    }
  }
}, {
  type: 'ipv6',
  message: 'validation.ipv6',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'ipv4oripv6',
  message: 'validation.ipv4oripv6',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg1 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    let reg2 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
    if (reg2.test(value) || reg1.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_MinusNumber',
  message: 'validation.onlyLetter_MinusNumber',
  validator: function (rule, value, cb, source, options) {
    let reg = /^[_\-0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_MinusNumberPointer',
  message: 'validation.onlyLetter_MinusNumberPointer',
  validator: function (rule, value, cb, source, options) {
    let reg = /^[_\-0-9a-zA-Z\.]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_MinusNumberSp',
  message: 'validation.onlyLetter_MinusNumber',
  validator: function (rule, value, cb, source, options) {
    if (value === '') {
      cb();
    } else {
      let reg = /^[_\-0-9a-zA-Z]+$/;
      if (reg.test(value)) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    }
  }
}, {
  type: 'onlyLetter_MinusPointBracketNumberChinese',
  message: 'validation.onlyLetter_MinusPointBracketNumberChinese',
  validator: function (rule, value, cb, source, options) {
    let reg = /^[_\-0-9a-zA-Z().\u4e00-\u9fa5]+$/;
    if (value === "") { return cb(); }
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_MinusNumberChinese',
  message: 'validation.onlyLetter_MinusNumberChinese',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_MinusNumberChineseBra',
  message: 'validation.onlyLetter_MinusNumberChineseBra',
  validator: function (rule, value, cb, source, options) {
    if (value.replace(/\s|/g, "") === "") { return cb(); }
    let reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5<>\s*]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterNumberChinese',
  message: 'validation.onlyLetterNumberChinese',
  validator: function (rule, value, cb, source, options) {
    let reg = /^[0-9a-zA-Z\u4e00-\u9fa5]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_MinusNumberChineseSp',
  message: 'validation.onlyLetter_MinusNumberChineseSp',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_\-0-9a-zA-Z\u4e00-\u9fa5\ ]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterNumber_Chinese',
  message: 'validation.onlyLetterNumber_Chinese',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_0-9a-zA-Z\u4e00-\u9fa5]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_NumberChinese',
  message: 'validation.onlyLetter_NumberChinese',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[-_0-9a-zA-Z\u4e00-\u9fa5]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'startwithSlash',
  message: 'validation.startwithSlash',
  validator: function (rule, value, cb, source, options) {
    value === value.trim();
    if (value === "") { return cb(); }
    let reg = /^\/.*$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'startwithLetter_NoChinese',
  message: 'validation.startwithLetter_NoChinese',
  validator: function (rule, value, cb, source, options) {
    value === value.trim();
    if (value === "") { return cb(); }
    let reg = /^[A-Za-z]+[-._A-Za-z0-9]*$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'startwithLetter_NoChineseDot',
  message: 'validation.startwithLetter_NoChineseDot',
  validator: function (rule, value, cb, source, options) {
    value === value.trim();
    if (value === "") { return cb(); }
    let reg = /^[A-Za-z]+[-_A-Za-z0-9]*$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'validatePort',
  // message: 'validation.onlyLetterNumber_Chinese',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let va = value.trim();
    let regNum = /^([1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
    let one;
    let two;
    if (va !== "") {
      let portList = va.split(":");
      if (portList.length === 1) {
        if (!regNum.test(portList[0])) {
          cb(new Error("端口格式不正确，应为数字类型，端口范围1-65535"));
        }
        one = parseInt(portList[0]);
        if (one < 1 || one > 65535) {
          cb(new Error("端口大小不符合规范，端口范围1-65535"));
        }
        return cb();
      } else if (portList.length === 2) {
        if (portList[0].substring(0) === "0") {
          cb(new Error("端口格式不正确，首位不能是0"));
        }
        if (!regNum.test(portList[0]) || !regNum.test(portList[1])) {
          cb(new Error("端口格式不正确，应为数字类型，端口范围1-65535"));
        }
        one = parseInt(portList[0]);
        if (one < 1 || one > 65535) {
          cb(new Error("端口大小不符合规范，端口范围1-65535"));
        }
        two = parseInt(portList[1]);
        if (two < 1 || two > 65535) {
          cb(new Error("端口大小不符合规范，端口范围1-65535"));
        }
        if (one >= two) {
          cb(new Error("端口开始值需小于结束值"));
        }
        return cb();
      } else {
        cb(new Error("端口格式不正确"));
      }
    }
  }
}, {
  type: "cidripv6",
  message: 'validation.cidripv6',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    let fields = value.split("/");
    if (fields.length === 2) {
      let subNet = fields[1];
      let ipv6 = fields[0];
      if (reg.test(ipv6) && Number(subNet) >= 1 && Number(subNet) <= 128) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    } else {
      cb(new Error(options.messages[rule.type]));
    }
  }
}, {
  type: "cidrIPV6Include0",
  message: 'validation.cidripv6',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    let fields = value.split("/");
    if (fields.length === 2) {
      let subNet = fields[1];
      let ipv6 = fields[0];
      if ((reg.test(ipv6) || ipv6 === "::") && Number(subNet) >= 1 && Number(subNet) <= 128) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    } else {
      cb(new Error(options.messages[rule.type]));
    }
  }
}, {
  type: "mac",
  message: "validation.mac",
  validator: function (rule, value, cb, source, options) {
    value === value.trim();
    if (value === "") { return cb(); }
    let reg = /^([0-9a-fA-F]{2}([/\s:-][0-9a-fA-F]{2}){5})$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'allip',
  message: 'validation.ipv4oripv6',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let ip6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    let ip4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
    let cidr4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
    if (ip6.test(value) || ip4.test(value) || cidr4.test(value)) { return cb(); }
    let fields = value.split("/");
    if (fields.length === 2) {
      let subNet = fields[1];
      let ipv6 = fields[0];
      if (ip6.test(ipv6) && Number(subNet) >= 1 && Number(subNet) <= 128) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterMinusNumber',
  message: 'validation.onlyLetterMinusNumber',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[-0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_Number',
  message: 'validation.onlyLetter_Number',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterNumber_NoChinese',
  message: 'validation.onlyLetterNumber_NoChinese',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterNumberDot',
  message: 'validation.onlyLetterNumberDot',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[.0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetter_NumberChinese_Pointer',
  message: 'validation.onlyLetter_NumberChinese_Pointer',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_.\-0-9a-zA-Z\u4e00-\u9fa5]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'onlyLetterNumberDot_NoChinese',
  message: 'validation.onlyLetterNumberDot_NoChinese',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[_.0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'containerApplicationNameRule',
  message: 'validation.containerApplicationNameRule',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'startwithLetterNumber_endLetterNumber',
  message: 'validation.startwithLetterNumber_endLetterNumber',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'containerApplicationLabelRule',
  message: 'validation.containerApplicationLabelRule',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[0-9a-zA-Z]+([0-9a-zA-Z_]*[0-9a-zA-Z]+)?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'bucketNameRuleForS3',
  message: 'validation.bucketNameRuleForS3',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[0-9a-zA-Z]+([0-9a-zA-Z_.-]*)?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'bucketNameRule',
  message: 'validation.bucketNameRule',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[0-9a-zA-Z_.-]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'containerApplicationEnvRule',
  message: 'validation.containerApplicationEnvRule',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[a-zA-Z_]+([0-9a-zA-Z_]*[a-zA-Z_]+)?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'containerApplicationPortNameRule',
  message: 'validation.containerApplicationPortNameRule',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let reg = /^[0-9a-z]+([0-9a-z-]*[0-9a-z]+)?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'balancerStatusCode',
  message: 'validation.balancerStatusCode',
  validator: function (rule, value, cb, source, options) {
    let reg = /^(\d{3}(\s*,\s*\d{3})*)$|^(\d{3}-\d{3})$/;
    if (reg.test(value)) {
      // 连接符分隔的，前值需小于后值
      let lianjiefu = value.split("-");
      if (lianjiefu.length === 2 && Number(lianjiefu[0]) >= Number(lianjiefu[1])) {
        cb(new Error(options.messages[rule.type]));
      }
      return cb();
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'balancerurlpath',
  message: 'validation.balancerurlpath',
  validator: function (rule, value, cb, source, options) {
    let reg = /^((http|https|ftp):\/\/|\/){1}(?!\/){1}((?=(?!\/\/))(?=([a-zA-Z0-9-._~!$&/\'()*+,;=:@]|(%[a-fA-F0-9]{2}))).)*$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'imageURL',
  message: 'validation.imageURL',
  validator: function (rule, value, cb, source, options) {
    let reg = /^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'forbiddenSpace',
  message: 'validation.nospacerule',
  validator: function (rule, value, cb, source, options) {
    let reg = /^[^ ]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'requiredNet',
  message: 'validation.required',
  validator: function (rule, value, cb, source, options) {
    if (value + "" !== "") {
      return cb();
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'integerNozero',
  message: 'validation.integer',
  validator: function (rule, value, cb, source, options) {
    if (value === "") {
      return cb();
    } else {
      if (value.length > 1 && value.substring(0, 1) === "0") {
        cb(new Error("首位不能是0"));
      } else {
        if (/^[-+]?[1-9]+[0-9]*$/.test(value)) { return cb(); }
      }
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'no_Chinese',
  message: 'validation.no_Chinese',
  validator: function (rule, value, cb, source, options) {
    if (value + "" !== "") {
      let reg = /[\u4e00-\u9fa5]/;
      if (!reg.test(value)) { return cb(); }
    } else {
      return cb();
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'no_Chinese_mark',
  message: 'validation.no_Chinese_mark',
  validator: function (rule, value, cb, source, options) {
    if (value + "" !== "") {
      let reg = /^[\x00-\xff]+$/;
      if (reg.test(value)) { return cb(); }
    } else {
      return cb();
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'cidr4cidr6',
  message: 'validation.cidr',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let ip6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/;
    let ip4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
    let cidr4 = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2}((\/[1-9])|(\/[12][0-9])|(\/3[012])))|(2[0-4][0-9])((\/[1-9])|(\/[12][0-9])|(\/3[012]))|(25[0-5])((\/[1-9])|(\/[12][0-9])|(\/3[012])))$/;
    if (cidr4.test(value)) { return cb(); }
    let fields = value.split("/");
    if (fields.length === 2) {
      let subNet = fields[1];
      let ipv6 = fields[0];
      if (ip6.test(ipv6) && Number(subNet) >= 1 && Number(subNet) <= 128) {
        return cb();
      } else {
        cb(new Error(options.messages[rule.type]));
      }
    }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'arrayNotEmpty',
  message: 'validation.required',
  validator: function (rule, value, cb, source, options) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        cb(new Error(options.messages[rule.type]));
      } else {
        cb();
      }
    } else {
      cb();
    }
  }
}, {
  type: 'greaterThan',
  message: 'validation.greaterThan',
  validator: function (rule, value, cb, source, options) {
    if (!isNaN(value)) {
      if (value * 1 <= rule.value) {
        cb(new Error(util.format(options.messages[rule.type], rule.value)));
      } else {
        cb();
      }
    } else {
      cb(new Error(util.format(options.messages[rule.type], rule.value)));
    }
  }
}, {
  type: 'isValidMask', // 子网掩码
  message: 'validation.isValidMask',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    let mask = /^((128|192)|2(24|4[08]|5[245]))(\.(0|(128|192)|2((24)|(4[08])|(5[245])))){3}$/;
    if (mask.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'unsignedPositiveInteger', //正整数，非零，不带符号
  message: 'validation.unsignedPositiveInteger',
  validator: function (rule, value, cb, source, options) {
    if (!(/^[1-9]{1}[0-9]*$/.test(value))) {
      cb(new Error(options.messages[rule.type]));
    } else {
      return cb();
    }
  }
}, {
  type: 'unsignedPositiveIntegerNotRequire', //正整数，非零，不带符号
  message: 'validation.unsignedPositiveInteger',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (!(/^[1-9][0-9]*$/.test(value))) {
      cb(new Error(options.messages[rule.type]));
    } else {
      return cb();
    }
  }
}, {
  type: 'unsignedInteger', //正整数，非零，不带符号
  message: 'validation.unsignedInteger',
  validator: function (rule, value, cb, source, options) {
    if (!(/^[0-9]+$/.test(value))) {
      cb(new Error(options.messages[rule.type]));
    } else {
      return cb();
    }
  }
}, {
  type: 'linuxpath',
  message: 'validation.linuxpath',
  validator: function (rule, value, cb, source, options) {
    value === value.trim();
    if (value === "") { return cb(); }
    let reg = /^(\/)[\/_.\-0-9a-zA-Z]+$/;
    if (reg.test(value)) { return cb(); }
    cb(new Error(options.messages[rule.type]));
  }
}, {
  type: 'base64LengthMax',
  message: 'validation.base64LengthMax',
  validator: function (rule, value, cb, source, options) {
    if (value === "") {
      return cb();
    } else {
      if (btoa(value).length <= rule.value) {
        return cb();
      } else {
        cb(new Error(util.format(options.messages[rule.type], rule.value)));
      }
    }
  }
}, {
  type: 'equalTo',
  message: 'validation.equalTo',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (value.length === rule.value * 1) { return cb(); }
    let err = util.format(options.messages[rule.type], rule.value);
    cb(new Error(err));
  }
}, {
  type: 'QoSdscp',
  message: 'validation.QoSdscp',
  validator: function (rule, value, cb, source, options) {
    const arr = [0, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 46, 48, 56];
    if (value === "") { return cb(); }
    if (arr.includes(value / 1)) { return cb(); }
    let err = util.format(options.messages[rule.type]);
    cb(new Error(err));
  }
}, {
  type: 'noNewLine',
  message: 'validation.noNewLine',
  validator: function (rule, value, cb, source, options) {
    if (value === "") { return cb(); }
    if (!/\n/.test(value)) {
      return cb();
    } else {
      cb(new Error(options.messages[rule.type]));
    }
  }
}];
