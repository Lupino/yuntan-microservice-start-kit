import {requireLogin, requireAdmin, userSrv, getUser} from './user';
import {sendJsonResponseWithPromise} from './utils';

import {article as articleConfig} from '../../config';
import {ArticleService} from 'yuntan-service';

export const articleSrv = new ArticleService(articleConfig);

export function route(app) {
  app.post('/api/create_article/', requireAdmin(), (req, res) => {
    async function doCreateArticle() {
      const {title, summary, content} = req.body;
      const user = req.currentUser;
      let art = await articleSrv.create({title, summary, content});
      await articleSrv.createTimeline('user_' + user.id, art.id);
      art.timelines = ['user_' + user.id];
      return art;
    }
    sendJsonResponseWithPromise(res, doCreateArticle, {spec: 'article'})();
  });
}

