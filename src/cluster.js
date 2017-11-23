import cluster from 'cluster';
import os from 'os';
const numCPUs = os.cpus().length;

/* eslint-disable no-console */
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i=0; i<numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  require('./app');
  console.log(`Worker ${process.pid} started`);
}
/* eslint-enable no-console */
