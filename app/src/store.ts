import type { Analysis, AppState } from './types'

const STORAGE_KEY = 'interviewgap_state'
let storageAvailable = true

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    storageAvailable = false
  }
  return { currentAnalysisId: null, analyses: [] }
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    storageAvailable = false
  }
}

export function isStorageAvailable(): boolean {
  return storageAvailable
}

let state: AppState = loadState()

export function getState(): AppState {
  return state
}

export function persistState(): void {
  saveState(state)
}

export function getCurrentAnalysis(): Analysis | null {
  if (!state.currentAnalysisId) return null
  return state.analyses.find(a => a.id === state.currentAnalysisId) ?? null
}

export function setCurrentAnalysis(analysis: Analysis): void {
  const existing = state.analyses.findIndex(a => a.id === analysis.id)
  if (existing >= 0) {
    state.analyses[existing] = analysis
  } else {
    state.analyses.unshift(analysis)
  }
  state.currentAnalysisId = analysis.id
  persistState()
}

export function updatePlanCompletion(taskId: string, completed: boolean): void {
  const current = getCurrentAnalysis()
  if (!current) return
  current.planCompletion[taskId] = completed
  setCurrentAnalysis(current)
}

export function updateMockScore(questionId: string, score: number | null): void {
  const current = getCurrentAnalysis()
  if (!current) return
  current.mockScores[questionId] = score
  setCurrentAnalysis(current)
}

export function replaceMockScore(questionId: string, score: number | null): void {
  const current = getCurrentAnalysis()
  if (!current) return
  current.retryScores[questionId] = score
  setCurrentAnalysis(current)
}

export function applyRetryScores(): void {
  const current = getCurrentAnalysis()
  if (!current) return
  for (const [qid, score] of Object.entries(current.retryScores)) {
    if (score !== null) {
      current.mockScores[qid] = score
    }
  }
  current.retryScores = {}
  setCurrentAnalysis(current)
}

export function duplicateAnalysis(id: string): string | null {
  const original = state.analyses.find(a => a.id === id)
  if (!original) return null
  const copy: Analysis = {
    ...JSON.parse(JSON.stringify(original)),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    planCompletion: {},
    mockScores: {},
    retryScores: {},
  }
  state.analyses.unshift(copy)
  state.currentAnalysisId = copy.id
  persistState()
  return copy.id
}

export function deleteAnalysis(id: string): void {
  state.analyses = state.analyses.filter(a => a.id !== id)
  if (state.currentAnalysisId === id) {
    state.currentAnalysisId = state.analyses[0]?.id ?? null
  }
  persistState()
}

export function loadSampleTexts(): { resume: string; jd: string } {
  return {
    resume: [
      'Kavya Iyer',
      'RVCE 2025 — B.E. Computer Science',
      '',
      'SKILLS',
      'React, Node.js, TypeScript, JavaScript, HTML, CSS, Git, REST APIs, MongoDB, PostgreSQL',
      '',
      'EXPERIENCE',
      '8-week Bengaluru edtech startup internship',
      '- Built student dashboard in React with real-time progress tracking',
      '- Developed REST endpoints in Node.js/Express for course content delivery',
      '- Wrote unit tests using Jest; achieved 85% coverage',
      '',
      'PROJECTS',
      'HostelFix – Full-stack hostel maintenance request system (MERN)',
      '- Implemented role-based access for students, wardens, and maintenance staff',
      '- Designed MongoDB schema for request lifecycle tracking',
      '',
      'Markit – Collaborative bookmarking and tagging web app',
      '- Built real-time collaborative tagging using WebSockets',
      '- Created tag-based recommendation engine using TF-IDF similarity',
    ].join('\n'),
    jd: [
      'Northbeam Payments',
      'Software Engineer I',
      'Location: Bengaluru, India',
      '',
      'About Northbeam Payments: We build payment infrastructure for digital businesses across India and Southeast Asia.',
      '',
      'Responsibilities:',
      '- Design, develop, and maintain payment processing systems',
      '- Build and optimize APIs for transaction routing and reconciliation',
      '- Implement monitoring and on-call rotation for production payment systems',
      '- Write and maintain comprehensive test coverage',
      '',
      'Requirements:',
      '- 1-3 years of experience in backend development with Node.js or TypeScript',
      '- Strong proficiency in React for internal tooling dashboards',
      '- Experience with payment systems or fintech is a plus',
      '- Understanding of distributed systems and message queues',
      '- Bachelor\'s degree in Computer Science or equivalent',
      '- Willingness to participate in on-call rotation',
      '- Experience writing automated tests',
    ].join('\n'),
  }
}

export function clearCurrentAnalysis(): void {
  state.currentAnalysisId = null
  persistState()
}