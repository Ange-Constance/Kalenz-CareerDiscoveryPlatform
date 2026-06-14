const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Send a CV file to the ML service for career prediction.
 * @param {string} filePath - Absolute path to the uploaded CV file
 * @param {string} originalName - Original filename for the multipart upload
 */
async function analyzeCV(filePath, originalName) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), originalName);

    console.log(`[ml] Sending CV to ML service: ${ML_SERVICE_URL}/analyze`);

    const { data } = await axios.post(`${ML_SERVICE_URL}/analyze`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.message ||
      'ML service unavailable. Please ensure ml-service is running.';

    console.error('[ml] analyzeCV error:', message);
    throw new Error(message);
  }
}

/**
 * Forward chat message to ML service.
 */
async function chatWithML(message, career = '', context = '') {
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/chat`,
      { message, career, context },
      { timeout: 60000 }
    );

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Chat service unavailable.';
    console.error('[ml] chatWithML error:', message);
    throw new Error(message);
  }
}

module.exports = { analyzeCV, chatWithML };
