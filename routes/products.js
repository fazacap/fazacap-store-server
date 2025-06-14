async function mainRoute(fastify, options) {
  fastify.post('/api/products/get', async (request, reply) => {
    // Contoh akses data
    const data = fastify.database.dataProduk || [];
    return reply.send({ status: 200, data: data });
  });
  fastify.post('/api/products/view', async (request, reply) => {
    const { link } = request.body; // Ambil link dari body

    const data = fastify.database.dataProduk || [];
    const produk = data.find((item) => item.link === link);

    if (!produk) {
      return reply.status(404).send({ status: 404, message: 'Produk tidak ditemukan' });
    }

    return reply.send({ status: 200, data: produk });
  });
}

module.exports = mainRoute;
