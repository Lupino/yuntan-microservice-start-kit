import Router from './router';

const router = new Router();

/*
 * coin name is `{type}_{name}`
 * @type do not contains any underscore
 */

function parseName(name) {
  const idx = name.indexOf('_');
  return {
    type: name.substr(0, idx),
    name: name.substr(idx + 1),
  };
}

async function requireOwner(params, options) {
  if (requireAdmin(params, options)) {
    return true;
  }
  const parsed = parseName(params.name);
  const {user} = options;
  if (parsed.name === user.name) {
    return true;
  }
  return false;
}

async function requireAdmin(params, {user}) {
  if (user.groups.indexOf('admin') > -1) {
    return true;
  }
  return false;
}

router.get('/api/coins/:name/score/', requireOwner);
router.get('/api/coins/:name/info/', requireOwner);
router.put('/api/coins/:name/info/', requireOwner);
router.get('/api/coins/:name/', requireOwner);
router.post('/api/coins/:name/drop/', requireAdmin);
router.get('/api/coins_history/', requireAdmin);
router.get('/api/coins_history/:namespace/', requireAdmin);
router.post('/api/coins/:name/', requireAdmin);
router.post('/api/graphql/', requireAdmin);
router.post('/api/graphql/:name/', requireOwner);

export function checkPermission(method, pathname, options) {
  return router.checkPermission(method, pathname, options);
}
