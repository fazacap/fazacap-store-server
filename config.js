// config.js
const path = require('path');

module.exports = {
  // Port server, ambil dari environment variable atau gunakan 3000 sebagai default
  port: process.env.PORT || 3000,

  // Direktori untuk file yang diunggah
  uploadDir: path.join(__dirname, 'uploads'),

  tokenSecret: process.env.TOKEN_SUPERSECRET,

  // Konfigurasi Turso database
  turso: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};
