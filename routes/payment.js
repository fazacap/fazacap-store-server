const axios = require('axios');
const crypto = require('crypto');

async function mainRoute(fastify, options) {
  fastify.post('/api/payment/get', async (request, reply) => {
    const { dataTransaksi } = request.body;
    const va = '0000005359623294';
    const apiKey = 'SANDBOX1B5B52E0-4660-470F-8648-303206579F89';
    const method = 'POST';
    const url = 'https://sandbox.ipaymu.com/api/v2/payment';

    const requestBody = JSON.stringify(dataTransaksi);

    // 1. Hash body (SHA-256 lowercase hex)
    const bodyHash = crypto.createHash('sha256').update(requestBody).digest('hex').toLowerCase();

    // 2. Build stringToSign
    const stringToSign = `${method}:${va}:${bodyHash}:${apiKey}`;

    // 3. Signature = HMAC-SHA256 dari stringToSign, key-nya adalah apiKey
    const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');

    try {
      const response = await axios({
        method: 'post',
        url,
        headers: {
          'Content-Type': 'application/json',
          va: va,
          signature: signature,
        },
        data: dataTransaksi,
      });

      return reply.send({ status: 200, data: response.data });
    } catch (error) {
      console.error('Gagal request ke iPaymu:', error.response?.data || error.message);
      return reply.status(500).send({
        status: 'error',
        message: 'Gagal request ke iPaymu',
        detail: error.response?.data || error.message,
      });
    }
  });
}

module.exports = mainRoute;
