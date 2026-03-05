import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTest } from '../../api/test.api'
import toast from 'react-hot-toast'
import SectionCard from '../../components/SectionCard'
import './CreateAssessment.css'

const DEFAULT_QUESTION = () => ({
  id: Date.now() + Math.random(),
  title: '', description: '', difficulty: 'medium',
  marks: 10, timeLimit: 1000, memoryLimit: 256,
  testCases: [{ input: '', output: '', hidden: false }]
})

export default function CreateAssessment() {
  const navigate = useNavigate()
  const [meta, setMeta] = useState({
    title: '', subject: '', description: '', duration: 60,
    maxScore: 100, startDate: '', endDate: '', allowedBranches: [],
    language: 'multiple', proctored: false
  })
  const [questions, setQuestions] = useState([DEFAULT_QUESTION()])
  const [saving, setSaving] = useState(false)
  const [activeQ, setActiveQ] = useState(0)

  const handleMetaChange = e => {
    const { name, value, type, checked } = e.target
    setMeta(m => ({ ...m, [name]: type === 'checkbox' ? checked : value }))
  }

  const updateQuestion = (idx, field, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  const addQuestion = () => {
    setQuestions(qs => [...qs, DEFAULT_QUESTION()])
    setActiveQ(questions.length)
  }

  const removeQuestion = (idx) => {
    if (questions.length === 1) { toast.error('Need at least 1 question'); return }
    setQuestions(qs => qs.filter((_, i) => i !== idx))
    setActiveQ(Math.max(0, idx - 1))
  }

  const addTestCase = (qIdx) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx
      ? { ...q, testCases: [...q.testCases, { input: '', output: '', hidden: false }] }
      : q))
  }

  const updateTestCase = (qIdx, tcIdx, field, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx
      ? { ...q, testCases: q.testCases.map((tc, j) => j === tcIdx ? { ...tc, [field]: value } : tc) }
      : q))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!meta.title) { toast.error('Please add a title'); return }
    if (!meta.startDate || !meta.endDate) { toast.error('Set start and end dates'); return }
    if (questions.some(q => !q.title)) { toast.error('All questions need a title'); return }
    setSaving(true)
    try {
      await createTest({ ...meta, questions })
      toast.success('Assessment created successfully!')
      navigate('/admin')
    } catch { toast.error('Failed to create assessment') }
    finally { setSaving(false) }
  }

  const totalMarks = questions.reduce((a, q) => a + Number(q.marks || 0), 0)
  const q = questions[activeQ]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Create Assessment</div>
          <div className="page-subtitle">Build a new coding assessment for your students</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="create-assessment-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SectionCard title="Assessment Details" icon={<span>📋</span>}>
              <div className="profile-form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Assessment Title *</label>
                  <input name="title" className="form-input" value={meta.title} onChange={handleMetaChange} placeholder="e.g. Data Structures Mid-Term Test" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input name="subject" className="form-input" value={meta.subject} onChange={handleMetaChange} placeholder="e.g. CS101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input name="duration" type="number" className="form-input" value={meta.duration} onChange={handleMetaChange} min={10} max={300} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input name="startDate" type="datetime-local" className="form-input" value={meta.startDate} onChange={handleMetaChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input name="endDate" type="datetime-local" className="form-input" value={meta.endDate} onChange={handleMetaChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Language Allowed</label>
                  <select name="language" className="form-select" value={meta.language} onChange={handleMetaChange}>
                    <option value="multiple">Multiple Languages</option>
                    <option value="python">Python Only</option>
                    <option value="cpp">C++ Only</option>
                    <option value="java">Java Only</option>
                    <option value="javascript">JavaScript Only</option>
                  </select>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Description / Instructions</label>
                  <textarea name="description" className="form-textarea" value={meta.description} onChange={handleMetaChange} placeholder="Provide instructions for students..." rows={3} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" name="proctored" checked={meta.proctored} onChange={handleMetaChange} />
                    <span className="form-label" style={{ margin: 0 }}>Enable Proctoring</span>
                  </label>
                </div>
              </div>
            </SectionCard>

            <SectionCard title={`Questions (${questions.length})`} icon={<span>🧠</span>}
              actions={
                <div style={{ display: 'flex', gap: 6 }}>
                  {questions.map((_, i) => (
                    <button key={i} type="button" onClick={() => setActiveQ(i)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${i === activeQ ? 'var(--primary)' : 'var(--border)'}`, background: i === activeQ ? 'var(--primary)' : 'var(--bg-main)', color: i === activeQ ? '#fff' : 'var(--text-3)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              }>

              {q && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Question Title *</label>
                    <input className="form-input" value={q.title} onChange={e => updateQuestion(activeQ, 'title', e.target.value)} placeholder="e.g. Two Sum" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Problem Statement</label>
                    <textarea className="form-textarea" value={q.description} onChange={e => updateQuestion(activeQ, 'description', e.target.value)} placeholder="Describe the problem in detail..." rows={5} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Difficulty</label>
                      <select className="form-select" value={q.difficulty} onChange={e => updateQuestion(activeQ, 'difficulty', e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marks</label>
                      <input type="number" className="form-input" value={q.marks} onChange={e => updateQuestion(activeQ, 'marks', e.target.value)} min={1} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time Limit (ms)</label>
                      <input type="number" className="form-input" value={q.timeLimit} onChange={e => updateQuestion(activeQ, 'timeLimit', e.target.value)} step={500} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Test Cases</div>
                    {q.testCases.map((tc, tcIdx) => (
                      <div key={tcIdx} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Test Case #{tcIdx + 1}</span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={tc.hidden} onChange={e => updateTestCase(activeQ, tcIdx, 'hidden', e.target.checked)} />
                            <span style={{ color: 'var(--text-3)' }}>Hidden</span>
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Input</div>
                            <textarea className="form-textarea" value={tc.input} onChange={e => updateTestCase(activeQ, tcIdx, 'input', e.target.value)} rows={2} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Expected Output</div>
                            <textarea className="form-textarea" value={tc.output} onChange={e => updateTestCase(activeQ, tcIdx, 'output', e.target.value)} rows={2} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => addTestCase(activeQ)} style={{ marginTop: 4 }}>+ Add Test Case</button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(activeQ)}>🗑 Remove Question</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>+ Add Another Question</button>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="assessment-preview">
            <div className="preview-title">📋 Assessment Preview</div>
            {[
              { label: 'Title', value: meta.title || '—' },
              { label: 'Subject', value: meta.subject || '—' },
              { label: 'Duration', value: meta.duration ? `${meta.duration} min` : '—' },
              { label: 'Questions', value: questions.length },
              { label: 'Total Marks', value: totalMarks },
              { label: 'Language', value: meta.language },
              { label: 'Start', value: meta.startDate ? new Date(meta.startDate).toLocaleString() : '—' },
              { label: 'End', value: meta.endDate ? new Date(meta.endDate).toLocaleString() : '—' },
              { label: 'Proctored', value: meta.proctored ? 'Yes' : 'No' },
            ].map(r => (
              <div key={r.label} className="preview-row">
                <span className="preview-label">{r.label}</span>
                <span className="preview-value">{String(r.value)}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question Summary</div>
              {questions.map((q, i) => (
                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-2)' }}>{i + 1}. {q.title || `Question ${i + 1}`}</span>
                  <span style={{ color: q.difficulty === 'easy' ? 'var(--success)' : q.difficulty === 'medium' ? 'var(--warning)' : 'var(--error)', fontSize: 11, fontWeight: 600 }}>
                    {q.marks}pts
                  </span>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }} disabled={saving}>
              {saving ? '⏳ Creating...' : '🚀 Publish Assessment'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
              💾 Save as Draft
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
