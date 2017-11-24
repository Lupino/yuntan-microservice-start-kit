import Router from './router';

const router = new Router();

async function requireOwner({name}, {user}) {
  return true;
}

async function requireAdmin({name}, {user}) {
  return true;
}

router.get('/api/users/', requireAdmin);
router.post('/api/users/', requireAdmin);
router.get('/api/users/:uidOrName/', requireAdmin);
router.delete('/api/users/:uidOrName/', requireAdmin);
router.post('/api/users/:uidOrName/', requireAdmin);
router.post('/api/users/:uidOrName/passwd', requireAdmin);
router.post('/api/users/:uidOrName/extra', requireAdmin);
router.delete('/api/users/:uidOrName/extra', requireAdmin);
router.post('/api/users/:uidOrName/extra/clear', requireAdmin);
router.post('/api/users/:uidOrName/verify', requireAdmin);
router.post('/api/users/:uidOrName/binds', requireAdmin);
router.post('/api/groups/:group/:uidOrName/', requireAdmin);
router.delete('/api/groups/:group/:uidOrName/', requireAdmin);
router.get('/api/groups/:group/', requireAdmin);
router.get('/api/binds/', requireAdmin);
router.delete('/api/binds/:bind_id', requireAdmin);
router.get('/api/graphql/', requireAdmin);
router.post('/api/graphql/', requireAdmin);
router.get('/api/binds/:name/graphql/', requireAdmin);
router.post('/api/binds/:name/graphql/', requireAdmin);
router.get('/api/users/:uidOrName/graphql/', requireAdmin);
router.post('/api/users/:uidOrName/graphql/', requireAdmin);

export function checkPermission(method, pathname, options) {
  return router.checkPermission(method, pathname, options);
}
