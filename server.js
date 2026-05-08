require('dotenv').config();

const fastify = require('fastify')({ logger: false });
const config = require('./config');

// Plugin dan konfigurasi lainnya
fastify.register(require('@fastify/cors'), { origin: ['http://localhost:9000', 'http://localhost:9100', 'https://store.fazacap.com'] });
fastify.register(require('./plugins/db')); // Daftarkan rute aplikasi

fastify.register(require('./routes/banners'));
fastify.register(require('./routes/orders'));
fastify.register(require('./routes/payment'));
fastify.register(require('./routes/products'));
fastify.register(require('./routes/user'));

fastify.register(require('@fastify/multipart'), {
  attachFieldsToBody: true, // This makes non-file fields available in request.body
});

fastify.register(require('@fastify/static'), {
  root: config.uploadDir,
  prefix: '/uploads/',
});

fastify.register(require('@fastify/jwt'), {
  secret: config.tokenSecret,
});

fastify.addHook('onRequest', async (request, reply) => {
  console.log(`Request: ${request.method} ${request.url}`);
});

fastify.setNotFoundHandler((request, reply) => {
  reply.status(200).send('');
});

const init = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`\x1b[34m Server API running at port:${config.port} \x1b[0m`);
  } catch (err) {
    console.error('\x1b[31m Error starting server: \x1b[0m', err);
    process.exit(1);
  }
};

init();
