async function mainRoute(fastify, options) {
  fastify.post('/api/products/get', async (request, reply) => {
    try {
      const result = await fastify.db.execute('SELECT * FROM tabel_produk');
      return { status: 200, data: result.rows };
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ status: 500, error: 'Database error' });
    }
  });

  fastify.post('/api/products/view', async (request, reply) => {
    const { link } = request.body;

    try {
      const result = await fastify.db.execute('SELECT * FROM tabel_produk WHERE link_produk = $1 LIMIT 1', [link]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ status: 404, message: 'Produk tidak ditemukan' });
      }

      return reply.send({ status: 200, data: result.rows[0] });
    } catch (err) {
      console.error('DB Error:', err);
      return reply.status(500).send({ status: 500, message: 'Server error' });
    }
  });

  fastify.post('/api/products/search', async (request, reply) => {
    const { produk } = request.body;

    try {
      const result = await fastify.db.query('SELECT * FROM produk WHERE nama ILIKE $1', [`%${produk}%`]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ status: 404, message: 'Produk tidak ditemukan' });
      }

      return reply.send({ status: 200, data: result.rows });
    } catch (err) {
      console.error('DB Error:', err);
      return reply.status(500).send({ status: 500, message: 'Server error' });
    }
  });

  fastify.post('/api/products/delete', async (request, reply) => {
    const { link } = request.body;

    try {
      // Menggunakan query DELETE
      const result = await fastify.db.execute('DELETE FROM tabel_produk WHERE link_produk = $1', [link]);

      // Mengecek apakah ada baris yang terhapus (rowCount)
      if (result.rowCount === 0) {
        return reply.status(404).send({
          status: 404,
          message: 'Produk tidak ditemukan atau sudah dihapus',
        });
      }

      return reply.send({
        status: 200,
        message: 'Produk berhasil dihapus',
      });
    } catch (err) {
      console.error('DB Error:', err);
      return reply.status(500).send({
        status: 500,
        message: 'Gagal menghapus data',
      });
    }
  });

  fastify.post('/api/products/add', async (request, reply) => {
    const { nama, harga, stok, berat, terjual, deskripsi, diskon, gambar, video } = request.body;

    const link = nama.replaceAll(' ', '-');
    const timestamp = Date.now();

    // Access the uploaded file via request.file if a single file is expected,
    const data = await request.file(); // Get the file stream from the multipart request

    function videoEmbed(url) {
      // Regex untuk ambil video ID dari berbagai format
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
      if (!match) return null; // kalau link tidak valid
      const videoId = match[1];
      return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0`;
    }

    // Basic input validation for product fields
    if (!nama || harga === undefined || stok === undefined || berat === undefined || !deskripsi) {
      return reply.status(400).send({ status: 400, message: 'Data produk tidak lengkap. Pastikan nama, harga, stok, berat, dan deskripsi terisi.' });
    }

    let imageUrl = null; // Initialize imageUrl to null

    if (data) {
      // Process the uploaded image
      const filename = `${link}-${timestamp}${path.extname(data.filename)}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      try {
        // Save the file to the server's disk
        await fs.writeFile(filePath, await data.toBuffer());
        imageUrl = `/uploads/images/product/${filename}`; // Store the public path to access the image
        // For example, using fastify.register(require('@fastify/static'), { root: path.join(__dirname, 'uploads'), prefix: '/uploads/' })
      } catch (uploadErr) {
        console.error('Error saving image file:', uploadErr);
        return reply.status(500).send({ status: 500, message: 'Gagal menyimpan gambar produk.' });
      }
    }

    try {
      // Insert new product data into the database, including the imageUrl
      const result = await fastify.db.query(
        'INSERT INTO produk (link, nama, harga, stok, berat, terjual, deskripsi, gambar, diskon) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [link, nama, harga, stok, berat, terjual || 0, deskripsi, imageUrl, diskon || 0], // Use imageUrl here
      );

      // Ensure a row was returned after insertion
      if (result.rows.length === 0) {
        // If image was saved but database insertion failed, consider deleting the image
        if (imageUrl) {
          await fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl))).catch((err) => console.error('Error deleting unsaved image:', err));
        }
        return reply.status(500).send({ status: 500, message: 'Gagal menambahkan produk. Tidak ada baris yang dikembalikan.' });
      }

      // Send a success response with the new product data (you might want to return the full product data here)
      return reply.status(201).send({
        status: 201,
        message: 'Produk berhasil ditambahkan.',
        product: result.rows[0], // Optionally return the newly created product
      });
    } catch (err) {
      console.error('Error adding product to database:', err); // Log the error more specifically
      // If database insertion fails after image upload, attempt to clean up the uploaded image
      if (imageUrl) {
        await fs.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl))).catch((err) => console.error('Error deleting unsaved image:', err));
      }
      return reply.status(500).send({ status: 500, message: 'Terjadi kesalahan server saat menambahkan produk.' });
    }
  });
}

module.exports = mainRoute;
