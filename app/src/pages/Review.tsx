import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentAnalysis, applyRetryScores, replaceMockScore } from '../store'

export default function Review() {
  const analysis = getCurrentAnalysis()
  const navigate = useNavigate()
  if (!analysis) return null

  const questions = analysis.result.mockQuestions
  const scores = analysis.mockScores
  const [retrying, setRetrying] = useState(false)
  const [retryInputs, setRetryInputs] = useState<Record<string, string>>({})
  const [retryErrors, setRetryErrors] = useState<Record<string, string>>({})

  const scoredCount = questions.filter(q => scores[q.id] !== null && scores[q.id] !== undefined).length
  const allScored = scoredCount === questions.length

  const scoredQs = questions.map(q => ({
    ...q,
    score: scores[q.id] ?? null,
  }))

  const weakestThree = allScored
    ? [...scoredQs]
        .sort((a, b) => {
          const sa = a.score ?? 0
          const sb = b.score ?? 0
          if (sa !== sb) return sa - sb
          return scoredQs.indexOf(a) - scoredQs.indexOf(b)
        })
        .slice(0, 3)
    : []

  function handleRetry() {
    setRetrying(true)
    setRetryInputs({})
    setRetryErrors({})
  }

  function handleRetryScore(questionId: string, raw: string) {
    setRetryInputs(prev => ({ ...prev, [questionId]: raw }))

    if (raw === '') {
      setRetryErrors(prev => {
        const copy = { ...prev }
        delete copy[questionId]
        return copy
      })
      return
    }

    const num = Number(raw)
    if (!Number.isInteger(num) || raw.includes('.') || num < 1 || num > 5) {
      setRetryErrors(prev => ({ ...prev, [questionId]: 'Enter a whole number from 1 through 5.' }))
      return
    }

    setRetryErrors(prev => {
      const copy = { ...prev }
      delete copy[questionId]
      return copy
    })
    replaceMockScore(questionId, num)
  }

  function handleSubmitRetry() {
    const hasErrors = Object.keys(retryErrors).length > 0
    if (hasErrors) return
    applyRetryScores()
    setRetrying(false)
    navigate('/mock-interview')
  }

  if (!allScored && !retrying) {
    return (
      <div className="page review-page">
        <h2>Review</h2>
        <div className="blocked-state">
          <p>A complete review requires all ten mock questions to have valid scores.</p>
          <p>{10 - scoredCount} question{10 - scoredCount !== 1 ? 's' : ''} still need{10 - scoredCount === 1 ? 's' : ''} a score.</p>
          <p>Go to <Link to="/mock-interview">Mock interview</Link> to score the remaining questions.</p>
        </div>
      </div>
    )
  }

  if (retrying) {
    return (
      <div className="page review-page">
        <h2>Retry weakest questions</h2>
        {weakestThree.map((q, idx) => (
          <div key={q.id} className="question-card retry-card">
            <div className="question-header">
              <span className="question-number">Weakest {idx + 1}</span>
              <span className={`question-category category-${q.category}`}>{q.category}</span>
            </div>
            <p className="question-text">{q.question}</p>
            <div className="score-input-section">
              <label htmlFor={`retry-${q.id}`}>Score (1–5):</label>
              <input
                id={`retry-${q.id}`}
                type="text"
                inputMode="numeric"
                className="score-input"
                value={retryInputs[q.id] ?? ''}
                onChange={e => handleRetryScore(q.id, e.target.value)}
                placeholder="–"
                aria-describedby={retryErrors[q.id] ? `rerr-${q.id}` : undefined}
              />
              {retryErrors[q.id] && (
                <span id={`rerr-${q.id}`} className="field-error" role="alert">{retryErrors[q.id]}</span>
              )}
            </div>
          </div>
        ))}
        <div className="action-bar">
          <button onClick={handleSubmitRetry} className="btn btn-primary">Submit retry scores</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page review-page">
      <h2>Review</h2>
      <p className="role-title">{analysis.result.roleTitle}</p>

      <h3>Three weakest questions</h3>
      {weakestThree.map((q, idx) => (
        <div key={q.id} className="question-card weak-card">
          <div className="question-header">
            <span className="question-number">Weakest {idx + 1}</span>
            <span className={`question-category category-${q.category}`}>{q.category}</span>
          </div>
          <p className="question-text">{q.question}</p>
          <p className="weak-score">Score: {q.score} / 5</p>
        </div>
      ))}

      <div className="action-bar">
        <button onClick={handleRetry} className="btn btn-primary">Retry weakest</button>
      </div>
    </div>
  )
}