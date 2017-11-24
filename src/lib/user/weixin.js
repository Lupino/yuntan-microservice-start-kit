import {weixin, host, errorPage} from '../../../config';
import qs from 'querystring';
import {userSrv, getUser, doBind, doSignin} from './common';
import {
  promiseToCallback,
  sendJsonResponse,
  fetchJSON,
  stringGenerator,
} from '../utils';

function getWxAccessToken(code) {
  const {appid, secret} = weixin;
  const q = qs.stringify({appid, secret, code, grant_type: 'authorization_code'});
  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?${q}`;
  return fetchJSON(url);
}

function getWxUserInfo({access_token, openid}) {
  const q = qs.stringify({access_token, openid, lang: 'zh_CN'});
  const url = `https://api.weixin.qq.com/sns/userinfo?${q}`;
  return fetchJSON(url);
}

async function signinOrSignupHandler_(code) {
  const token = await getWxAccessToken(code);
  const uinfo = await getWxUserInfo(token);

  const unionid = uinfo.unionid || uinfo.openid;

  if (!unionid) {
    throw new Error(uinfo);
  }

  let user;
  try {
    user = await getUser(unionid, ['weixin']);
  } catch (e) {
    const passwd = stringGenerator.random(10);
    user = await userSrv.create({username: unionid, passwd});
    await doBind({service: 'weixin', name: unionid, unionid});
  }
  if (!user) {
    throw new Error('signinOrSignup Error');
  }
  return await doSignin(user.name);
}

function signinOrSignupHandler(req, res) {
  const {code, next} = req.query;
  promiseToCallback(signinOrSignupHandler_)(code, (err, token) => {
    if (next) {
      if (err) {
        res.redirect(errorPage);
      } else {
        if (next.indexOf('?') > -1) {
          res.redirect(`${next}&token=${token}`);
        } else {
          res.redirect(`${next}?token=${token}`);
        }
      }
    } else {
      sendJsonResponse(res, err, {token}, 400);
    }
  });
}

export function route(app) {
  app.get('/api/signinOrSignupByWeixin/', signinOrSignupHandler);

  app.get('/api/weixinAuth/', (req, res) => {
    const {next} = req.query;
    const q = qs.stringify({
      appid: weixin.appid,
      redirect_uri: `${host}/api/signinOrSignupByWeixin/?${qs.stringify({next})}`,
      response_type: 'code',
      scope: 'snsapi_userinfo',
      state: 1,
    });
    res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?${q}#wechat_redirect`);
  });
}
