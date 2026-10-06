import { getCurrentAnalysis } from '../store'

export default function FitScore() {
  const analysis = getCurrentAnalysis()
  if (!analysis) return null

  const { overallScore, fitLabel, subscores } = analysis.result

  return (
    <div className="page fit-score-page">
      <h2>Fit score</h2>
      <p className="role-title">{analysis.result.roleTitle}</p>

      <div className="overall-score-card">
        <span className={`overall-score fit-${fitLabel.toLowerCase()}`}>{overallScore}</span>
        <span className="fit-label">{fitLabel}</span>
      </div>

      <div className="subscores-grid">
        <div className="subscore-card">
          <span className="subscore-label">Skills</span>
          <span className="subscore-value">{subscores.skills}</span>
        </div>
        <div className="subscore-card">
          <span className="subscore-label">Experience</span>
          <span className="subscore-value">{subscores.experience}</span>
        </div>
        <div className="subscore-card">
          <span className="subscore-label">Domain</span>
          <span className="subscore-value">{subscores.domain}</span>
        </div>
        <div className="subscore-card">
          <span className="subscore-label">Keyword</span>
          <span className="subscore-value">{subscores.keyword}</span>
        </div>
      </div>
    </div>
  )
}