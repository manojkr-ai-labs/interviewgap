export type RequirementStatus = 'Have' | 'Partial' | 'Missing'
export type RequirementPriority = 'Must-have' | 'Nice-to-have'
export type FitLabel = 'Weak' | 'Stretch' | 'Strong'
export type QuestionCategory = 'technical' | 'behavioral' | 'project' | 'why-this-role'

export interface Requirement {
  id: string
  text: string
  priority: RequirementPriority
  status: RequirementStatus
  evidence: string
}

export interface Subscores {
  skills: number
  experience: number
  domain: number
  keyword: number
}

export interface AnalysisResult {
  roleTitle: string
  overallScore: number
  fitLabel: FitLabel
  subscores: Subscores
  requirements: Requirement[]
  sevenDayPlan: DayPlan[]
  mockQuestions: MockQuestion[]
}

export interface DayTask {
  id: string
  description: string
  estimatedMinutes: number
  completed: boolean
}

export interface DayPlan {
  dayNumber: number
  date: string
  primaryTask: DayTask
  backupTask: DayTask
}

export interface MockQuestion {
  id: string
  category: QuestionCategory
  question: string
  modelAnswer: string
  score: number | null
}

export interface Analysis {
  id: string
  resumeText: string
  jobDescriptionText: string
  createdAt: string
  result: AnalysisResult
  planCompletion: Record<string, boolean>
  mockScores: Record<string, number | null>
  retryScores: Record<string, number | null>
}

export interface AppState {
  currentAnalysisId: string | null
  analyses: Analysis[]
}