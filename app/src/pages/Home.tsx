import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runAnalysis } from '../analysis/engine'
import { setCurrentAnalysis, loadSampleTexts } from '../store'
import type { Analysis } from '../types'

export default function Home() {
  const navigate = useNavigate()
  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [validationMsg, setValidationMsg] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const resumeChars = resume.replace(/\s/g, '').length
  const jdChars = jd.replace(/\s/g, '').length
  const canAnalyze = resumeChars >= 80 && jdChars >= 80

  async function handleAnalyze() {
    if (!canAnalyze) {
      const issues: string[] = []
      if (resumeChars < 80) issues.push('Resume needs at least 80 non-whitespace characters (currently ' + resumeChars + ')')
      if (jdChars < 80) issues.push('Job description needs at least 80 non-whitespace characters (currently ' + jdChars + ')')
      setValidationMsg(issues.join('. ') + '.')
      return
    }
    setValidationMsg('')
    setAnalyzing(true)
    const result = await runAnalysis(resume, jd)
    const analysis: Analysis = {
      id: crypto.randomUUID(),
      resumeText: resume,
      jobDescriptionText: jd,
      createdAt: new Date().toISOString(),
      result,
      planCompletion: {},
      mockScores: {},
      retryScores: {},
    }
    setCurrentAnalysis(analysis)
    setAnalyzing(false)
    navigate('/fit-score')
  }

  function handleLoadSample() {
    const samples = loadSampleTexts()
    setResume(samples.resume)
    setJd(samples.jd)
    setValidationMsg('')
  }

  function handleClear() {
    setResume('')
    setJd('')
    setValidationMsg('')
  }

  return (
    <div className="page home-page">
      <h2>Analyse your resume and job description</h2>

      <div className="input-group">
        <label htmlFor="resume-input">Resume</label>
        <textarea
          id="resume-input"
          value={resume}
          onChange={e => { setResume(e.target.value); setValidationMsg('') }}
          placeholder="Paste your resume here..."
          rows={10}
        />
        <span className="char-count">{resumeChars} / 80 non-whitespace characters</span>
      </div>

      <div className="input-group">
        <label htmlFor="jd-input">Job description</label>
        <textarea
          id="jd-input"
          value={jd}
          onChange={e => { setJd(e.target.value); setValidationMsg('') }}
          placeholder="Paste the job description here..."
          rows={10}
        />
        <span className="char-count">{jdChars} / 80 non-whitespace characters</span>
      </div>

      {validationMsg && <div className="validation-msg" role="alert">{validationMsg}</div>}

      <div className="action-bar">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="btn btn-primary"
          aria-label={canAnalyze ? 'Analyse resume and job description' : 'Analyse requires at least 80 characters in each field'}
        >
          {analyzing ? 'Analysing...' : 'Analyse'}
        </button>
        <button onClick={handleLoadSample} className="btn btn-secondary">Load sample</button>
        <button onClick={handleClear} className="btn btn-secondary">Clear</button>
      </div>
    </div>
  )
}