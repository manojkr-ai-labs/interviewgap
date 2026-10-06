import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getState, setCurrentAnalysis, duplicateAnalysis, deleteAnalysis } from '../store'
import type { Analysis } from '../types'

function formatISTDate(iso: string): string {
  const date = new Date(iso)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return date.toLocaleDateString('en-IN', options)
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [state, setState] = useState(getState())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function refresh() {
    setState({ ...getState() })
  }

  function handleOpen(analysis: Analysis) {
    setCurrentAnalysis(analysis)
    navigate('/fit-score')
  }

  function handleDuplicate(id: string) {
    duplicateAnalysis(id)
    refresh()
    navigate('/fit-score')
  }

  function handleDelete(id: string) {
    deleteAnalysis(id)
    setConfirmDelete(null)
    refresh()
  }

  if (state.analyses.length === 0) {
    return (
      <div className="page history-page">
        <h2>History</h2>
        <div className="empty-state">
          <p>No saved analyses yet. Go to <Link to="/">Home</Link> to analyse a resume and job description.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page history-page">
      <h2>History</h2>

      <div className="history-list">
        {state.analyses.map(a => {
          const isCurrent = a.id === state.currentAnalysisId
          return (
            <div key={a.id} className={`history-entry ${isCurrent ? 'current' : ''}`}>
              <div className="entry-info">
                <span className="entry-title">{a.result.roleTitle}</span>
                <span className="entry-date">{formatISTDate(a.createdAt)}</span>
                {isCurrent && <span className="current-badge">Current</span>}
              </div>
              <div className="entry-actions">
                <button onClick={() => handleOpen(a)} className="btn btn-sm">Open</button>
                <button onClick={() => handleDuplicate(a.id)} className="btn btn-sm">Duplicate</button>
                {confirmDelete === a.id ? (
                  <span className="delete-confirm">
                    <span>Delete this entry?</span>
                    <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-danger">Confirm</button>
                    <button onClick={() => setConfirmDelete(null)} className="btn btn-sm">Cancel</button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmDelete(a.id)} className="btn btn-sm btn-danger">Delete</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}