/** Shared career taxonomy & roadmap content (mirrors frontend/src/data/roadmapData.js) */

const CAREER_NAMES = [
  'Software Development',
  'Data & AI',
  'Cybersecurity & Networking',
  'Product & Project Management',
  'UI/UX & Digital Design',
];

const ROADMAPS = {
  'Software Development': {
    phases: [
      {
        title: 'Phase 1 — Foundation (0-3 months)',
        description: 'Build core programming fundamentals and version control habits.',
        skills: ['Python or JavaScript', 'Git & GitHub', 'HTML/CSS basics', 'Problem solving on LeetCode'],
        resources: [
          { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' },
          { name: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu' },
        ],
      },
      {
        title: 'Phase 2 — Intermediate (3-6 months)',
        description: 'Learn frameworks, databases, and build full-stack projects.',
        skills: ['React or Django', 'REST APIs', 'PostgreSQL', 'Docker basics', 'Testing'],
        resources: [
          { name: 'The Odin Project', url: 'https://www.theodinproject.com' },
          { name: 'Coursera — Full Stack', url: 'https://www.coursera.org' },
        ],
      },
      {
        title: 'Phase 3 — Advanced (6-12 months)',
        description: 'Specialize, contribute to open source, and prepare for Rwanda tech roles.',
        skills: ['System design', 'CI/CD', 'Cloud (AWS/GCP)', 'Open source contributions'],
        resources: [
          { name: 'Andela Learning Community', url: 'https://andela.com' },
          { name: 'kLab Kigali', url: 'https://klab.rw' },
        ],
      },
    ],
  },
  'Data & AI': {
    phases: [
      {
        title: 'Phase 1 — Foundation (0-3 months)',
        description: 'Master Python, statistics, and data manipulation.',
        skills: ['Python', 'Pandas & NumPy', 'Statistics basics', 'SQL queries'],
        resources: [
          { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' },
          { name: 'Google Data Analytics Cert', url: 'https://grow.google/certificates' },
        ],
      },
      {
        title: 'Phase 2 — Intermediate (3-6 months)',
        description: 'Learn ML fundamentals and data visualization.',
        skills: ['Scikit-learn', 'Matplotlib/Seaborn', 'Jupyter notebooks', 'Data cleaning', 'A/B testing'],
        resources: [
          { name: 'Coursera — ML by Andrew Ng', url: 'https://www.coursera.org' },
          { name: 'fast.ai', url: 'https://www.fast.ai' },
        ],
      },
      {
        title: 'Phase 3 — Advanced (6-12 months)',
        description: 'Deep learning, MLOps, and real-world data projects.',
        skills: ['TensorFlow/PyTorch', 'Feature engineering', 'Model deployment', 'Big data tools'],
        resources: [
          { name: 'DeepLearning.AI', url: 'https://www.deeplearning.ai' },
          { name: 'YouTube — StatQuest', url: 'https://www.youtube.com/@statquest' },
        ],
      },
    ],
  },
  'Cybersecurity & Networking': {
    phases: [
      {
        title: 'Phase 1 — Foundation (0-3 months)',
        description: 'Understand networks, Linux, and security fundamentals.',
        skills: ['Networking (TCP/IP, DNS)', 'Linux CLI', 'Wireshark basics', 'Security concepts'],
        resources: [
          { name: 'CompTIA Network+ materials', url: 'https://www.comptia.org' },
          { name: 'TryHackMe — Beginner', url: 'https://tryhackme.com' },
        ],
      },
      {
        title: 'Phase 2 — Intermediate (3-6 months)',
        description: 'Hands-on penetration testing and security tools.',
        skills: ['Nmap & Burp Suite', 'Firewalls & VPNs', 'Cryptography basics', 'Incident response'],
        resources: [
          { name: 'Cybrary', url: 'https://www.cybrary.it' },
          { name: 'HackTheBox Academy', url: 'https://academy.hackthebox.com' },
        ],
      },
      {
        title: 'Phase 3 — Advanced (6-12 months)',
        description: 'Certifications and security operations for enterprise roles.',
        skills: ['SIEM tools', 'Cloud security', 'Threat hunting', 'Security audits'],
        resources: [
          { name: 'Coursera — Google Cybersecurity', url: 'https://www.coursera.org' },
          { name: 'YouTube — NetworkChuck', url: 'https://www.youtube.com/@NetworkChuck' },
        ],
      },
    ],
  },
  'Product & Project Management': {
    phases: [
      {
        title: 'Phase 1 — Foundation (0-3 months)',
        description: 'Learn agile methodology and product thinking basics.',
        skills: ['Agile & Scrum', 'User stories', 'Jira & Trello', 'Stakeholder communication'],
        resources: [
          { name: 'Coursera — Agile Development', url: 'https://www.coursera.org' },
          { name: 'Google Project Management Cert', url: 'https://grow.google/certificates' },
        ],
      },
      {
        title: 'Phase 2 — Intermediate (3-6 months)',
        description: 'Product discovery, roadmapping, and team coordination.',
        skills: ['Product roadmaps', 'KPIs & metrics', 'A/B testing', 'Cross-functional leadership'],
        resources: [
          { name: 'Product School (free resources)', url: 'https://productschool.com' },
          { name: 'YouTube — Product Alliance', url: 'https://www.youtube.com' },
        ],
      },
      {
        title: 'Phase 3 — Advanced (6-12 months)',
        description: 'Lead products and manage complex tech projects in Rwanda.',
        skills: ['OKRs', 'Budget management', 'Go-to-market strategy', 'Portfolio management'],
        resources: [
          { name: 'Andela Product roles', url: 'https://andela.com' },
          { name: 'kLab entrepreneurship programs', url: 'https://klab.rw' },
        ],
      },
    ],
  },
  'UI/UX & Digital Design': {
    phases: [
      {
        title: 'Phase 1 — Foundation (0-3 months)',
        description: 'Design principles, Figma basics, and user research fundamentals.',
        skills: ['Figma', 'Color theory & typography', 'User interviews', 'Wireframing'],
        resources: [
          { name: 'Google UX Design Certificate', url: 'https://grow.google/uxdesign' },
          { name: 'Interaction Design Foundation', url: 'https://www.interaction-design.org' },
        ],
      },
      {
        title: 'Phase 2 — Intermediate (3-6 months)',
        description: 'Prototyping, usability testing, and design systems.',
        skills: ['High-fidelity prototypes', 'Usability testing', 'Design systems', 'Accessibility (WCAG)'],
        resources: [
          { name: 'Coursera — UI/UX Specialization', url: 'https://www.coursera.org' },
          { name: 'YouTube — AJ&Smart', url: 'https://www.youtube.com/@AJSmart' },
        ],
      },
      {
        title: 'Phase 3 — Advanced (6-12 months)',
        description: 'Portfolio projects and UX roles in Rwanda tech ecosystem.',
        skills: ['UX case studies', 'Design sprints', 'Motion design', 'Design leadership'],
        resources: [
          { name: 'Dribbble — Portfolio inspiration', url: 'https://dribbble.com' },
          { name: 'kLab design workshops', url: 'https://klab.rw' },
        ],
      },
    ],
  },
};

module.exports = { CAREER_NAMES, ROADMAPS };
