import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { getTestById, runCode, submitTestSolution } from '../../api/test.api'
import { useAuth } from '../../App'
import toast from 'react-hot-toast'
import './CodeEditorSandbox.css'

const LANG_STARTERS = {
  python: `# Write your solution below\ndef solution():\n    pass\n\n# Read input\nimport sys\ninput = sys.stdin.read\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Write your solution here\n    \n    return 0;\n}\n`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your solution here\n    }\n}\n`,
  javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on('line', l => lines.push(l));\nrl.on('close', () => {\n    // Write your solution here\n});\n`,
  c: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
}

const LANG_MONACO_MAP = {
  python: 'python', cpp: 'cpp', java: 'java', javascript: 'javascript', c: 'c'
}

const VERDICTS = {
  AC:  { label: '✅ Accepted',           cls: 'verdict-ac'  },
  WA:  { label: '❌ Wrong Answer',       cls: 'verdict-wa'  },
  TLE: { label: '⏱ Time Limit Exceeded', cls: 'verdict-tle' },
  CE:  { label: '🔧 Compilation Error',  cls: 'verdict-ce'  },
  RE:  { label: '💥 Runtime Error',      cls: 'verdict-wa'  },
}

export default function CodeEditorSandbox() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const editorRef = useRef(null)

  const [test, setTest]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeQ, setActiveQ]     = useState(0)
  const [lang, setLang]           = useState('python')
  const [codes, setCodes]         = useState({})     // { qId_lang: code }
  const [running, setRunning]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [outputs, setOutputs]     = useState([])     // console lines
  const [tcResults, setTcResults] = useState([])     // per-testcase result
  const [verdict, setVerdict]     = useState(null)   // 'AC' | 'WA' | ...
  const [activeTC, setActiveTC]   = useState(0)
  const [customInput, setCustomInput] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [timeLeft, setTimeLeft]   = useState(null)
  const [submitted, setSubmitted] = useState({})     // { qId: true }
  const timerRef = useRef(null)

  // ── Fetch test ──────────────────────────────────────────────
  useEffect(() => {
    getTestById(id)
      .then(res => {
        setTest(res.data)
        if (res.data?.duration) setTimeLeft(res.data.duration * 60)
        // Pre-fill starter code for each question
        const initial = {}
        res.data?.questions?.forEach(q => {
          Object.keys(LANG_STARTERS).forEach(l => {
            initial[`${q.id}_${l}`] = LANG_STARTERS[l]
          })
        })
        setCodes(initial)
      })
      .catch(() => toast.error('Failed to load assessment'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Countdown timer ─────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          toast.error('⏰ Time is up! Auto-submitting...')
          handleAutoSubmit()
          return 0
        }
        if (t === 300) toast('⚠ 5 minutes remaining!', { icon: '⏱' })
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft !== null])

  const handleAutoSubmit = () => {
    test?.questions?.forEach((q, i) => {
      if (!submitted[q.id]) handleSubmitQuestion(i, true)
    })
  }

  const formatTime = (secs) => {
    if (secs === null) return '--:--'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
  }

  const codeKey = () => {
    const q = test?.questions?.[activeQ]
    return q ? `${q.id}_${lang}` : null
  }

  const currentCode = () => codes[codeKey()] || LANG_STARTERS[lang] || ''

  const setCode = (val) => {
    const key = codeKey()
    if (key) setCodes(prev => ({ ...prev, [key]: val }))
  }

  // ── Run code (against visible test cases or custom input) ───
  const handleRun = async () => {
    const q = test?.questions?.[activeQ]
    if (!q) return
    setRunning(true)
    setVerdict(null)
    setOutputs([
      { text: `▶  Running with ${lang}...`, cls: 'info' },
      { text: `   Problem: ${q.title}`, cls: 'info' },
      { text: '─'.repeat(50), cls: 'info' },
    ])
    setTcResults([])

    try {
      const payload = {
        code: currentCode(),
        language: lang,
        questionId: q.id,
        input: useCustom ? customInput : null,
        testCases: useCustom ? null : q.testCases?.filter(tc => !tc.hidden)
      }
      const res = await runCode(payload)
      const { results = [], stdout = '' } = res.data

      const newOutputs = []
      if (stdout) {
        newOutputs.push({ text: 'STDOUT:', cls: 'info' })
        stdout.split('\n').forEach(l => newOutputs.push({ text: l, cls: 'result' }))
        newOutputs.push({ text: '─'.repeat(50), cls: 'info' })
      }

      results.forEach((r, i) => {
        newOutputs.push({
          text: `Test Case ${i + 1}: ${r.passed ? '✅ Passed' : '❌ Failed'} ${r.time ? `(${r.time}ms)` : ''}`,
          cls: r.passed ? 'success' : 'error'
        })
        if (!r.passed && r.expected) {
          newOutputs.push({ text: `  Expected: ${r.expected}`, cls: 'warn' })
          newOutputs.push({ text: `  Got:      ${r.actual}`, cls: 'error' })
        }
      })

      setOutputs(prev => [...prev, ...newOutputs])
      setTcResults(results)

      const allPass = results.length > 0 && results.every(r => r.passed)
      if (allPass) {
        setOutputs(prev => [...prev, { text: '\n✅ All visible test cases passed!', cls: 'success' }])
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Execution failed'
      setOutputs(prev => [
        ...prev,
        { text: '🔧 Error:', cls: 'error' },
        { text: errMsg, cls: 'error' }
      ])
    } finally {
      setRunning(false)
    }
  }

  // ── Submit a single question ─────────────────────────────────
  const handleSubmitQuestion = async (qIdx = activeQ, silent = false) => {
    const q = test?.questions?.[qIdx]
    if (!q) return
    if (submitted[q.id] && !silent) { toast('Already submitted!'); return }
    setSubmitting(true)

    const payload = { code: codes[`${q.id}_${lang}`] || LANG_STARTERS[lang], language: lang }
    try {
      const res = await submitTestSolution(id, q.id, payload)
      const { verdict: v, score, results = [] } = res.data

      setSubmitted(prev => ({ ...prev, [q.id]: { verdict: v, score } }))
      setVerdict(v)
      setTcResults(results)

      const allOutputs = [
        { text: `\n📤 Submitted Q${qIdx + 1}: ${q.title}`, cls: 'info' },
        { text: `   Verdict: ${VERDICTS[v]?.label || v}`, cls: v === 'AC' ? 'success' : 'error' },
        { text: `   Score:   ${score} / ${q.marks} pts`, cls: 'result' },
        { text: '─'.repeat(50), cls: 'info' },
      ]
      results.forEach((r, i) => {
        allOutputs.push({
          text: `  TC ${i + 1}: ${r.passed ? '✅ Passed' : '❌ Failed'} ${r.hidden ? '(hidden)' : ''}`,
          cls: r.passed ? 'success' : 'error'
        })
      })
      setOutputs(prev => [...prev, ...allOutputs])

      if (!silent) {
        if (v === 'AC') toast.success(`✅ Accepted! +${score} pts`)
        else toast.error(`${VERDICTS[v]?.label || 'Wrong Answer'}`)
      }
    } catch {
      if (!silent) toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Final submit all ─────────────────────────────────────────
  const handleFinalSubmit = async () => {
    const unsubmitted = test?.questions?.filter(q => !submitted[q.id]) || []
    if (unsubmitted.length > 0) {
      const ok = window.confirm(`You have ${unsubmitted.length} unsubmitted question(s). Submit anyway?`)
      if (!ok) return
    }
    clearInterval(timerRef.current)
    toast.success('✅ Assessment submitted successfully!')
    setTimeout(() => navigate(`/student/assessment/${id}`), 1500)
  }

  const clearOutput = () => setOutputs([])

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>
  if (!test)   return <div className="empty-state"><div className="empty-icon">❌</div><h3>Test not found</h3></div>

  const question    = test.questions?.[activeQ]
  const isSubmitted = question && submitted[question.id]

  return (
    <div>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
        marginBottom: 12, flexWrap: 'wrap'
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{test.title}</div>

        {/* question pills */}
        <div style={{ display: 'flex', gap: 5, flex: 1 }}>
          {test.questions?.map((q, i) => {
            const sub = submitted[q.id]
            const isActive = i === activeQ
            return (
              <button key={i} onClick={() => { setActiveQ(i); setVerdict(null); setTcResults([]) }}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${isActive ? 'var(--primary)' : sub ? (sub.verdict === 'AC' ? 'var(--success)' : 'var(--error)') : 'var(--border)'}`,
                  background: isActive ? 'var(--primary-glow)' : 'var(--bg-card)',
                  color: isActive ? 'var(--primary-light)' : sub ? (sub.verdict === 'AC' ? 'var(--success)' : 'var(--error)') : 'var(--text-3)'
                }}>
                Q{i + 1} {sub ? (sub.verdict === 'AC' ? '✅' : '❌') : ''}
              </button>
            )
          })}
        </div>

        {/* timer */}
        <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800 }}
          className={`countdown-timer ${timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warning' : ''}`}>
          ⏱ {formatTime(timeLeft)}
        </div>

        <button className="btn btn-danger" onClick={handleFinalSubmit}>🏁 Final Submit</button>
      </div>

      {/* ── Verdict banner ── */}
      {verdict && (
        <div className={`verdict-banner ${VERDICTS[verdict]?.cls}`}>
          {VERDICTS[verdict]?.label}
        </div>
      )}

      {/* ── Main sandbox layout ── */}
      <div className="sandbox-layout">

        {/* ── LEFT: Problem statement ── */}
        <div className="sandbox-left">
          <div className="sandbox-toolbar">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
              Q{activeQ + 1}: {question?.title}
            </span>
            <span className={`badge ${question?.difficulty === 'easy' ? 'badge-success' : question?.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
              {question?.difficulty}
            </span>
            <span style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 12 }}>{question?.marks} pts</span>
          </div>

          <div className="problem-panel">
            <h3>{question?.title}</h3>
            <p style={{ marginBottom: 20 }}>{question?.description}</p>

            {question?.testCases?.filter(tc => !tc.hidden).map((tc, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Example {i + 1}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[{ label: 'Input', val: tc.input }, { label: 'Output', val: tc.output }].map(ex => (
                    <div key={ex.label}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{ex.label}</div>
                      <pre style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '8px 12px', fontSize: 12,
                        color: 'var(--text-1)', fontFamily: 'Courier New, monospace',
                        whiteSpace: 'pre-wrap', margin: 0
                      }}>{ex.val || '(empty)'}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {question?.constraints && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Constraints</div>
                <pre style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--text-2)', whiteSpace: 'pre-wrap', margin: 0 }}>{question.constraints}</pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>
              <span>⏱ Time Limit: {question?.timeLimit || 1000}ms</span>
              <span>💾 Memory: {question?.memoryLimit || 256}MB</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Editor + Output ── */}
        <div className="sandbox-right">
          {/* Editor toolbar */}
          <div className="sandbox-toolbar">
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              {Object.keys(LANG_STARTERS).map(l => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
              <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} />
              Custom Input
            </label>

            {isSubmitted && (
              <span className={`badge ${submitted[question.id]?.verdict === 'AC' ? 'badge-success' : 'badge-error'}`}>
                {VERDICTS[submitted[question.id]?.verdict]?.label}
              </span>
            )}

            <div className="sandbox-toolbar-right">
              <button className="btn btn-secondary btn-sm" onClick={handleRun} disabled={running}>
                {running ? '⏳ Running...' : '▶ Run'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleSubmitQuestion()} disabled={submitting || !!isSubmitted}>
                {submitting ? '⏳ Submitting...' : isSubmitted ? '✓ Submitted' : '📤 Submit'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="editor-area" style={{ flex: '1 1 0', minHeight: 0 }}>
            <Editor
              height="100%"
              language={LANG_MONACO_MAP[lang]}
              value={currentCode()}
              onChange={setCode}
              onMount={ed => { editorRef.current = ed }}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: '"Cascadia Code", "Fira Code", "Courier New", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                suggestOnTriggerCharacters: true,
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Custom input field */}
          {useCustom && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Custom Input (stdin)</div>
              <textarea
                className="form-textarea"
                rows={3}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Enter custom input here..."
                style={{ fontFamily: 'monospace', fontSize: 12 }}
              />
            </div>
          )}

          {/* Test case result tabs */}
          {tcResults.length > 0 && (
            <div className="test-case-tabs">
              {tcResults.map((r, i) => (
                <button key={i}
                  className={`tc-tab${activeTC === i ? ' active' : ''} ${r.passed ? 'pass' : 'fail'}`}
                  onClick={() => setActiveTC(i)}>
                  TC {i + 1} {r.passed ? '✅' : '❌'} {r.hidden ? '🔒' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Output panel */}
          <div className="output-panel" style={{ flex: '0 0 180px', minHeight: 120 }}>
            {outputs.length === 0 ? (
              <div style={{ color: '#334155', padding: 8 }}>
                // Output will appear here after running your code...
              </div>
            ) : (
              outputs.map((line, i) => (
                <div key={i} className={`output-line ${line.cls}`}>
                  {line.text}
                </div>
              ))
            )}
            {tcResults.length > 0 && tcResults[activeTC] && !tcResults[activeTC].passed && (
              <div style={{ marginTop: 12, borderTop: '1px solid #1e293b', paddingTop: 10 }}>
                <div style={{ color: '#64748b', marginBottom: 4 }}>TC {activeTC + 1} Details:</div>
                {tcResults[activeTC].input !== undefined && <div className="output-line warn">Input:    {tcResults[activeTC].input}</div>}
                {tcResults[activeTC].expected !== undefined && <div className="output-line warn">Expected: {tcResults[activeTC].expected}</div>}
                {tcResults[activeTC].actual !== undefined && <div className="output-line error">Got:      {tcResults[activeTC].actual}</div>}
              </div>
            )}
          </div>

          {/* Output toolbar */}
          <div className="output-toolbar">
            <span>🖥 Console Output</span>
            <button onClick={clearOutput} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 11, marginLeft: 'auto' }}>
              🗑 Clear
            </button>
            {running && <span style={{ color: 'var(--accent)' }}>⏳ Executing...</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
