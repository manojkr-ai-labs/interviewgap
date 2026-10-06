import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentAnalysis } from '../store'

function sanitizeRole(role: string): string {
  let s = role.toLowerCase()
  s = s.replace(/\s+/g, '-')
  s = s.replace(/[^a-z0-9-]/g, '')
  s = s.replace(/-+/g, '-')
  s = s.replace(/^-+|-+$/g, '')
  return s || 'untitled-role'
}

function generateMarkdown(analysis: ReturnType<typeof getCurrentAnalysis>): string {
  if (!analysis) return ''
  const { result, planCompletion, mockScores } = analysis
  const { roleTitle, overallScore, fitLabel, subscores, requirements, sevenDayPlan, mockQuestions } = result

  const lines: string[] = []

  lines.push(`# InterviewGap: ${roleTitle}`)
  lines.push('')
  lines.push(`## Fit score: ${overallScore}/100 — ${fitLabel}`)
  lines.push(`- Skills: ${subscores.skills}/100`)
  lines.push(`- Experience: ${subscores.experience}/100`)
  lines.push(`- Domain: ${subscores.domain}/100`)
  lines.push(`- Keyword: ${subscores.keyword}/100`)
  lines.push('')

  if (requirements.length > 0) {
    lines.push('## Gap matrix')
    lines.push('')
    lines.push('| Requirement | Priority | Status | Evidence |')
    lines.push('| --- | --- | --- | --- |')
    for (const req of requirements) {
      lines.push(`| ${req.text} | ${req.priority} | ${req.status} | ${req.evidence} |`)
    }
    lines.push('')
  }

  lines.push('## 7-day preparation plan')
  lines.push('')
  for (const day of sevenDayPlan) {
    const primaryDone = planCompletion[day.primaryTask.id] ? '[x]' : '[ ]'
    const backupDone = planCompletion[day.backupTask.id] ? '[x]' : '[ ]'
    lines.push(`### Day ${day.dayNumber} — ${day.date}`)
    lines.push(`- ${primaryDone} Primary (75 min): ${day.primaryTask.description}`)
    lines.push(`- ${backupDone} Backup (20 min): ${day.backupTask.description}`)
    lines.push('')
  }

  lines.push('## Mock interview')
  lines.push('')
  const totalScore = mockQuestions.reduce((sum, q) => sum + (mockScores[q.id] ?? 0), 0)
  lines.push(`Total: ${totalScore}/50`)
  lines.push('')
  for (const q of mockQuestions) {
    const score = mockScores[q.id] ?? '-'
    lines.push(`**${q.category}**: ${q.question}`)
    lines.push(`Score: ${score}/5`)
    lines.push('')
  }

  const weakestThree = mockQuestions
    .map(q => ({ ...q, score: mockScores[q.id] ?? 0 }))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score
      return mockQuestions.indexOf(a) - mockQuestions.indexOf(b)
    })
    .slice(0, 3)

  if (weakestThree.length === 3 && weakestThree.every(q => mockScores[q.id] !== null)) {
    lines.push('## Review — weakest responses')
    lines.push('')
    for (const q of weakestThree) {
      lines.push(`- ${q.category}: ${q.question} (Score: ${mockScores[q.id] ?? '-'}/5)`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

export default function ExportPage() {
  const analysis = getCurrentAnalysis()
  const [copied, setCopied] = useState(false)

  if (!analysis) {
    return (
      <div className="page export-page">
        <h2>Export</h2>
        <div className="empty-state">
          <p>No analysis to export. Go to <Link to="/">Home</Link> to analyse a resume and job description first.</p>
        </div>
      </div>
    )
  }

  const markdown = generateMarkdown(analysis)
  const filename = `InterviewGap-${sanitizeRole(analysis.result.roleTitle)}.md`

  function handleCopy() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      setCopied(false)
    })
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page export-page">
      <h2>Export</h2>
      <p className="role-title">{analysis.result.roleTitle}</p>

      <div className="markdown-preview">
        <pre>{markdown}</pre>
      </div>

      <div className="action-bar">
        <button onClick={handleCopy} className="btn btn-primary">
          {copied ? 'Copied!' : 'Copy all'}
        </button>
        <button onClick={handleDownload} className="btn btn-secondary">Download</button>
      </div>
    </div>
  )
}