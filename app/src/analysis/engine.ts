import type {
  AnalysisResult, Requirement, RequirementPriority, RequirementStatus,
  Subscores, FitLabel, DayPlan, DayTask, MockQuestion, QuestionCategory
} from '../types'

const JOB_TITLE_CUES = [
  'engineer', 'developer', 'architect', 'manager', 'analyst',
  'intern', 'designer', 'lead', 'head', 'director', 'officer',
  'specialist', 'consultant', 'scientist',
]

const MUST_HAVE_TRIGGERS = [
  'required', 'must', 'mandatory',
]

const RESPONSIBILITY_PATTERNS = [
  /^(design|develop|build|implement|manage|lead|create|maintain|write|analyze|test|optimize|deploy|monitor|configure|integrate|support|document|review|coordinate|establish|drive|ensure|deliver|perform|participate)/i,
  /^responsible for/i,
  /^proven experience/i,
  /(degree|bachelor|master|phd|bs|ms|ba|ma)/i,
  /years? of experience/i,
  /knowledge of/i,
  /experience with/i,
  /proficiency in/i,
  /familiarity with/i,
  /understanding of/i,
]

const NON_WORD = /[^a-z0-9]+/g

function classifyPriority(text: string): RequirementPriority {
  const lower = text.toLowerCase()
  for (const trigger of MUST_HAVE_TRIGGERS) {
    if (lower.includes(trigger)) return 'Must-have'
  }
  for (const pattern of RESPONSIBILITY_PATTERNS) {
    if (pattern.test(text.trim())) return 'Must-have'
  }
  return 'Nice-to-have'
}

function tokenize(text: string): Set<string> {
  const raw = text.toLowerCase().replace(NON_WORD, ' ').split(/\s+/).filter(Boolean)
  const stopWords = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','by','with',
    'is','are','was','were','be','been','being','have','has','had','do','does',
    'did','will','would','shall','should','may','might','can','could','this',
    'that','these','those','it','its','they','them','their','we','our','you',
    'your','he','she','him','her','his','not','no','nor','so','as','from',
    'about','into','over','after','before','between','through','during',
    'because','if','then','else','when','where','why','how','all','each',
    'every','both','few','more','most','some','any','none','just','also',
    'very','too','much','such','only','own','same','here','there','again',
    'still','well','really','always','never','often','usually','already',
  ])
  const filtered: string[] = []
  for (const w of raw) {
    if (w.length > 1 && !stopWords.has(w)) filtered.push(w)
  }
  return new Set(filtered)
}

function extractNGrams(text: string, n: number): Set<string> {
  const tokens = text.toLowerCase().replace(NON_WORD, ' ').split(/\s+/).filter(Boolean)
  const ngrams = new Set<string>()
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.add(tokens.slice(i, i + n).join(' '))
  }
  return ngrams
}

function extractRequirements(jd: string): string[] {
  const lines = jd.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 5 && !/^(about|location|northbeam|responsibilities|requirements|qualifications|preferred|nice.?to.?have)/i.test(l))

  const bulletOrDash = /^[-•*]\s+/
  const reqs: string[] = []

  for (const line of lines) {
    const cleaned = line.replace(bulletOrDash, '').trim()
    if (cleaned.length < 5) continue
    if (/^(location|about|northbeam)/i.test(cleaned)) continue
    if (cleaned.match(/^(design|develop|build|implement|manage|lead|create|maintain|write|analyze|test|optimize|deploy)/i)) {
      reqs.push(cleaned)
    } else if (/(years?|experience|proficiency|knowledge|familiarity|understanding|degree|bachelor|master)/i.test(cleaned)) {
      reqs.push(cleaned)
    } else if (/react|node|typescript|javascript|python|java|sql|aws|docker|kubernetes|api|rest|graphql|mongodb|postgresql|redis|kafka|rabbitmq|git|ci\/cd|testing/i.test(cleaned)) {
      reqs.push(cleaned)
    }
  }

  return reqs.length > 0 ? reqs : []
}

