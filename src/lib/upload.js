import {requireLogin, userSrv, getUser} from './user';
import {
  uploadPath,
  tempPath,
  article as articleConfig,
} from '../../config';
import fs from 'fs';
import formidable from 'formidable';
import {sendJsonResponse} from './utils';
import {ArticleService} from 'yuntan-service';
import {callbackToPromise, promiseToCallback} from 'higher-order-helper';

export const articleSrv = new ArticleService(articleConfig);

async function upload(file, bucket) {
  let fileName = uploadPath + '/' + file.hash + '.jpg';
  await callbackToPromise(fs.rename.bind(fs))(file.path, fileName);
  return await articleSrv.saveFile(file.hash, bucket);
}

async function uploadAvatar(user, file) {
  const name = user.name;
  const avatar = await upload(file, 'avatar');
  if (!avatar) {
    throw new Error('upload avatar failed');
  }
  await userSrv.updateExtra(name, {avatar});
  return await getUser(name);
}

export function route(app) {
  app.post('/api/avatar_upload', requireLogin(), (req, res) => {
    const form = new formidable.IncomingForm();
    form.hash = 'sha1';
    form.uploadDir = tempPath;
    form.parse(req, (err, fields, files) => {
      if (!files || !files.file) {
        return res.status(500).json({
          err: 'please choose a file',
        });
      }
      promiseToCallback(uploadAvatar)(req.currentUser, files.file, (err, file) => {
        fs.unlink(files.file.path, () => {
          sendJsonResponse(res, err, file);
        });
      });
    });
  });
}
