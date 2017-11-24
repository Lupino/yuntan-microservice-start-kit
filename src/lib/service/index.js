import crypto from 'crypto';
import config from '../../../config';
import {requireLogin} from '../user';
import {
  stringGenerator,
  sendJsonResponseWithPromise,
  promiseToCallback,
} from '../utils';

import {checkPermission as articleCheckPermission} from './article';
import {checkPermission as coinCheckPermission} from './coin';

function signSecret({user, service, pathname, method}) {
  const originalSecret = config[service].secret;
  const randomNonce = stringGenerator.random(10);
  const timestamp = Math.floor(new Date() / 1000);
  const hmac = crypto.createHmac('sha256', randomNonce);
  hmac.update(originalSecret);
  hmac.update(method);
  hmac.update(pathname);
  hmac.update('' + timestamp);
  return {
    nonce: randomNonce,
    secret: hmac.digest('hex').toUpperCase(),
    timestamp: timestamp,
  };
}

const permissions = {
  article: articleCheckPermission,
  coin: coinCheckPermission,
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
      const opts = {spec: 'secret', errStatus: 403};
      sendJsonResponseWithPromise(res, signSecret, opts)({user, service, pathname, method});
    });
  });
}