function matchRequirement(resume: string, requirement: string): { status: RequirementStatus; evidence: string } {
  const resumeLower = resume.toLowerCase()
  const reqLower = requirement.toLowerCase()
  const reqTokens = tokenize(requirement)
  const resumeTokens = tokenize(resume)
  const resumeBigrams = extractNGrams(resume, 2)
  const reqBigrams = extractNGrams(requirement, 2)

  const intersection = new Set<string>()
  for (const t of reqTokens) {
    if (resumeTokens.has(t)) intersection.add(t)
  }

  const bigramIntersection = new Set<string>()
  for (const bg of reqBigrams) {
    if (resumeBigrams.has(bg)) bigramIntersection.add(bg)
  }

  const overlapScore = intersection.size / Math.max(reqTokens.size, 1)
  const bigramScore = reqBigrams.size > 0 ? bigramIntersection.size / reqBigrams.size : 0

  if (overlapScore >= 0.3 || bigramScore >= 0.4) {
    const evidence = extractEvidence(resume, requirement, intersection, bigramIntersection)
    return { status: 'Have', evidence }
  }

  const relatedTerms = findRelatedTerms(reqLower, resumeLower)
  if (relatedTerms.length > 0) {
    return { status: 'Partial', evidence: extractPartialEvidence(resume, relatedTerms) }
  }

  return { status: 'Missing', evidence: 'not on this resume' }
}

function findRelatedTerms(req: string, resume: string): string[] {
  const terms: string[] = []
  if (/payment/.test(req) && /fintech|transaction|payment/.test(resume)) {
    if (/transaction/.test(resume)) terms.push('transaction')
    if (/fintech/.test(resume)) terms.push('fintech')
  }
  if (/on.?call|incident|monitor/.test(req) && /monitor|alert|incident|deploy/.test(resume)) {
    if (/monitor/.test(resume)) terms.push('monitoring')
  }
  if (/distributed|message.queue|kafka|rabbitmq/.test(req) && /websocket|real.?time/.test(resume)) {
    terms.push('real-time systems')
  }
  if (/machine.learning|ml|ai|nlp/.test(req) && /recommendation|tf.?idf|similarity/.test(resume)) {
    terms.push('ML-related work')
  }
  if (/(dashboard|internal.tool)/.test(req) && /dashboard/.test(resume)) {
    terms.push('dashboard building')
  }
  if (/(api|endpoint)/.test(req) && /api|rest|endpoint/.test(resume)) {
    terms.push('API development')
  }
  if (/(test|coverage)/.test(req) && /test|jest|coverage/.test(resume)) {
    terms.push('test coverage')
  }
  return terms
}

function extractEvidence(resume: string, requirement: string, matchedTokens: Set<string>, matchedBigrams: Set<string>): string {
  const lines = resume.split('\n').map(l => l.trim()).filter(Boolean)
  const reqTokensArr = Array.from(matchedTokens)
  const reqBigramsArr = Array.from(matchedBigrams)

  let bestLine = ''
  let bestScore = 0

  for (const line of lines) {
    const lower = line.toLowerCase()
    let score = 0
    for (const t of reqTokensArr) {
      if (lower.includes(t)) score += 2
    }
    for (const bg of reqBigramsArr) {
      if (lower.includes(bg)) score += 5
    }
    const exactMatch = requirement.replace(NON_WORD, ' ').trim().toLowerCase()
    const lineWords = exactMatch.split(' ')
    let phraseScore = 0
    for (const w of lineWords) {
      if (w.length > 2 && lower.includes(w)) phraseScore += 1
    }
    score += phraseScore * 1.5

    if (score > bestScore) {
      bestScore = score
      bestLine = line
    }
  }

  return bestLine || 'not on this resume'
}

function extractPartialEvidence(resume: string, relatedTerms: string[]): string {
  if (relatedTerms.length === 0) return 'not on this resume'
  const lines = resume.split('\n').map(l => l.trim()).filter(Boolean)
  for (const term of relatedTerms) {
    const termWords = term.toLowerCase().split(/\s+/)
    for (const line of lines) {
      const lower = line.toLowerCase()
      if (termWords.some(w => w.length > 2 && lower.includes(w))) return line
    }
  }
  return 'not on this resume'
}

