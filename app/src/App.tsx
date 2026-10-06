import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FitScore from './pages/FitScore'
import GapMatrix from './pages/GapMatrix'
import SevenDayPlan from './pages/SevenDayPlan'
import MockInterview from './pages/MockInterview'
import Review from './pages/Review'
import ExportPage from './pages/Export'
import HistoryPage from './pages/History'
import { getCurrentAnalysis } from './store'

function RequireAnalysis({ children }: { children: React.ReactNode }) {
  const analysis = getCurrentAnalysis()
  if (!analysis) {
    return (
      <div className="analysis-required">
        <p>This view requires an analysis. Go to <Link to="/">Home</Link> to analyse a resume and job description first.</p>
      </div>
    )
  }
  return <>{children}</>
}

function RoutesWrapper() {
  const location = useLocation()
  const isRoot = location.pathname === '/'

  if (isRoot) return <Home />

  return (
    <RequireAnalysis>
      <Routes>
        <Route path="/fit-score" element={<FitScore />} />
        <Route path="/gap-matrix" element={<GapMatrix />} />
        <Route path="/7-day-plan" element={<SevenDayPlan />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/review" element={<Review />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RequireAnalysis>
  )
}

export default function App() {
  return (
    <Layout>
      <RoutesWrapper />
    </Layout>
  )
}