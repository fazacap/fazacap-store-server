async function mainRoute(fastify, options) {
  let temporaryOrders = [];

  fastify.post('/api/orders/get', async (request, reply) => {
    const { dataTransaksi } = request.body;

    // Simpan ke array sementara
    temporaryOrders.push(dataTransaksi);

    return reply.send({ status: 200, message: 'success' });
  });

  fastify.post('/api/orders/add', async (request, reply) => {
    const { daftar_pesanan, alamat, jasa_kirim } = request.body;

    // Basic input validation
    if (!daftar_pesanan || !alamat || !jasa_kirim) {
      return reply.status(400).send({ status: 400, message: 'Data pesanan tidak lengkap. Pastikan daftar_pesanan dan alamat terisi.' });
    }

    // Generate order number, set default status, and get current date
    const no_pesanan = `ORD-${Date.now()}`; // Simple unique order number
    const status = 'pending'; // Default status for a new order
    const tanggal = new Date().toISOString(); // Current timestamp in ISO format

    try {
      // Insert new order data into the database
      const result = await fastify.db.query('INSERT INTO pesanan (no_pesanan, daftar_pesanan, status, alamat, tanggal,jasa_kirim) VALUES ($1, $2, $3, $4, $5)', [no_pesanan, daftar_pesanan, status, alamat, tanggal, jasa_kirim]);

      // Check if the insertion was successful (e.g., check rowCount or command)
      if (result.rowCount === 0) {
        // For PostgreSQL, rowCount indicates number of rows affected
        return reply.status(500).send({ status: 500, message: 'Gagal membuat pesanan.' });
      }

      // Send a success response
      return reply.status(201).send({
        status: 201,
        message: 'Pesanan berhasil dibuat.',
        data: {
          no_pesanan,
          daftar_pesanan,
          status,
          alamat,
          tanggal,
        },
      });
    } catch (err) {
      console.error('Error adding order:', err); // Log the error specifically for orders
      return reply.status(500).send({ status: 500, message: 'Terjadi kesalahan server saat menambahkan pesanan.' });
    }
  });

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
