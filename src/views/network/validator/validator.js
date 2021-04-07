export const onlyLetterNumberChinese = (value) => {
  if (!/^[_0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
    throw new Error(Vue.t('validation.onlyLetterNumber_Chinese'));
  }
};
export const onlyLetterMinusNumberChinese = (value) => {
  if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
    throw new Error(Vue.t('validation.onlyLetter_MinusNumberChinese'));
  }
};

export const onlyNumberDot = (value) => {
  let reg = /^[.:0-9a-fA-F]+$/;
  if (value !=="" && !reg.test(value)) {
    throw new Error(Vue.t('network.onlyIpv4OrIpv6Char'));
  }
};
