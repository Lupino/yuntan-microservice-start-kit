import Router from './router';

const router = new Router();

async function requireOwner({name}, {user}) {
  return true;
}

async function requireAdmin({name}, {user}) {
  return true;
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
