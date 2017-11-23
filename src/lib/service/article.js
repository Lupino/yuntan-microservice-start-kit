import Router from './router';

const router = new Router();

async function alawayTrue(params, options) {
  return true;
}

async function requireOwner({art_id}, {user}) {
  return true;
}

async function requireAdmin({art_id}, {user}) {
  return true;
}

// router.post("/api/articles/", alawayTrue);
router.post('/api/articles/:art_id/', requireOwner);
router.post('/api/articles/:art_id/cover', requireOwner);
router.delete('/api/articles/:art_id/cover', requireOwner);
router.post('/api/articles/:art_id/extra', requireOwner);
router.delete('/api/articles/:art_id/extra', requireOwner);
router.post('/api/articles/:art_id/extra/clear', requireOwner);
router.delete('/api/articles/:art_id/', requireOwner);
router.post('/api/tags/', requireAdmin);
router.post('/api/tags/:tag_id/', requireAdmin);

router.post('/api/timeline/:timeline/', requireAdmin);
router.post('/api/timeline/:timeline/meta', requireAdmin);
router.delete('/api/timeline/:timeline/meta', requireAdmin);
router.delete('/api/timeline/:timeline/:art_id/', requireAdmin);
router.post('/api/articles/:art_id/tags/', requireOwner);
router.delete('/api/articles/:art_id/tags/', requireOwner);
router.post('/api/file/:key', alawayTrue);
router.post('/api/graphql/', alawayTrue);

export function checkPermission(method, pathname, options) {
  return router.checkPermission(method, pathname, options);
}
