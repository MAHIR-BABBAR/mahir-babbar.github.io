// Single source of truth for every word on the site.
// Edit here; components only render what they find in this file.

export const profile = {
  name: 'Mahir Babbar',
  first: 'Mahir',
  last: 'Babbar',
  role: 'Backend & Systems Engineer',
  eyebrow: "Backend & Systems Engineer · NIT Jalandhar '28",
  tagline: 'Backend services, agent benchmarks and retrieval systems, plus the tests that keep them honest.',
  statement: 'I build backends that survive their own test suites.',
  about: [
    'Third-year Information Technology student at NIT Jalandhar, drawn to the parts of software where correctness is non-negotiable: payment state machines, idempotent APIs, retrieval pipelines with measurable gains, and benchmark tasks whose verifiers cannot be gamed.',
    'Currently authoring Terminal-Bench tasks for Handshake AI. Joining HSBC Technology India as a Technology Intern in summer 2027.',
  ],
  school: "B.Tech IT '28 · Dr. B. R. Ambedkar NIT Jalandhar · CGPA 9.2",
  location: 'Jalandhar, Punjab, India',
  email: 'mahirbabbar1611@gmail.com',
  availability: 'Open to SWE internships · 2027',
  links: {
    github: 'https://github.com/MAHIR-BABBAR',
    linkedin: 'https://www.linkedin.com/in/mahir-babbar-54374a315',
    leetcode: 'https://leetcode.com/u/spartaXmahir/',
  },
}

export const stats = [
  { label: 'LeetCode contest rating', value: 2019 },
  { label: 'global rank, top', value: 2.4, decimals: 1, suffix: '%' },
  { label: 'problems solved', value: 890 },
  { label: 'benchmark tasks shipped', value: 65, suffix: '+' },
]

export const experience = [
  {
    id: 'exp-0',
    company: 'HSBC',
    role: 'Technology Intern',
    badge: 'incoming',
    dates: 'Jun – Jul 2027',
    where: 'HSBC Technology India',
    short:
      "Two-month technology internship at the bank's 23,000-person in-house engineering centre, which builds technology for HSBC's businesses worldwide.",
    stack: [],
  },
  {
    id: 'exp-1',
    company: 'Handshake AI',
    role: 'Terminal-Bench Task Author',
    dates: 'Jul – Oct 2026',
    where: 'Freelance · Remote',
    short:
      '65+ Terminal-Bench 3.0/4.0 tasks accepted into the Stanford / Laude Institute / Harbor agent benchmark: each one a Docker environment, an oracle solution and a hidden verifier that rejects shortcuts and reward hacks.',
    stack: ['Docker', 'pytest', 'Bash', 'Python'],
  },
  {
    id: 'exp-2',
    company: 'AirDawg Labs',
    role: 'AI Systems Evaluator',
    dates: 'Feb 2026',
    where: 'Freelance · Remote',
    short:
      'Turned merged pull requests from large open-source Python repos into Terminal-Bench 2 coding challenges with verifiable test suites; validated 100+ evaluations across 3 frontier model families.',
    stack: ['Docker', 'Python', 'Prompt engineering'],
  },
]

export const projects = [
  {
    id: 'proj-0',
    index: '01',
    name: 'EduElderly',
    kicker: 'Ten services. One gateway. Zero tampering.',
    short:
      'A Node.js microservice monorepo behind an API gateway, with a guarded payment state machine, idempotent order creation and gateway-issued service keys, proven by 168 integration and security tests.',
    metrics: [
      { value: 10, label: 'services' },
      { value: 168, label: 'tests' },
      { value: 409, label: 'on duplicate orders' },
    ],
    stack: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker', 'Jest'],
    link: 'https://github.com/MAHIR-BABBAR/EduElderly',
  },
  {
    id: 'proj-1',
    index: '02',
    name: 'CRAG',
    kicker: 'Hybrid retrieval that AI agents can actually trust.',
    short:
      'A FastAPI retrieval service fusing SQLite FTS5 BM25 with dense vectors through Reciprocal Rank Fusion, lifting BEIR SciFact Hit@10 from 0.777 to 0.857 across 6.1K lines of strictly typed Python and 195 tests.',
    metrics: [
      { value: 0.857, decimals: 3, label: 'Hit@10, from 0.777' },
      { value: 0.69, decimals: 3, label: 'nDCG@10' },
      { value: 195, label: 'pytest cases' },
    ],
    stack: ['Python', 'FastAPI', 'SQLite', 'Docker', 'pytest'],
    link: 'https://github.com/MAHIR-BABBAR/CRAG',
  },
  {
    id: 'proj-2',
    index: '03',
    name: 'Attack-Sim GAN',
    kicker: 'Forged attacks that make the defender smarter.',
    short:
      'A generative adversarial network trained on DNN-EdgeIIoT synthesizes cybersecurity attack samples to correct class imbalance; a Random Forest trained on the augmented data reaches 97.19% accuracy.',
    metrics: [
      { value: 97.19, decimals: 2, suffix: '%', label: 'accuracy' },
      { value: 8.7, decimals: 1, prefix: '+', suffix: '%', label: 'over real data alone' },
    ],
    stack: ['Python', 'TensorFlow', 'scikit-learn'],
    link: null,
  },
]

export const skillRows = [
  ['Python', 'C / C++', 'JavaScript', 'Go', 'Rust', 'Bash', 'SQL', 'Node.js', 'Express', 'FastAPI', 'REST', 'API Gateway', 'JWT', 'React'],
  ['MongoDB', 'Redis', 'SQLite', 'Docker', 'Docker Compose', 'Git', 'Linux', 'GitHub Actions', 'CI/CD', 'pytest', 'Jest', 'Supertest', 'mypy'],
  ['Microservices', 'Distributed systems', 'System design', 'Idempotency', 'Payment workflows', 'Secure coding', 'Prompt engineering', 'DSA', 'OOP', 'Operating systems', 'Networks', 'DBMS'],
]

export const achievements = [
  { big: '2019', title: 'LeetCode contest rating', sub: 'top 2.4% globally · 890 problems solved', link: 'https://leetcode.com/u/spartaXmahir/' },
  { big: '#2', title: 'Speed Quant Challenge', sub: "Runner-up, Utkansh '25, NIT Jalandhar" },
  { big: '120+', title: 'Students represented', sub: 'Class & Intern Representative, IT department' },
]
