const MOCK_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Docker',
  'Kubernetes', 'GraphQL', 'REST APIs', 'Git', 'CI/CD', 'AWS', 'Redis', 'PostgreSQL',
  'Tailwind CSS', 'Next.js', 'WebRTC', 'System Design', 'Microservices', 'Prometheus',
];

const BULLET_IMPROVEMENTS = [
  {
    original: 'Built features for the web app using React and JavaScript.',
    improved: 'Engineered 12+ production features in React/TypeScript, reducing user drop-off by 23% across the checkout flow.',
  },
  {
    original: 'Worked with the backend team to fix API issues.',
    improved: 'Collaborated cross-functionally to resolve 40+ REST API integration bugs, cutting average response latency by 35ms.',
  },
  {
    original: 'Made the website faster by optimizing images and lazy loading.',
    improved: 'Optimized Core Web Vitals (LCP < 2.1s) via lazy loading and code splitting — improving Lighthouse score from 62 to 94.',
  },
];

const TIPS = [
  { icon: 'bolt', text: 'Quantify all impact — use numbers like "reduced load time by 40%" instead of vague claims.' },
  { icon: 'label', text: 'Add a dedicated Technical Skills section with missing keywords explicitly listed.' },
  { icon: 'star', text: 'Lead bullets with strong action verbs: Architected, Engineered, Optimized, Delivered.' },
];

function extractRole(jd) {
  const roles = [
    'Senior Frontend Engineer', 'Full Stack Developer', 'React Developer',
    'Software Engineer', 'UI Engineer', 'Frontend Developer', 'Backend Engineer',
    'Senior Software Engineer', 'Staff Engineer',
  ];
  for (const role of roles) {
    if (jd.toLowerCase().includes(role.toLowerCase())) return role;
  }
  return 'Software Engineer';
}

function extractCompany(jd) {
  const match = jd.match(/(?:at|@|join|joining|for)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/);
  return match ? match[1] : 'Tech Company';
}
