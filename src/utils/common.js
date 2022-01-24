async function getProjects(v) {
  const url = `api/keystone/v3/projects?domain_id=default`;
  const res = await Vue.prototype.$ajax({
    type: 'get',
    url: url
  }).catch(v => {

  });
  return res.projects || [];
}

async function getUsers() {
  const url = `api/keystone/v3/users?dir=asc&field=name&domain_id=default`;
  const res = await Vue.prototype.$ajax({
    type: 'get',
    url: url
  }).catch(v => {
  });
  return res.users || {};
}

async function getUserById(userId) {
  const url = `api/keystone/v3/users/${userId}`;
  const res = await Vue.prototype.$ajax({
    type: 'get',
    url: url
  }).catch(v => {
  });
  return res.user || {};
}

async function getUsersByProjectId(projectId) {
  return new Promise(async (resolve, reject) => {
    const url = `api/keystone/v3/role_assignments?scope.project.id=${projectId}`;
    const res = await Vue.prototype.$ajax({
      type: 'get',
      url: url
    }).catch(v => {
    });
    const users = [];
    const usersPromises = [];
    for (let roleAssign of res.role_assignments) {
      if ('user' in roleAssign) {
        usersPromises.push(getUserById(roleAssign.user.id));
      }
    }
    Promise.all(usersPromises).then(results => {
      for (let result of results) {
        if (users.findIndex(item => item.id === result.id) === -1) {
          users.push(result);
        }
      }
      resolve(users);
    }).catch(err => {
      reject([]);
    });
  });
}

export { getProjects, getUsers, getUserById, getUsersByProjectId };
