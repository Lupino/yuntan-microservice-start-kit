import crypto from 'crypto';
import config from '../../../config';
import {requireLogin} from '../user';
import {
  stringGenerator,
  sendJsonResponse,
  promiseToCallback,
} from '../utils';

import {checkPermission as articleCheckPermission} from './article';
import {checkPermission as coinCheckPermission} from './coin';
import {checkPermission as userCheckPermission} from './user';

const permissions = {
  article: articleCheckPermission,
  coin: coinCheckPermission,
  user: userCheckPermission,
};

function errorNoPermission(res) {
  res.status(403).json({err: 'No Permission'});
}

export function route(app) {
  app.get('/api/services/:service/secret/', requireLogin(), (req, res) => {
    const service = req.params.service;
    const pathname = req.query.pathname;
    const method = req.query.method;
    const user = req.currentUser;

    const permissionCheck = permissions[service];
    if (!permissionCheck) {
      return errorNoPermission(res);
    }

    promiseToCallback(permissionCheck)(method, pathname, {user}, (err, ok) => {
      if (err || !ok) {
        return errorNoPermission(res);
      }
      const secret = signSecret(service, method, pathname)
      sendJsonResponse(res, null, {secret});
    });
  });
}

function signSecret(service, method, pathname) {
  const secret = config[service].secret;
  const randomNonce = stringGenerator.random(10);
  const timestamp = Math.floor(new Date() / 1000);
  const hmac = crypto.createHmac('sha256', randomNonce);
  hmac.update(secret);
  hmac.update(method);
  hmac.update(pathname);
  hmac.update('' + timestamp);
  return {
    nonce: randomNonce,
    secret: hmac.digest('hex').toUpperCase(),
    timestamp: timestamp,
  };
}
