import {generateToken} from '../lib/redis';
import promiseToCallback from 'higher-order-helper/promiseToCallback';


async function generateAdminToken() {
  const token = await generateToken('admin');
  console.log('Admin token:', token);
}

promiseToCallback(generateAdminToken)((err) => {
  if (err) {
    console.log(err);
  }
  console.log('Finish.');
});
