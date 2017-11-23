const path = require('path');

module.exports = {
  tempPath: path.join(__dirname, 'public', 'temp'),
  uploadPath: path.join(__dirname, 'public', 'upload'),
  host: 'http://example.com',
  errorPage: 'http://example.com/error.html',
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0,
    prefix: 'example:',
  },
  user: {
    host: 'http://gw.example.com',
    key: 'user-key',
    secret: 'user-secret',
  },
  article: {
    host: 'http://gw.example.com',
    key: 'article-key',
    secret: 'article-secret',
  },
  coin: {
    host: 'http://gw.example.com',
    key: 'coin-key',
    secret: 'coin-secret',
  },
  weixin: {
    appid: 'appid',
    secret: 'secret',
  },
};
