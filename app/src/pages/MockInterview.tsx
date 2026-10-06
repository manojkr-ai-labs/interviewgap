import { useState } from 'react'
import { getCurrentAnalysis, updateMockScore } from '../store'

export default function MockInterview() {
  const analysis = getCurrentAnalysis()
  if (!analysis) return null

  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const questions = analysis.result.mockQuestions
  const scores = { ...analysis.mockScores, ...analysis.retryScores }

  const totalScore = Object.values(scores).reduce<number>((sum, s) => sum + (s ?? 0), 0)

  function toggleReveal(id: string) {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleScoreInput(questionId: string, raw: string) {
    setInputValues(prev => ({ ...prev, [questionId]: raw }))

    if (raw === '') {
      setFieldErrors(prev => {
        const copy = { ...prev }
        delete copy[questionId]
        return copy
      })
      updateMockScore(questionId, null)
      return
    }

    const num = Number(raw)
    if (!Number.isInteger(num) || raw.includes('.') || num < 1 || num > 5) {
      setFieldErrors(prev => ({ ...prev, [questionId]: 'Enter a whole number from 1 through 5.' }))
      return
    }

    setFieldErrors(prev => {
      const copy = { ...prev }
      delete copy[questionId]
      return copy
    })
    updateMockScore(questionId, num)
  }

  return (
    <div className="page mock-page">
      <h2>Mock interview</h2>

      <div className="mock-total">
        <span>Total score: </span>
        <strong>{totalScore} / 50</strong>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="question-card">
          <div className="question-header">
            <span className="question-number">Question {idx + 1}</span>
            <span className={`question-category category-${q.category}`}>{q.category}</span>
          </div>
          <p className="question-text">{q.question}</p>

          <div className="model-answer-section">
            <button
              className="btn btn-link"
              onClick={() => toggleReveal(q.id)}
              aria-expanded={revealed[q.id] || false}
            >
              {revealed[q.id] ? 'Hide model answer' : 'Show model answer'}
            </button>
            {revealed[q.id] && (
              <div className="model-answer">
                <p>{q.modelAnswer}</p>
              </div>
            )}
          </div>

          <div className="score-input-section">
            <label htmlFor={`score-${q.id}`}>
              Score (1–5):
            </label>
            <input
              id={`score-${q.id}`}
              type="text"
              inputMode="numeric"
              className="score-input"
              value={inputValues[q.id] ?? (scores[q.id] !== null && scores[q.id] !== undefined ? String(scores[q.id]) : '')}
              onChange={e => handleScoreInput(q.id, e.target.value)}
              placeholder="–"
              aria-describedby={fieldErrors[q.id] ? `err-${q.id}` : undefined}
            />
            {fieldErrors[q.id] && (
              <span id={`err-${q.id}`} className="field-error" role="alert">{fieldErrors[q.id]}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}