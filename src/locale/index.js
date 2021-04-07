import VueI18n from 'vue-i18n';
import enLocale from './en';
import zhLocale from './zh-cn';
Vue.use(VueI18n);

export default {
  init: function(language) {
    if (language === "zh_cn") {
      language = "zh-cn";
    }
    Vue.config.lang = language || 'zh-cn';
    Vue.config.fallbackLang = 'zh-cn';
    // Create VueI18n instance with options
    // const i18n = new VueI18n({
    //   messages: {
    //     "en": en,
    //     "zh-CN": zhCN
    //   }
    // });
    //
    const locales = {
      "en": enLocale,
      "zh-cn": zhLocale
    };

    // set locales
    Object.keys(locales).forEach(function (lang) {
      Vue.locale(lang, locales[lang]);
    });
    // Vue.locale('zh-CN', zhLocale);
    // Vue.locale('en-US', enLocale);
  }
};
