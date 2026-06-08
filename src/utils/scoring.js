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

export function generateMockAnalysis(file, jdText) {
  const allSkills = [...MOCK_SKILLS];
  const matchedCount = Math.floor(Math.random() * 6) + 4;
  const missingCount = Math.floor(Math.random() * 5) + 3;
  const shuffled = allSkills.sort(() => Math.random() - 0.5);
  const matched = shuffled.slice(0, matchedCount);
  const missing = shuffled.slice(matchedCount, matchedCount + missingCount);
  const score = Math.floor(Math.random() * 35) + 50;
  const role = extractRole(jdText);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    filename: file?.name || 'resume.pdf',
    jdSnippet: jdText.slice(0, 120),
    role,
    company: extractCompany(jdText),
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
    skillsGap: missing.slice(0, 4),
    experienceGap: 'JD requires 5+ years in distributed systems; resume shows approximately 3 years with frontend focus.',
    educationGap: null,
    atsScore: Math.floor(score * 0.92),
    bulletImprovements: BULLET_IMPROVEMENTS,
    keywordsToAdd: missing,
    summaryRewrite: {
      original: 'Experienced software developer with 3 years building web applications.',
      improved: `Results-driven ${role} with expertise in ${matched.slice(0, 3).join(', ')}. Proven track record of reducing load times by 40% and shipping pixel-perfect UIs for 100k+ user products.`,
    },
    tips: TIPS,
  };
}

export function getScoreLabel(score) {
  if (score >= 71) return 'Strong Match';
  if (score >= 56) return 'Good Match';
  if (score >= 41) return 'Partial Match';
  return 'Weak Match';
}

export function getScoreColor(score) {
  if (score >= 71) return '#46f1c5';
  if (score >= 41) return '#ffb955';
  return '#ffb4ab';
}

export function formatRelativeTime(isoString) {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}
