import type { EducationLevel } from '../types'

export interface ExtractedProfileData {
  skills: string[]
  interests: string[]
  educationLevel?: EducationLevel
  matchedKeywordCount: number
}

// Canonical dictionary mapping regex patterns to clean standard display labels
const SKILL_RULES: { label: string; pattern: RegExp }[] = [
  // Programming Languages
  { label: 'Python', pattern: /\bpython\b/i },
  { label: 'JavaScript', pattern: /\b(javascript|js|es6)\b/i },
  { label: 'TypeScript', pattern: /\b(typescript|ts)\b/i },
  { label: 'Java', pattern: /\bjava\b(?!\s*script)/i },
  { label: 'C++', pattern: /\bc\+\+\b/i },
  { label: 'C#', pattern: /\bc#|\bcsharp\b/i },
  { label: 'Rust', pattern: /\brust\b/i },
  { label: 'Go', pattern: /\b(golang|go\s*language)\b/i },
  { label: 'Kotlin', pattern: /\bkotlin\b/i },
  { label: 'Swift', pattern: /\bswift\b/i },
  { label: 'SQL', pattern: /\bsql\b/i },
  { label: 'HTML/CSS', pattern: /\b(html|css|tailwind|tailwindcss|sass)\b/i },

  // Frameworks & Web
  { label: 'React', pattern: /\b(react|reactjs|react\.js)\b/i },
  { label: 'Next.js', pattern: /\b(nextjs|next\.js)\b/i },
  { label: 'Node.js', pattern: /\b(nodejs|node\.js|node)\b/i },
  { label: 'Express', pattern: /\bexpress(\.js)?\b/i },
  { label: 'Django', pattern: /\bdjango\b/i },
  { label: 'FastAPI', pattern: /\bfastapi\b/i },
  { label: 'Spring Boot', pattern: /\bspring(\s*boot)?\b/i },

  // AI & Data
  { label: 'PyTorch', pattern: /\bpytorch\b/i },
  { label: 'TensorFlow', pattern: /\btensorflow\b/i },
  { label: 'Machine Learning', pattern: /\b(machine\s*learning|scikit-learn|sklearn)\b/i },
  { label: 'Deep Learning', pattern: /\b(deep\s*learning|neural\s*networks)\b/i },
  { label: 'Pandas', pattern: /\bpandas\b/i },
  { label: 'NumPy', pattern: /\bnumpy\b/i },
  { label: 'LLMs', pattern: /\b(llm|llms|large\s*language\s*models|langchain|rag)\b/i },
  { label: 'NLP', pattern: /\b(nlp|natural\s*language\s*processing)\b/i },
  { label: 'Computer Vision', pattern: /\b(computer\s*vision|opencv)\b/i },

  // Databases & Cloud
  { label: 'PostgreSQL', pattern: /\b(postgres|postgresql)\b/i },
  { label: 'MongoDB', pattern: /\bmongodb\b/i },
  { label: 'Redis', pattern: /\bredis\b/i },
  { label: 'Docker', pattern: /\bdocker\b/i },
  { label: 'Kubernetes', pattern: /\b(kubernetes|k8s)\b/i },
  { label: 'AWS', pattern: /\b(aws|amazon\s*web\s*services)\b/i },
  { label: 'Google Cloud', pattern: /\b(gcp|google\s*cloud)\b/i },
  { label: 'Git', pattern: /\b(git|github|gitlab)\b/i },
  { label: 'Linux', pattern: /\b(linux|ubuntu|bash)\b/i },

  // UI / Design
  { label: 'UI/UX', pattern: /\b(ui\/ux|ux\s*design|figma)\b/i },
  { label: 'Solidity', pattern: /\b(solidity|smart\s*contracts|web3)\b/i },
]

const INTEREST_RULES: { label: string; pattern: RegExp }[] = [
  { label: 'AI/ML', pattern: /\b(ai|artificial\s*intelligence|machine\s*learning|llm|generative\s*ai)\b/i },
  { label: 'Web Development', pattern: /\b(web\s*dev(elopment)?|frontend|backend|fullstack|full-stack|web\s*app(lication)?)\b/i },
  { label: 'Data Science', pattern: /\b(data\s*science|data\s*analyst|analytics|big\s*data)\b/i },
  { label: 'Cybersecurity', pattern: /\b(cybersecurity|security|infosec|penetration\s*testing|cryptography)\b/i },
  { label: 'Cloud/DevOps', pattern: /\b(cloud|devops|ci\/cd|infrastructure|sre)\b/i },
  { label: 'Mobile Apps', pattern: /\b(mobile|android|ios|react\s*native|flutter)\b/i },
  { label: 'Robotics', pattern: /\b(robotics|ros|iot|embedded|hardware)\b/i },
  { label: 'Quantum Computing', pattern: /\b(quantum|qiskit)\b/i },
  { label: 'Algorithms', pattern: /\b(dsa|data\s*structures|algorithms|competitive\s*programming|leetcode)\b/i },
  { label: 'Design & UI', pattern: /\b(design|ui|ux|wireframe|figma)\b/i },
  { label: 'Research', pattern: /\b(research|paper|publication|ieee|arxiv)\b/i },
  { label: 'Entrepreneurship', pattern: /\b(startup|founder|entrepreneurship|business|pitch)\b/i },
]

const EDUCATION_RULES: { level: EducationLevel; pattern: RegExp }[] = [
  {
    level: 'Undergraduate',
    pattern: /\b(b\.?tech|b\.?e\.?|b\.?s\.?|bachelor|bca|bsc|undergraduate|undergrad|college\s*student|sophomore|junior|senior)\b/i,
  },
  {
    level: 'Postgraduate',
    pattern: /\b(m\.?tech|m\.?e\.?|m\.?s\.?|master|mca|msc|mba|postgraduate|ph\.?d|doctorate)\b/i,
  },
  {
    level: 'High School',
    pattern: /\b(high\s*school|10th|11th|12th|secondary\s*school|k-12)\b/i,
  },
  {
    level: 'Bootcamp / Self-Taught',
    pattern: /\b(bootcamp|self-taught|coursera|udemy|edx|freecodecamp)\b/i,
  },
]

/**
 * Parses raw text from a student resume, CV, or LinkedIn bio and deterministically
 * extracts matching skills, interests, and education level.
 */
export function extractProfileFromText(text: string): ExtractedProfileData {
  if (!text || typeof text !== 'string') {
    return { skills: [], interests: [], matchedKeywordCount: 0 }
  }

  const skills: string[] = []
  const interests: string[] = []

  // Extract skills
  for (const rule of SKILL_RULES) {
    if (rule.pattern.test(text) && !skills.includes(rule.label)) {
      skills.push(rule.label)
    }
  }

  // Extract interests
  for (const rule of INTEREST_RULES) {
    if (rule.pattern.test(text) && !interests.includes(rule.label)) {
      interests.push(rule.label)
    }
  }

  // Extract education level (first matched priority)
  let educationLevel: EducationLevel | undefined = undefined
  for (const rule of EDUCATION_RULES) {
    if (rule.pattern.test(text)) {
      educationLevel = rule.level
      break
    }
  }

  return {
    skills,
    interests,
    educationLevel,
    matchedKeywordCount: skills.length + interests.length + (educationLevel ? 1 : 0),
  }
}
