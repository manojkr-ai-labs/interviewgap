import { getCurrentAnalysis, updatePlanCompletion } from '../store'

export default function SevenDayPlan() {
  const analysis = getCurrentAnalysis()
  if (!analysis) return null

  const { sevenDayPlan } = analysis.result
  const completion = analysis.planCompletion

  function handleToggle(taskId: string, current: boolean) {
    updatePlanCompletion(taskId, !current)
  }

  return (
    <div className="page plan-page">
      <h2>7-day preparation plan</h2>

      {sevenDayPlan.map(day => (
        <div key={day.dayNumber} className="day-card">
          <h3>Day {day.dayNumber} — {day.date}</h3>

          <div className="task-row">
            <span className={`task-type ${completion[day.primaryTask.id] ? 'completed' : ''}`}>Primary (75 min)</span>
            <label className="task-label">
              <input
                type="checkbox"
                checked={completion[day.primaryTask.id] || false}
                onChange={() => handleToggle(day.primaryTask.id, completion[day.primaryTask.id] || false)}
              />
              <span className={completion[day.primaryTask.id] ? 'task-done' : ''}>
                {day.primaryTask.description}
              </span>
            </label>
          </div>

          <div className="task-row">
            <span className={`task-type ${completion[day.backupTask.id] ? 'completed' : ''}`}>Backup (20 min)</span>
            <label className="task-label">
              <input
                type="checkbox"
                checked={completion[day.backupTask.id] || false}
                onChange={() => handleToggle(day.backupTask.id, completion[day.backupTask.id] || false)}
              />
              <span className={completion[day.backupTask.id] ? 'task-done' : ''}>
                {day.backupTask.description}
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}