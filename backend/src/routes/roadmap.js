const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { ROADMAPS } = require('../data/roadmapData');

const router = express.Router();

/**
 * GET /api/roadmap/:careerName
 */
router.get('/:careerName', authenticateToken, (req, res) => {
  const career = decodeURIComponent(req.params.careerName);
  const phases = ROADMAPS[career];

  if (!phases) {
    return res.status(404).json({
      success: false,
      error: 'Roadmap not found for this career',
    });
  }

  res.json({
    success: true,
    data: { career, phases: phases.phases },
  });
});

router.post('/download', authenticateToken, (req, res) => {
  const { careerName } = req.body;
  const roadmap = ROADMAPS[careerName];

  if (!roadmap) {
    return res.status(404).json({ success: false, error: 'Roadmap not found' });
  }

  const content = [
    `KarrerLenz Career Roadmap: ${careerName}`,
    '',
    ...roadmap.phases.map((phase, i) => {
      const skills = phase.skills?.join(', ') || '';
      const resources =
        phase.resources?.map((r) => `- ${r.name}: ${r.url}`).join('\n') || '';
      return [
        `${phase.title}`,
        phase.description,
        skills ? `Skills: ${skills}` : '',
        resources ? `Resources:\n${resources}` : '',
        '',
      ]
        .filter(Boolean)
        .join('\n');
    }),
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="roadmap-${careerName.replace(/\s+/g, '-')}.txt"`
  );
  res.send(content);
});

module.exports = router;
