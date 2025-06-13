const fastify = require('fastify')({ logger: false });
const serverPort = 8010;

fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.setNotFoundHandler((request, reply) => {
  reply.status(200).send('');
});

fastify.register(require('./routes/payment'));

fastify.addHook('onRequest', async (request, reply) => {
  console.log(`Request: ${request.method} ${request.url}`);
});

const init = async () => {
  try {
    await fastify.listen({ port: serverPort, host: '0.0.0.0' });
    console.log(`\x1b[34m Server API running at port:${serverPort} \x1b[0m`);

    /////////////////////////////////////////////////
  } catch (err) {
    console.error('\x1b[31m Error starting server: \x1b[0m', err);
    process.exit(1);
  }
};

init();