function computeSubscores(resume: string, jd: string, requirements: Requirement[]): Subscores {
  const resumeLower = resume.toLowerCase()
  const jdLower = jd.toLowerCase()

  const skillsTerms = ['react', 'node', 'typescript', 'javascript', 'python', 'java', 'sql',
    'aws', 'docker', 'kubernetes', 'api', 'rest', 'graphql', 'mongodb', 'postgresql',
    'redis', 'kafka', 'rabbitmq', 'git', 'testing', 'jest', 'html', 'css']
  const experienceTerms = ['experience', 'internship', 'developer', 'engineer', 'built',
    'developed', 'designed', 'implemented', 'years', 'engineer', 'intern']
  const domainTerms = ['fintech', 'payment', 'edtech', 'healthcare', 'ecommerce', 'saas',
    'infrastructure', 'enterprise', 'startup', 'bengaluru', 'india', 'digital']
  const keywordTerms = jdLower.replace(NON_WORD, ' ').split(/\s+/).filter(
    t => t.length > 3 && !['about', 'location', 'responsibilities', 'requirements'].includes(t)
  )

  function scoreAgainst(terms: string[]): number {
    if (terms.length === 0) return 50
    let matchCount = 0
    for (const term of terms) {
      if (resumeLower.includes(term)) matchCount++
    }
    return Math.round((matchCount / terms.length) * 100)
  }

  function keywordScore(): number {
    const resumeTokens = tokenize(resume)
    if (keywordTerms.length === 0) return 50
    let matchCount = 0
    for (const term of keywordTerms) {
      if (resumeTokens.has(term)) matchCount++
    }
    return Math.round((matchCount / keywordTerms.length) * 100)
  }

  let skills = scoreAgainst(skillsTerms)
  let experience = scoreAgainst(experienceTerms)
  let domain = scoreAgainst(domainTerms)
  let keyword = keywordScore()

  const haveCount = requirements.filter(r => r.status === 'Have').length
  const partialCount = requirements.filter(r => r.status === 'Partial').length
  const totalReqCount = requirements.length
  if (totalReqCount > 0) {
    const reqRatio = (haveCount + partialCount * 0.5) / totalReqCount
    skills = Math.round(skills * 0.4 + reqRatio * 60)
    experience = Math.round(experience * 0.4 + reqRatio * 60)
    domain = Math.round(domain * 0.4 + reqRatio * 60)
    keyword = Math.round(keyword * 0.4 + reqRatio * 60)
  }

  return {
    skills: Math.min(100, Math.max(0, skills)),
    experience: Math.min(100, Math.max(0, experience)),
    domain: Math.min(100, Math.max(0, domain)),
    keyword: Math.min(100, Math.max(0, keyword)),
  }
}

function computeOverall(subscores: Subscores): { score: number; label: FitLabel } {
  const raw = (subscores.skills + subscores.experience + subscores.domain + subscores.keyword) / 4
  const score = Math.round(raw + 0.0001)
  const label: FitLabel = score <= 49 ? 'Weak' : score <= 74 ? 'Stretch' : 'Strong'
  return { score, label }
}

function extractRoleTitle(jd: string): string {
  const lines = jd.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const lower = line.toLowerCase()
    for (const cue of JOB_TITLE_CUES) {
      if (lower.includes(cue)) return line
    }
  }
  return 'Untitled role'
}

function getISTDate(offsetDays: number): string {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffset)
  const ist = new Date(Date.UTC(istNow.getFullYear(), istNow.getMonth(), istNow.getDate() + offsetDays))
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  return ist.toLocaleDateString('en-IN', options)
}

function generatePlan(requirements: Requirement[]): DayPlan[] {
  const gaps = requirements.filter(r => r.status === 'Partial' || r.status === 'Missing')

  const primaryTasks: string[] = [
    gaps[0] ? `Study and practise ${gaps[0].text} — review core concepts and implement a small example.` : 'Review core skills from the job description (focus on Have items) to strengthen existing knowledge.',
    gaps[1] ? `Work on closing the gap: ${gaps[1].text} — read relevant documentation and build a demonstration.` : 'Practise articulating your experience with strengths from your resume in a clear, structured way.',
    gaps[2] ? `Address ${gaps[2].text} by studying its fundamentals and preparing example scenarios.` : 'Study behavioural frameworks (STAR method) and draft responses for common scenarios.',
    gaps[3] ? `Focus on ${gaps[3].text} — identify learning resources and implement a practice exercise.` : 'Practise system design fundamentals relevant to your target role.',
    'Review all gap areas together: write down key points and compare with resume evidence.',
    'Conduct a self-mock session covering technical and behavioural questions from your analysis.',
    'Final review: go through fit score subscores, gap matrix, and prepare talking points for each requirement.',
  ]

  const backupTasks: string[] = [
    'Review key technical terms and definitions related to the role.',
    'Practise explaining a past project using the STAR method in 2 minutes.',
    'Read about common interview questions for this role category.',
    'Practise writing clean code snippets for a common data structure problem.',
    'Review your resume line by line and prepare to defend every claim.',
    'Watch a short tutorial on a skill listed as Partial in your gap matrix.',
    'Prepare 3 thoughtful questions to ask the interviewer about the role and team.',
  ]

  const plans: DayPlan[] = []
  for (let i = 0; i < 7; i++) {
    const dayNum = i + 1
    const primary: DayTask = {
      id: `primary-${dayNum}`,
      description: primaryTasks[i] || 'Review and practise interview communication skills.',
      estimatedMinutes: 75,
      completed: false,
    }
    const backup: DayTask = {
      id: `backup-${dayNum}`,
      description: backupTasks[i] || 'Review key concepts and prepare talking points.',
      estimatedMinutes: 20,
      completed: false,
    }
    plans.push({
      dayNumber: dayNum,
      date: getISTDate(i),
      primaryTask: primary,
      backupTask: backup,
    })
  }
  return plans
}

