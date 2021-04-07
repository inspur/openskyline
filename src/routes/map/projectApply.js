const projectApply = resolve => {
  require.ensure(['views/systemManagement/projectApply/ProjectApply.vue'], () => {
    resolve(require('views/systemManagement/projectApply/ProjectApply.vue'));
  }, 'projectApply');
};

const routes = [{
  name: 'projectApply',
  path: '/projectApply',
  alias: '/',
  component: projectApply,
  meta: {
  }
}]
export default routes;
