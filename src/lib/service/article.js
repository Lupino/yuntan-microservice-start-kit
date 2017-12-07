import Router from './router';
import {article as config} from '../../../config';
import {ArticleService} from 'yuntan-service';

export const articleSrv = new ArticleService(config);

const router = new Router();

/*
 * we save user and article relationship on timeline
 * with `user_{uid}`
 */

function extractUid(timelines) {
  const filterd = timelines.filter((timeline) => {
    if (timeline.startsWith('user_')) {
      return true;
    }
    return false;
  });
  if (filterd.length > 0) {
    return Number(filterd[0].substr(5));
  }
  return 0;
}

async function alawayTrue(params, options) {
  return true;
}

async function requireOwner(params, options) {
  if (requireAdmin(params, options)) {
    return true;
  }

  const {art_id} = params;
  const {user} = options;

  const data = await articleSrv.graphql(`{article(id: ${art_id}) {timelines}}`);
  if (data.errors) {
    console.log(data.errors);
    return false;
  }
  if (!data.article) {
    return false;
  }
  const uid = extractUid(data.article.timelines);
  if (uid === user.id) {
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