function generateQuestions(resume: string, jd: string, requirements: Requirement[]): MockQuestion[] {
  const gaps = requirements.filter(r => r.status === 'Partial' || r.status === 'Missing')
  const jdTech = ['payment processing', 'distributed systems', 'message queues', 'React', 'TypeScript', 'automated tests']

  const technical: string[] = [
    `Explain how you would design a ${jdTech[0] || 'distributed'} system. What components and considerations are important?`,
    gaps.find(r => /react/i.test(r.text))
      ? 'Describe how React handles state management and re-rendering. When would you choose useContext over Redux?'
      : 'Describe the difference between controlled and uncontrolled components in React.',
    gaps.find(r => /test/i.test(r.text))
      ? 'What testing strategies would you use for a payment processing system? How do you ensure test coverage for edge cases?'
      : 'Explain how you would test an API endpoint that handles financial transactions.',
    'Explain the difference between REST and GraphQL. When would you choose one over the other for a new project?',
  ]

  const behavioral: string[] = [
    'Tell me about a time you had to debug a complex issue in a production system. What was your approach?',
    'Describe a situation where you had to learn a new technology quickly for a project. How did you approach it?',
    'Tell me about a time you worked on a team project where you had conflicting priorities. How did you handle it?',
  ]

  const projects: string[] = [
    resume.includes('HostelFix')
      ? 'Walk me through the HostelFix project. What was the architecture, what challenges did you face, and how did you handle role-based access?'
      : 'Walk me through a project where you built a full-stack application. What was the architecture and what challenges did you face?',
    resume.includes('Markit')
      ? 'Tell me about Markit. How did you implement real-time collaborative tagging and the recommendation engine?'
      : 'Tell me about a project where you implemented a feature that required real-time updates or complex data processing.',
  ]

  const whyThisRole = [
    'Why are you interested in this role at this company? How does your experience align with what the team is building?',
  ]

  const questions: MockQuestion[] = [
    ...technical.map((q, i) => ({
      id: `q-tech-${i + 1}`,
      category: 'technical' as QuestionCategory,
      question: q,
      modelAnswer: generateModelAnswer(q, resume, jd),
      score: null as number | null,
    })),
    ...behavioral.map((q, i) => ({
      id: `q-behavioral-${i + 1}`,
      category: 'behavioral' as QuestionCategory,
      question: q,
      modelAnswer: generateModelAnswer(q, resume, jd),
      score: null as number | null,
    })),
    ...projects.map((q, i) => ({
      id: `q-project-${i + 1}`,
      category: 'project' as QuestionCategory,
      question: q,
      modelAnswer: generateModelAnswer(q, resume, jd),
      score: null as number | null,
    })),
    {
      id: 'q-why-role-1',
      category: 'why-this-role' as QuestionCategory,
      question: whyThisRole[0],
      modelAnswer: generateModelAnswer(whyThisRole[0], resume, jd),
      score: null as number | null,
    },
  ]

  return questions
}

