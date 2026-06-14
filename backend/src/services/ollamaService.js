const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

async function generateWithOllama(prompt) {
  try {
    const { data } = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      { model: OLLAMA_MODEL, prompt, stream: false },
      { timeout: 60000 }
    );
    return data.response;
  } catch (err) {
    console.warn('Ollama unavailable, using fallback:', err.message);
    return null;
  }
}

async function generateNarrative(topCareer, competencies) {
  const compList = Object.entries(competencies || {})
    .map(([skill, score]) => `- ${skill}: ${Math.round(score * 100)}%`)
    .join('\n');

  const prompt = `A person has these competencies:\n${compList}\n\nTheir best-fit career is ${topCareer}.\n\nWrite a 2-3 sentence narrative explaining why this is a good fit. Be specific about how their competencies match this career.`;

  const response = await generateWithOllama(prompt);
  if (response) return response.trim();

  return `Based on your evidence, ${topCareer} aligns well with your demonstrated skills. Your strongest competencies suggest you would thrive in roles that leverage your technical and analytical abilities.`;
}

async function generateChatResponse(message, context) {
  const contextStr = context
    ? `User is on step: ${context.step || 'dashboard'}. Analysis ID: ${context.analysisId || 'none'}.`
    : '';

  const prompt = `You are KarrerLenz Career Assistant, helping Rwandan tech graduates discover careers.\n${contextStr}\n\nUser: ${message}\n\nAssistant:`;

  const response = await generateWithOllama(prompt);
  if (response) return response.trim();

  return "I'm here to help with your career journey! Upload your GitHub, certificates, or CV to get personalized recommendations. What would you like to know?";
}

module.exports = { generateNarrative, generateChatResponse, generateWithOllama };
