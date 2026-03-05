import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import { getTestById, getTestSubmissions } from '../../api/test.api'
import SectionCard from '../../components/SectionCard'
import Table from '../../components/Table'
import './AssessmentDetail.css'

export default function AssessmentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeQ, setActiveQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)

  const isAdmin = user.role === 'admin'

  useEffect(() => {
    Promise.all([
      getTestById(id),
      isAdmin ? getTestSubmissions(id) : Promise.resolve({ data: [] })
    ]).then(([testRes, subRes]) => {
      setTest(testRes.data)
      setSubmissions(subRes.data || [])
      if (testRes.data?.duration) setTimeLeft(testRes.data.duration * 60)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id, isAdmin])

  useEffect(() => {
    if (timeLeft === null || isAdmin) return
    timerRef.current = setInterval(() => setTimeLeft(t => t <= 0 ? 0 : t - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft, isAdmin])

  const formatTime = (secs) => {
    if (secs === null) return '--:--'
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const submissionCols = [
    { key: 'studentName', label: 'Student', render: (v, row) => (
      <div className="table-user">
        <div className="table-avatar">{v?.slice(0,2).toUpperCase()}</div>
        <div><div className="table-user-name">{v}</div><div className="table-user-sub">{row.rollNumber}</div></div>
      </div>
    )},
    { key: 'score', label: 'Score', render: (v, row) => <strong style={{ color: 'var(--primary-light)' }}>{v}/{row.maxScore}</strong> },
    { key: 'percentage', label: '%', render: (_, row) => {
      const p = Math.round((row.score / row.maxScore) * 100)
      return <span className={p >= 70 ? 'text-success' : p >= 40 ? 'text-warning' : 'text-error'}>{p}%</span>
    }},
    { key: 'submittedAt', label: 'Submitted', render: v => v ? new Date(v).toLocaleString() : '—' },
    { key: 'status', label: 'Status', render: (_, row) => {
      const p = Math.round((row.score / row.maxScore) * 100)
      return <span className={`badge ${p >= 70 ? 'badge-success' : p >= 40 ? 'badge-warning' : 'badge-error'}`}>{p >= 70 ? 'Pass' : 'Needs Review'}</span>
    }},
  ]

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>
  if (!test) return <div className="empty-state"><div className="empty-icon">❌</div><h3>Assessment not found</h3></div>

  const now = new Date()
  const isLive = new Date(test.startDate) <= now && new Date(test.endDate) >= now

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{test.title}</div>
          <div className="page-subtitle">{test.subject} · {test.duration} min · {test.questions?.length || 0} questions · {test.maxScore} pts</div>
        </div>
        {!isAdmin && isLive && (
          <button className="btn btn-primary" onClick={() => navigate(`/student/assessment/${id}/solve`)}>
            ▶ Start / Resume Test
          </button>
        )}
      </div>

      {!isAdmin && timeLeft !== null && (
        <div className="detail-meta-bar">
          <span>⏱ Time Remaining:</span>
          <span className={`countdown-timer ${timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            Status: <span className={`badge ${isLive ? 'badge-error' : 'badge-success'}`}>{isLive ? '🔴 Live' : '✓ Ended'}</span>
          </span>
        </div>
      )}

      <div className="assessment-detail-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionCard title="Instructions" icon={<span>📌</span>}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
              {test.description || 'Read each question carefully. All test cases must pass for full marks. You may use any allowed programming language.'}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-3)' }}>
              <span>📅 Start: {new Date(test.startDate).toLocaleString()}</span>
              <span>📅 End: {new Date(test.endDate).toLocaleString()}</span>
              <span>💻 Languages: {test.language || 'Multiple'}</span>
              {test.proctored && <span>👁 Proctored</span>}
            </div>
          </SectionCard>

          {test.questions?.map((q, i) => (
            <SectionCard key={i} title={`Q${i + 1}: ${q.title}`} icon={
              <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
                {q.difficulty}
              </span>
            } actions={<span style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 13 }}>{q.marks} pts</span>}>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8, marginBottom: q.testCases?.length ? 16 : 0 }}>
                {q.description}
              </p>
              {q.testCases?.filter(tc => !tc.hidden).map((tc, j) => (
                <div key={j} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontWeight: 600 }}>EXAMPLE {j + 1}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[{ label: 'Input', val: tc.input }, { label: 'Output', val: tc.output }].map(ex => (
                      <div key={ex.label} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{ex.label}</div>
                        <pre style={{ fontSize: 12, color: 'var(--text-1)', fontFamily: 'Courier New, monospace', whiteSpace: 'pre-wrap', margin: 0 }}>{ex.val}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </SectionCard>
          ))}

          {isAdmin && (
            <SectionCard title={`Submissions (${submissions.length})`} icon={<span>📊</span>} noPadding>
              <Table columns={submissionCols} data={submissions} pageSize={10} />
            </SectionCard>
          )}
        </div>

        <div className="question-nav">
          <SectionCard title="Questions" icon={<span>🗂</span>} noPadding>
            {test.questions?.map((q, i) => (
              <button key={i} className={`question-nav-item${activeQ === i ? ' active' : ''}`} onClick={() => setActiveQ(i)}>
                <div className={`qn-status-dot${activeQ === i ? ' active' : ''}`} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>Q{i + 1}: {q.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{q.marks} pts · {q.difficulty}</div>
                </div>
              </button>
            ))}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
