async function mainRoute(fastify, options) {
  fastify.post('/api/banners/get', async (request, reply) => {
    try {
      const result = await fastify.db.execute('SELECT * FROM tabel_baner');
      return { status: 200, data: result.rows };
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ status: 500, error: 'Database error' });
    }
  });
}

module.exports = mainRoute;
