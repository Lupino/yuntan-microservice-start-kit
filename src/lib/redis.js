import {redis as config} from '../../config';
import redisLib from 'redis';
import {v4 as uuid} from 'uuid';
import {callbackToPromise} from './utils';

export const rawRedis = redisLib.createClient(config);

export const setex = callbackToPromise(rawRedis.setex.bind(rawRedis));
export const get = callbackToPromise(rawRedis.get.bind(rawRedis));
export const del = callbackToPromise(rawRedis.del.bind(rawRedis));

export async function generateToken(name) {
  const token = uuid();
  const key = `token:${token}`;
  await setex([key, 604800, name]);
  return token;
}

export function getTokenValue(token) {
  const key = `token:${token}`;
  return get(key);
}

export function removeToken(token) {
  const key = `token:${token}`;
  return del(key);
}
