const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const ROADMAPS = {
  'UX Research': {
    current_fit: 45,
    target_fit: 85,
    timeline: [
      { week: '1-2', title: 'Foundations of UX Research', description: 'Complete Google UX Design Certificate modules 1-2. Practice writing research plans.', impact: 15 },
      { week: '3-4', title: 'Conduct User Interviews', description: 'Run 5 user interviews with local tech users. Document findings in a case study.', impact: 20 },
      { week: '5-6', title: 'Portfolio Project', description: 'Build a UX research portfolio with 2 case studies showcasing your process.', impact: 25 },
      { week: '7-8', title: 'Apply & Network', description: 'Apply to Andela UX roles. Attend kLab Kigali design meetups.', impact: 20 },
    ],
    opportunities: [
      { name: 'Google UX Design Certificate', description: 'Free online certificate covering UX fundamentals.', link: 'https://grow.google/uxdesign/', deadline: 'Rolling' },
      { name: 'Andela', description: 'Remote UX research opportunities for African talent.', link: 'https://andela.com/', deadline: 'Rolling' },
      { name: 'kLab Kigali', description: 'Local innovation hub with design workshops.', link: 'https://klab.rw/', deadline: 'Rolling' },
    ],
  },
  'Health Data': {
    current_fit: 45,
    target_fit: 85,
    timeline: [
      { week: '1-2', title: 'SQL & Data Fundamentals', description: 'Master SQL queries and data cleaning with pandas.', impact: 15 },
      { week: '3-4', title: 'Healthcare Data Standards', description: 'Learn FHIR, HL7, and health data privacy regulations.', impact: 20 },
      { week: '5-6', title: 'Dashboard Project', description: 'Build a health analytics dashboard with real public datasets.', impact: 25 },
      { week: '7-8', title: 'Apply to Health Tech', description: 'Connect with Rwanda Biomedical Center and health startups.', impact: 20 },
    ],
    opportunities: [
      { name: 'Rwanda Biomedical Center', description: 'Health data internship programs.', link: 'https://rbc.gov.rw/', deadline: 'Rolling' },
      { name: 'Andela Data Track', description: 'Remote data engineering roles.', link: 'https://andela.com/', deadline: 'Rolling' },
      { name: 'kLab Health Tech', description: 'Health innovation programs at kLab.', link: 'https://klab.rw/', deadline: 'Rolling' },
    ],
  },
  Policy: {
    current_fit: 45,
    target_fit: 85,
    timeline: [
      { week: '1-2', title: 'Tech Policy Foundations', description: 'Study Rwanda ICT policy framework and digital economy strategy.', impact: 15 },
      { week: '3-4', title: 'Research & Writing', description: 'Write 2 policy briefs on tech regulation topics.', impact: 20 },
      { week: '5-6', title: 'Stakeholder Analysis', description: 'Map key stakeholders in Rwanda tech policy ecosystem.', impact: 25 },
      { week: '7-8', title: 'Apply to Policy Roles', description: 'Apply to MINICT and think tank opportunities.', impact: 20 },
    ],
    opportunities: [
      { name: 'MINICT Programs', description: 'Ministry of ICT and Innovation internships.', link: 'https://www.minict.gov.rw/', deadline: 'Rolling' },
      { name: 'ACET Rwanda', description: 'African Center for Economic Transformation.', link: 'https://acetforafrica.org/', deadline: 'Rolling' },
      { name: 'kLab Policy Lab', description: 'Tech policy discussions and workshops.', link: 'https://klab.rw/', deadline: 'Rolling' },
    ],
  },
  Backend: {
    current_fit: 45,
    target_fit: 85,
    timeline: [
      { week: '1-2', title: 'API Design & Node.js', description: 'Build RESTful APIs with Express. Learn authentication patterns.', impact: 15 },
      { week: '3-4', title: 'Database Mastery', description: 'Deep dive into PostgreSQL, indexing, and query optimization.', impact: 20 },
      { week: '5-6', title: 'Full-Stack Project', description: 'Build a production-ready backend with tests and documentation.', impact: 25 },
      { week: '7-8', title: 'Apply & Deploy', description: 'Deploy to Railway/Render. Apply to Andela backend track.', impact: 20 },
    ],
    opportunities: [
      { name: 'Andela Backend Track', description: 'Remote backend engineering roles.', link: 'https://andela.com/', deadline: 'Rolling' },
      { name: 'kLab Developer Program', description: 'Backend development bootcamps in Kigali.', link: 'https://klab.rw/', deadline: 'Rolling' },
      { name: 'Google Cloud Skills', description: 'Free cloud and backend certifications.', link: 'https://cloud.google.com/training', deadline: 'Rolling' },
    ],
  },
  DevOps: {
    current_fit: 45,
    target_fit: 85,
    timeline: [
      { week: '1-2', title: 'Docker & Containers', description: 'Containerize applications. Learn Docker Compose workflows.', impact: 15 },
      { week: '3-4', title: 'CI/CD Pipelines', description: 'Set up GitHub Actions. Automate testing and deployment.', impact: 20 },
      { week: '5-6', title: 'Cloud Infrastructure', description: 'Deploy to AWS/GCP. Learn Terraform basics.', impact: 25 },
      { week: '7-8', title: 'Certification & Apply', description: 'Pursue AWS Cloud Practitioner. Apply to DevOps roles.', impact: 20 },
    ],
    opportunities: [
      { name: 'AWS Training', description: 'Free cloud practitioner training.', link: 'https://aws.amazon.com/training/', deadline: 'Rolling' },
      { name: 'Andela DevOps', description: 'Remote DevOps and SRE roles.', link: 'https://andela.com/', deadline: 'Rolling' },
      { name: 'kLab Cloud Workshop', description: 'Cloud and DevOps workshops in Kigali.', link: 'https://klab.rw/', deadline: 'Rolling' },
    ],
  },
};

/**
 * @swagger
 * /roadmap/{careerName}:
 *   get:
 *     summary: Get career roadmap
 *     tags: [Roadmap]
 */
router.get('/:careerName', authenticateToken, (req, res) => {
  const careerName = decodeURIComponent(req.params.careerName);
  const roadmap = ROADMAPS[careerName];

  if (!roadmap) {
    return res.status(404).json({ error: 'Roadmap not found for this career' });
  }

  res.json(roadmap);
});

router.post('/download', authenticateToken, (req, res) => {
  const { careerName } = req.body;
  const roadmap = ROADMAPS[careerName];

  if (!roadmap) {
    return res.status(404).json({ error: 'Roadmap not found' });
  }

  const content = [
    `KarrerLenz Career Roadmap: ${careerName}`,
    `Current Fit: ${roadmap.current_fit}% | Target Fit: ${roadmap.target_fit}%`,
    '',
    'Timeline:',
    ...roadmap.timeline.map((t) => `Week ${t.week}: ${t.title}\n  ${t.description}\n  Impact: +${t.impact}%`),
    '',
    'Opportunities:',
    ...roadmap.opportunities.map((o) => `- ${o.name}: ${o.description} (${o.link})`),
  ].join('\n');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="roadmap-${careerName.replace(/\s+/g, '-')}.txt"`);
  res.send(content);
});

module.exports = router;
