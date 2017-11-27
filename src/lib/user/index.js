export {getUser, userSrv} from './common';
import {getUser, userSrv} from './common';
import {route as weixinRoute} from './weixin';

import {
  getTokenValue,
  removeToken,
} from '../redis';

import {
  promiseToCallback,
  sendJsonResponseWithPromise,
} from '../utils';

export function route(app) {
  weixinRoute(app);
  indexRoute(app);
}

function updateExtraHandler(req, res) {
  async function update() {
    const extra = req.body;
    await userSrv.updateExtra(req.currentUser.name, extra);
    const user = await getUser(req.currentUser.name);
    return user;
  }
  const opts = {spec: 'user', errStatus: 400};
  sendJsonResponseWithPromise(res, update, opts)();
}

export function currentUser() {
  async function getRequestUser(token) {
    const username = await getTokenValue(token);
    const user = await userSrv.get(username);
    return user;
  }
  return (req, res, next) => {
    let token = req.get('x-request-token');
    if (!token) {
      token = req.params.token || req.body.token || req.query.token;
    }

    if (!token) {
      return next();
    }
    req.token = token;
    promiseToCallback(getRequestUser)(token, (err, user) => {
      if (user) req.currentUser = user;
      next();
    });
  };
}

export function requireLogin() {
  return (req, res, next) => {
    if (req.currentUser) {
      return next();
    }
    res.status(403).json({err: 'Unauthorized'});
  };
}

export function requireAdmin() {
  return (req, res, next) => {
    if (req.currentUser && req.currentUser.groups.indexOf('admin') > -1) {
      return next();
    }
    res.status(403).json({err: 'No Permission'});
  };
}

function indexRoute(app) {
  app.get('/api/users/me/', requireLogin(), (req, res) => {
    res.json({user: req.currentUser});
  });

  app.post('/api/update_profile/', requireLogin(), updateExtraHandler);

  app.post('/api/signout/', requireLogin(), (req, res) => {
    const specData = {result: 'OK'};
    sendJsonResponseWithPromise(res, removeToken, {specData})(req.token);
  });

  app.get('/api/setup/', requireLogin(), (req, res) => {
    const setupToken = req.query['setup-token'];
    if (!setupToken) {
      res.status(400).json({err: 'setup-token is required.'});
    }
    async function doSetup() {
      const group = await getTokenValue(setupToken);
      await userSrv.createGroup(req.currentUser.name, group);
    }
    const specData = {result: 'OK'};
    sendJsonResponseWithPromise(res, doSetup, {specData})();
  });
}