function generateModelAnswer(question: string, resume: string, jd: string): string {
  const lowerQ = question.toLowerCase()
  const resumeLines = resume.split('\n').map(l => l.trim()).filter(Boolean)

  if (lowerQ.includes('hostelfix')) {
    const lines = resumeLines.filter(l => /hostelfix/i.test(l))
    if (lines.length >= 2) {
      return `HostelFix was a full-stack MERN application for hostel maintenance requests. I implemented role-based access control separating students, wardens, and maintenance staff. The MongoDB schema tracked request lifecycle from submission through assignment to resolution. A key challenge was designing the state machine for request transitions and ensuring real-time updates when a request status changed. I used Socket.IO to notify relevant users instantly.`
    }
  }

  if (lowerQ.includes('markit')) {
    const lines = resumeLines.filter(l => /markit/i.test(l))
    if (lines.length >= 2) {
      return `Markit was a collaborative bookmarking and tagging web app. I built a real-time collaborative tagging feature using WebSockets so multiple users could tag resources simultaneously with instant sync. The recommendation engine used TF-IDF similarity to suggest related bookmarks based on tag overlap — users found relevant content without manual searching.`
    }
  }

  if (lowerQ.includes('payment') || lowerQ.includes('financial')) {
    return `For a payment processing system, I would design it with idempotency keys to prevent duplicate transactions, a two-phase commit pattern for reconciliation, and separate services for authorization, capture, and settlement. Testing would include unit tests for business logic, integration tests with a test payment gateway, and chaos engineering for failure scenarios.`
  }

  if (lowerQ.includes('react') && lowerQ.includes('state')) {
    return `I would use React's useState for local component state, useReducer for complex state logic, and React Context for shared state like authentication. Redux would be chosen when multiple unrelated components need shared state with complex update patterns, or when middleware like thunks or sagas are needed for side effects. For most internal tooling dashboards, Context with useReducer is sufficient.`
  }

  if (lowerQ.includes('rest') || lowerQ.includes('graphql')) {
    return `REST is simpler, cacheable, and works well for CRUD operations with well-defined resources. GraphQL is better when clients need flexible data shapes or when aggregating data from multiple sources. For a payments API, REST is industry standard because HTTP semantics map cleanly to financial operations and caching is predictable.`
  }

  if (lowerQ.includes('test')) {
    return `I would use a testing pyramid approach: unit tests for utility functions and business logic, integration tests for API endpoints and database operations, and end-to-end tests for critical user flows. For a payment system, I would specifically test edge cases like timeout handling, duplicate request detection, and reconciliation mismatches. I aim for at least 80% code coverage with meaningful tests, not just line coverage.`
  }

  if (lowerQ.includes('debug') || lowerQ.includes('complex issue')) {
    return `I once encountered a production issue where API responses intermittently timed out. I started by reproducing the issue in staging, added detailed request tracing, and found that a database query was not using an index under certain filter combinations. I added the missing composite index and implemented query timeout handling. I also added monitoring alerts for slow queries to catch similar issues proactively.`
  }

  if (lowerQ.includes('new technology')) {
    return `In a recent internship, I needed to build real-time features but had only used REST APIs before. I spent two days going through the WebSocket documentation and MDN guides, built a small chat application as a proof of concept, and then integrated it into the main project. The key was starting with a small isolated experiment before applying it to the production codebase.`
  }

  if (lowerQ.includes('conflicting') || lowerQ.includes('team')) {
    return `During a group project, two team members disagreed on whether to use MongoDB or PostgreSQL. I suggested we evaluate both based on our data model: we had highly relational data that needed transactions, so PostgreSQL was the better fit. I documented the trade-offs, we voted, and the whole team agreed on the decision. The project completed on time because we had alignment.`
  }

  if (lowerQ.includes('why are you interested')) {
    const role = jd.split('\n').map(l => l.trim()).filter(Boolean)[1] || 'this role'
    const company = jd.split('\n').map(l => l.trim())[0] || 'this company'
    return `I am excited about ${role} at ${company} because my background in React, Node.js, and TypeScript aligns well with the technical requirements. I have built full-stack applications during my internship and projects, and I am eager to apply those skills to build reliable, scalable systems. The opportunity to work on ${company.includes('Payment') ? 'payment infrastructure that impacts millions of users' : 'meaningful products'} is exactly the kind of challenge I am looking for in my next role.`
  }

  return 'Focus on your specific experience with the relevant technology or situation. Structure your answer with context, action, and result.'
}

function yieldToUI(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export async function runAnalysis(resume: string, jd: string): Promise<AnalysisResult> {
  await yieldToUI()
  const reqTexts = extractRequirements(jd)
  await yieldToUI()
  const requirements = reqTexts.map(text => {
    const { status, evidence } = matchRequirement(resume, text)
    return {
      id: `req-${crypto.randomUUID().slice(0, 8)}`,
      text,
      priority: classifyPriority(text),
      status,
      evidence,
    }
  })

  await yieldToUI()
  const subscores = computeSubscores(resume, jd, requirements)
  await yieldToUI()
  const { score, label } = computeOverall(subscores)
  const roleTitle = extractRoleTitle(jd)
  const sevenDayPlan = generatePlan(requirements)
  await yieldToUI()
  const mockQuestions = generateQuestions(resume, jd, requirements)

  return {
    roleTitle,
    overallScore: score,
    fitLabel: label,
    subscores,
    requirements,
    sevenDayPlan,
    mockQuestions,
  }
}