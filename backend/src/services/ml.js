const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Send combined inputs to the ML service for career prediction.
 */
async function analyzeCombined({ filePath, originalName, github, certificatePath, certificateName }) {
  try {
    const form = new FormData();
    if (filePath && originalName) {
      form.append('file', fs.createReadStream(filePath), originalName);
    }
    if (github) {
      form.append('github', github);
    }
    if (certificatePath && certificateName) {
      form.append('certificate', fs.createReadStream(certificatePath), certificateName);
    }

    console.log(`[ml] Sending analysis to ML service: ${ML_SERVICE_URL}/analyze`);

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
    console.error('[ml] analyzeCombined error:', message);
    throw new Error(message);
  }
}

/** @deprecated Use analyzeCombined — kept for backward compatibility */
async function analyzeCV(filePath, originalName) {
  return analyzeCombined({ filePath, originalName });
}

async function generateRoadmap({ career, cvText, confidence, keySkills }) {
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/roadmap`,
      {
        career,
        cv_text: cvText,
        confidence,
        key_skills: keySkills,
      },
      { timeout: 120000 }
    );

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Roadmap service unavailable.';
    console.error('[ml] generateRoadmap error:', message);
    throw new Error(message);
  }
}

async function chatWithML(message, career = '', context = '', cvSummary = '', chatHistory = []) {
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/chat`,
      {
        message,
        career,
        context,
        cv_summary: cvSummary,
        chat_history: chatHistory,
      },
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

module.exports = { analyzeCV, analyzeCombined, generateRoadmap, chatWithML };
