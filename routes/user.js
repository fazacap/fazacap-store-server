const argon2 = require('argon2'); // Menggunakan require()

async function mainRoute(fastify, options) {
  fastify.post('/api/user/login', async (request, reply) => {
    const { email, password } = request.body;

    try {
      const result = await fastify.db.query('SELECT id, nama, alamat, password FROM pengguna WHERE "email" = $1', [email]); // Ambil ID juga!

      if (result.rows.length === 0) {
        return reply.status(404).send({ status: 404, message: 'User Not Found' });
      }

      const userData = result.rows[0];
      const hashedPassword = userData.password;

      const isPasswordValid = await argon2.verify(hashedPassword, password);

      if (!isPasswordValid) {
        return reply.status(401).send({ status: 401, message: 'Email or Password not match' });
      }

      // Hapus hashed_password sebelum membuat token atau mengirim ke klien
      delete userData.password;

      // Buat token autentikasi (contoh dengan JWT, Anda perlu menginstal @fastify/jwt)
      const token = fastify.jwt.sign({ id: userData.id, email: userData.email, role: userData.role || 'user' }, { expiresIn: '1h' }); // Tambahkan role jika ada

      return reply.send({
        status: 200,
        data: {
          token: token,
          user: {
            id: userData.id,
            nama: userData.nama,
            email: userData.email, // Penting jika Anda tidak menyimpannya di token
            alamat: userData.alamat,
            // ... data lain yang relevan (misalnya, role)
          },
        },
        message: 'Login Berhasil!',
      });
    } catch (err) {
      console.error('Login Error:', err);
      return reply.status(500).send({ status: 500, message: 'Server error' });
    }
  });

  fastify.post('/api/user/add', async (request, reply) => {
    const { nama, email, password } = request.body;

    // Validasi input dasar
    if (!nama || !email || !password) {
      return reply.status(400).send({ status: 400, message: 'Nama, email, dan kata sandi harus diisi.' });
    }

    try {
      // 1. Periksa apakah email sudah terdaftar
      const userExists = await fastify.db.query('SELECT id FROM pengguna WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return reply.status(409).send({ status: 409, message: 'Email sudah terdaftar.' });
      }

      // 2. Hash kata sandi menggunakan Argon2
      const hashedPassword = await argon2.hash(password);

      // 3. Masukkan data pengguna baru ke database
      const result = await fastify.db.query('INSERT INTO pengguna (nama, email, password) VALUES ($1, $2, $3) RETURNING id, nama, email', [nama, email, hashedPassword]);

      // Pastikan ada baris yang dikembalikan setelah insert
      if (result.rows.length === 0) {
        return reply.status(500).send({ status: 500, message: 'Gagal menambahkan pengguna.' });
      }

      // Mengirimkan respons sukses dengan data pengguna baru (tanpa hashed_password)
      return reply.status(201).send({
        status: 201,
        message: 'Pengguna berhasil ditambahkan.',
        data: result.rows[0], // Mengandung id, nama, dan email pengguna baru
      });
    } catch (err) {
      console.error('Error adding user:', err); // Log error lebih spesifik
      return reply.status(500).send({ status: 500, message: 'Server error saat menambahkan pengguna.' });
    }
  });

  fastify.post('/api/user/cart', async (request, reply) => {
    const { nomorHP } = request.body;

    try {
      const result = await fastify.db.query('SELECT * FROM produk WHERE link = $1 LIMIT 1', [link]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ status: 404, message: 'Produk tidak ditemukan' });
      }

      return reply.send({ status: 200, data: result.rows[0] });
    } catch (err) {
      console.error('DB Error:', err);
      return reply.status(500).send({ status: 500, message: 'Server error' });
    }
  });

  fastify.post('/api/user/order', async (request, reply) => {
    const { nomorHP } = request.body;

    try {
      const result = await fastify.db.query('SELECT * FROM produk WHERE link = $1 LIMIT 1', [link]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ status: 404, message: 'Produk tidak ditemukan' });
      }

      return reply.send({ status: 200, data: result.rows[0] });
    } catch (err) {
      console.error('DB Error:', err);
      return reply.status(500).send({ status: 500, message: 'Server error' });
    }
  });
}

module.exports = mainRoute;
