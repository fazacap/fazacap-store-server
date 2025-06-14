const fastify = require('fastify')({ logger: false });
const path = require('path');
const fs = require('fs');
const serverPort = 8010;

// Load database.json
const databasePath = path.join(__dirname, 'database.json');
const databaseData = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

// Share ke seluruh app
fastify.decorate('database', databaseData);

// Plugin dan konfigurasi lainnya
fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.setNotFoundHandler((request, reply) => {
  reply.status(200).send('');
});

fastify.register(require('./routes/orders'));
fastify.register(require('./routes/payment'));
fastify.register(require('./routes/products'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

fastify.register(require('@fastify/static'), {
  root: uploadDir,
  prefix: '/uploads/',
});

fastify.addHook('onRequest', async (request, reply) => {
  console.log(`Request: ${request.method} ${request.url}`);
});

const init = async () => {
  try {
    await fastify.listen({ port: serverPort, host: '0.0.0.0' });
    console.log(`\x1b[34m Server API running at port:${serverPort} \x1b[0m`);
  } catch (err) {
    console.error('\x1b[31m Error starting server: \x1b[0m', err);
    process.exit(1);
  }
};

init();
