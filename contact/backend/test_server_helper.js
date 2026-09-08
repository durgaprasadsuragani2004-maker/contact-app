const net = require('net');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function isPortInUse(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(400);
    client.once('connect', () => {
      client.destroy();
      resolve(true);
    });
    client.once('error', () => {
      client.destroy();
      resolve(false);
    });
    client.once('timeout', () => {
      client.destroy();
      resolve(false);
    });
    client.connect(port, '127.0.0.1');
  });
}

async function ensureServerRunning(port = 5001) {
  const inUse = await isPortInUse(port);
  if (inUse) {
    return {
      started: false,
      stop: async () => {}
    };
  }

  console.log(`ℹ️ Server not detected on port ${port}. Starting temporary server for tests...`);
  const { start } = require('./server');
  const server = await start();
  // Small delay to ensure ready
  await new Promise(r => setTimeout(r, 300));
  return {
    started: true,
    stop: async () => {
      await new Promise((resolve) => server.close(resolve));
      const mongo = require('./database/mongo');
      if (mongo.mongoose && mongo.mongoose.connection) {
        await mongo.mongoose.connection.close();
      }
    }
  };
}

module.exports = { ensureServerRunning };
