const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

async function runAnalysis(githubText, cvText, certText) {
  const { data } = await axios.post(`${ML_SERVICE_URL}/analyze`, {
    github_text: githubText || '',
    cv_text: cvText || '',
    cert_text: certText || '',
  });
  return data;
}

module.exports = { runAnalysis };
