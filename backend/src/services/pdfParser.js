const pdfParse = require('pdf-parse');

async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

function extractSkillsFromText(text) {
  const skillKeywords = [
    'javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker',
    'kubernetes', 'ux', 'research', 'data', 'analysis', 'policy',
    'backend', 'devops', 'git', 'typescript', 'java', 'mongodb',
  ];

  const lower = text.toLowerCase();
  return skillKeywords.filter((skill) => lower.includes(skill));
}

module.exports = { extractTextFromPdf, extractSkillsFromText };
