import {UserService} from 'yuntan-service';
import {user as config} from '../../../config';
import {generateToken} from '../redis';

export const userSrv = new UserService(config);

function generateServiceName(service, name) {
  return `${service}-${name}`;
}

export async function doBind(username, {service, name, extra}) {
  await userSrv.createBind(username, {service, name: generateServiceName(service, name), extra});
}

export async function doSignin(username) {
  return await generateToken(username);
}

export async function getUser(ident, services = []) {
  let user;
  try {
    user = await userSrv.get(ident);
  } catch (e) {
    let bind;
    for (let service of services) {
      try {
        bind = await userSrv.getBind(generateServiceName(service, ident));
        user = await userSrv.get(bind.user_id);
        break;
      } catch (e) {

      }
    }
  }
  if (!user) {
    throw new Error('User not found.');
  }
  return user;
}
