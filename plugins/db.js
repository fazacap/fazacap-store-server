// plugins/db.js
const fp = require('fastify-plugin');
const { createClient } = require('@libsql/client');
const config = require('../config');

// Gunakan fastify-plugin agar plugin ini bisa digunakan di handler rute
async function dbConnector(fastify, options) {
  try {
    const client = createClient({
      url: config.turso.url,
      authToken: config.turso.authToken,
    });

    // Uji koneksi
    await client.execute('SELECT 1');
    fastify.log.info('Successfully connected to Turso database!');

    // Tambahkan klien database ke instance Fastify
    fastify.decorate('db', client);
  } catch (err) {
    fastify.log.error('Failed to connect to Turso database:', err);
    throw err; // Hentikan server jika koneksi gagal
  }
}

module.exports = fp(dbConnector);
