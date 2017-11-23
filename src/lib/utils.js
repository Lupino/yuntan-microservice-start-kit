import fetch_ from 'isomorphic-fetch';
import qs from 'querystring';
import FormData from 'form-data';

import omit from 'lodash.omit';
import mapValues from 'lodash.mapvalues';
import map from 'lodash.map';
import isPlainObject from 'lodash.isplainobject';

import ShortUUID from 'shortuuid';
export const stringGenerator = new ShortUUID('0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

export function fetch(url, options = {}) {
  if (options.body) {
    options.headers = options.headers || {};
    if (Array.isArray(options.body)) {
      options.headers['content-type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    } else if (typeof options.body === 'object') {
      if (!(options.body instanceof FormData)) {
        options.headers['content-type'] =
          'application/x-www-form-urlencoded;charset=UTF-8';
        options.body = qs.stringify(options.body);
      }
    }
  }
  return fetch_(url, options);
}

export async function fetchJSON(url, options, spec=null) {
  if (typeof options === 'string') {
    spec = options;
    options = {};
  }
  options = options || {};
  options['Accept'] = 'application/json';
  const rsp = await fetch_(url, options);
  if (/application\/json/.test(rsp.headers.get('content-type'))) {
    const data = await rsp.json();
    if (data.err) {
      throw new Error(data.err);
    }
    if (spec) {
      return data[spec];
    }
    return data;
  }

  const err = await rsp.text();
  throw new Error(err);
}

export function promiseToCallback(promiseFunction) {
  return (...argv) => {
    const callback = argv.pop();
    promiseFunction(...argv)
      .then((...ret) => callback(null, ...ret))
      .catch((err) => callback(err));
  };
}

export function callbackToPromise(callbackFunction) {
  return (...argv) => {
    return new Promise((resolve, reject) => {
      callbackFunction(...argv, (err, ...ret) => {
        if (err) return reject(err);
        resolve(...ret);
      });
    });
  };
}

function secure(data) {
  return omit(data, ['__v', '_id']);
}

function cleanPlainObject(obj) {
  obj = secure(obj);
  return mapValues(obj, cleanObj);
}

function cleanArray(obj) {
  return map(obj, cleanObj);
}

function cleanObj(obj) {
  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  }
  if (isPlainObject(obj)) {
    return cleanPlainObject(obj);
  }
  if (Array.isArray(obj)) {
    return cleanArray(obj);
  }
  return obj;
}

export function sendJsonResponse(res, err, data={}, errStatus=500) {
  if (err) {
    if (typeof err === 'string') {
      res.status(errStatus).json({err});
    } else if (err instanceof Error) {
      res.status(errStatus).json({err: err.message});
    } else {
      res.status(errStatus).json({err: 'Unknow'});
    }
  } else {
    res.json(cleanObj(data));
  }
}

export function sendJsonResponseWithPromise(res, promiseFunction,
  {spec=undefined, errStatus=undefined, specData=undefined} = {}) {
  return (...argv) => {
    promiseToCallback(promiseFunction)(...argv, (err, data) => {
      if (specData) {
        data = specData;
      }
      if (spec) {
        sendJsonResponse(res, err, {[spec]: data}, errStatus);
      } else {
        sendJsonResponse(res, err, data, errStatus);
      }
    });
  };
}
