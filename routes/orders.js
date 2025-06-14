async function mainRoute(fastify, options) {
  let temporaryOrders = [];

  // Simpan data order
  fastify.post('/api/orders/add', async (request, reply) => {
    const { dataTransaksi } = request.body;

    // Simpan ke array sementara
    temporaryOrders.push(dataTransaksi);

    return reply.send({ status: 200, message: 'success' });
  });

  // Ambil data order
  fastify.post('/api/orders/view', async (request, reply) => {
    const { orderId } = request.body; // Ambil link dari body

    const order = temporaryOrders.find((item) => item.referenceId === orderId);

    if (!order) {
      return reply.status(404).send({ status: 404, message: 'Pesanan tidak ditemukan' });
    }

    return reply.send({ status: 200, data: order });
  });
}

module.exports = mainRoute;
