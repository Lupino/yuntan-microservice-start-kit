import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import http from 'http';
import cors from 'cors';

import {route as userRoute, currentUser} from './lib/user';
import {route as uploadRoute} from './lib/upload';
import {route as serviceRoute} from './lib/service';

const server = express();
server.set('port', process.env.PORT || 3000);
server.set('host', process.env.HOST || '127.0.0.1');

server.use(cors());
server.use(bodyParser.urlencoded({extended: false, limit: '512kb'}));
server.use(bodyParser.json());
server.use(methodOverride());
server.use(currentUser());

userRoute(server);
uploadRoute(server);
serviceRoute(server);

http.createServer(server).listen(server.get('port'), server.get('host'), () => {
  /* eslint-disable no-console */
  console.log('Express server listening on port ' + (server.get('port')));
  /* eslint-enable no-console */
});
