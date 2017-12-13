import {requireLogin, userSrv} from './user';
import {
  uploadPath,
  tempPath,
} from '../../config';
import fs from 'fs';
import formidable from 'formidable';
import {sendJsonResponse} from './utils';
import {callbackToPromise, promiseToCallback} from 'higher-order-helper';

async function upload(file, bucket) {
  let fileName = uploadPath + '/' + file.hash + '.jpg';
  await callbackToPromise(fs.rename.bind(fs))(file.path, fileName);
  return {file_key: file.hash, ext: '.jpg'};
}

async function uploadAvatar(user, file) {
  const name = user.name;
  const avatar = await upload(file, 'avatar');
  if (!avatar) {
    throw new Error('upload avatar failed');
  }
  await userSrv.updateExtra(name, {avatar});
  return avatar;
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
