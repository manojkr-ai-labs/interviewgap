import { getCurrentAnalysis } from '../store'

export default function GapMatrix() {
  const analysis = getCurrentAnalysis()
  if (!analysis) return null

  const { requirements } = analysis.result
  const resumeText = analysis.resumeText
  const jobDescriptionText = analysis.jobDescriptionText

  return (
    <div className="page gap-matrix-page">
      <h2>Gap matrix</h2>

      {requirements.length === 0 ? (
        <div className="empty-matrix">
          <p>No distinct requirements were identified in the submitted job description. The source material is shown below for reference.</p>
        </div>
      ) : (
        <div className="requirements-table-wrapper">
          <table className="requirements-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Resume evidence</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map(req => (
                <tr key={req.id}>
                  <td className="req-text">{req.text}</td>
                  <td>
                    <span className={`priority priority-${req.priority === 'Must-have' ? 'must' : 'nice'}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status status-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="evidence-cell">{req.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="source-material">
        <summary>Source material</summary>
        <div className="source-columns">
          <div>
            <h4>Resume</h4>
            <pre>{resumeText}</pre>
          </div>
          <div>
            <h4>Job description</h4>
            <pre>{jobDescriptionText}</pre>
          </div>
        </div>
      </details>
    </div>
  )
}