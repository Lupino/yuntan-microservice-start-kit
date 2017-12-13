import omit from 'lodash.omit';
import mapValues from 'lodash.mapvalues';
import map from 'lodash.map';
import isPlainObject from 'lodash.isplainobject';
import promiseToCallback from 'higher-order-helper/promiseToCallback';

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
