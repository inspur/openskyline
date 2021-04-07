// 公共异步请求模块 panqibao@inspur.com 2020年07月24日 11:17:42 中国济南

async function loadProject(v) {
  let url = `api/keystone/v3/inspur/projects?domain_id=default`;
  const res = await Vue.prototype.$ajax({
    type: "get",
    url: url
  }).catch(v => {

  });
  return res.projects || [];
}

export { loadProject };
