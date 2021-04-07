const startPage = resolve => {
  require.ensure(['views/startPage/StartPage.vue'], () => {
    resolve(require('views/startPage/StartPage.vue'));
  }, 'startPage');
};

const startPageProject = resolve => {
  require.ensure(['views/startPage/StartPageProject.vue'], () => {
    resolve(require('views/startPage/StartPageProject.vue'));
  }, 'startPageProject');
};

const startPageMember = resolve => {
  require.ensure(['views/startPage/StartPageMember.vue'], () => {
    resolve(require('views/startPage/StartPageMember.vue'));
  }, 'startPageMember');
};

const startPageOne = resolve => {
  require.ensure(['views/startPage/StartPageOne.vue'], () => {
    resolve(require('views/startPage/StartPageOne.vue'));
  }, 'startPageOne');
};
const startPageTwo = resolve => {
  require.ensure(['views/startPage/StartPageTwo.vue'], () => {
    resolve(require('views/startPage/StartPageTwo.vue'));
  }, 'startPageTwo');
};
const startPageThree = resolve => {
  require.ensure(['views/startPage/StartPageThree.vue'], () => {
    resolve(require('views/startPage/StartPageThree.vue'));
  }, 'startPageThree');
};
const startPageFour = resolve => {
  require.ensure(['views/startPage/StartPageFour.vue'], () => {
    resolve(require('views/startPage/StartPageFour.vue'));
  }, 'startPageFour');
};
const routes = [
  {
    name: 'startPage',
    path: '/startPage',
    alias: '/',
    component: startPage,
    flg:Vue.AuthList["m.startpage"],
    meta: {
      des: "base.startPage"
    },
    children:[{
      path: '',
      name:"startPage",
      components:{
        startPageProject,
        startPageMember,
        startPageOne,
        startPageTwo,
        startPageThree,
        startPageFour
      }
    }]
  }
];

export default routes;
