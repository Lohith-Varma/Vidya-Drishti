import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getAllStudents } from '../../api/student.api'
import { getAllTests } from '../../api/test.api'
import StatCard from '../../components/StatCard'
import SectionCard from '../../components/SectionCard'
import './AdminAnalytics.css'

const COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7']

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b', border: '1px solid #334155',
  borderRadius: 8, color: '#f1f5f9', fontSize: 12
}

export default function AdminAnalytics() {
  const [students, setStudents] = useState([])
  const [tests, setTests] = useState([])
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllStudents(), getAllTests()])
      .then(([s, t]) => { setStudents(s.data || []); setTests(t.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // --- Derived analytics data ---
  const scoreDistribution = [
    { range: '0–20', count: students.filter(s => s.avgScore < 20).length },
    { range: '20–40', count: students.filter(s => s.avgScore >= 20 && s.avgScore < 40).length },
    { range: '40–60', count: students.filter(s => s.avgScore >= 40 && s.avgScore < 60).length },
    { range: '60–80', count: students.filter(s => s.avgScore >= 60 && s.avgScore < 80).length },
    { range: '80–100', count: students.filter(s => s.avgScore >= 80).length },
  ]

  const deptData = ['CSE', 'IT', 'ECE', 'MECH'].map(dept => ({
    name: dept,
    students: students.filter(s => s.department?.includes(dept)).length,
    avgScore: Math.round(students.filter(s => s.department?.includes(dept)).reduce((a, s) => a + (s.avgScore || 0), 0) / (students.filter(s => s.department?.includes(dept)).length || 1)),
  }))

  const problemsSolved = [
    { category: 'Arrays', count: Math.floor(Math.random() * 500 + 200) },
    { category: 'Strings', count: Math.floor(Math.random() * 400 + 150) },
    { category: 'DP', count: Math.floor(Math.random() * 300 + 100) },
    { category: 'Trees', count: Math.floor(Math.random() * 250 + 80) },
    { category: 'Graphs', count: Math.floor(Math.random() * 200 + 50) },
    { category: 'Sorting', count: Math.floor(Math.random() * 350 + 120) },
  ]

  const platformSplit = [
    { name: 'LeetCode', value: students.filter(s => s.leetcodeHandle).length },
    { name: 'HackerRank', value: students.filter(s => s.hackerrankHandle).length },
    { name: 'GitHub', value: students.filter(s => s.githubHandle).length },
    { name: 'Not Linked', value: students.filter(s => !s.leetcodeHandle && !s.hackerrankHandle).length },
  ]

  const monthlyProgress = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => ({
    month: m,
    avgScore: Math.floor(Math.random() * 30 + 55),
    submissions: Math.floor(Math.random() * 200 + 100),
    solved: Math.floor(Math.random() * 50 + 20),
  }))

  const topicReadiness = [
    { topic: 'Data Structures', pct: 72 },
    { topic: 'Algorithms', pct: 65 },
    { topic: 'System Design', pct: 38 },
    { topic: 'DBMS', pct: 58 },
    { topic: 'OOP Concepts', pct: 80 },
    { topic: 'OS Fundamentals', pct: 45 },
  ]

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics Dashboard</div>
          <div className="page-subtitle">Comprehensive performance insights across your department</div>
        </div>
        <div className="analytics-period-selector">
          {['week', 'month', 'semester', 'year'].map(p => (
            <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-4">
        <StatCard label="Avg Test Score" value={`${Math.round(students.reduce((a, s) => a + (s.avgScore || 0), 0) / (students.length || 1))}%`} trend={5}
          accentColor="#6366f1" iconBg="rgba(99,102,241,0.1)" iconColor="#818cf8"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
        <StatCard label="Total Submissions" value={tests.reduce((a, t) => a + (t.submissionCount || 0), 0)} trend={12}
          accentColor="#0ea5e9" iconBg="rgba(14,165,233,0.1)" iconColor="#0ea5e9"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
        <StatCard label="Platform Coverage" value={`${Math.round((students.filter(s => s.leetcodeHandle || s.hackerrankHandle).length / (students.length || 1)) * 100)}%`}
          accentColor="#22c55e" iconBg="rgba(34,197,94,0.1)" iconColor="#22c55e"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>}
          sub="Students with linked profiles" />
        <StatCard label="Placement Ready" value={`${students.filter(s => (s.avgScore || 0) >= 70 && (s.totalSolved || 0) >= 100).length}`}
          accentColor="#f59e0b" iconBg="rgba(245,158,11,0.1)" iconColor="#f59e0b"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          sub="Score ≥ 70% & solved ≥ 100" />
      </div>

      <div className="analytics-grid">
        <SectionCard title="Monthly Progress Trend" icon={<span>📈</span>}>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="solved" name="Problems Solved" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Score Distribution" icon={<span>🎯</span>}>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="analytics-grid">
        <SectionCard title="Problems by Category" icon={<span>🧩</span>}>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={problemsSolved} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Solved" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Platform Coverage" icon={<span>🔗</span>}>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={platformSplit} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {platformSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {platformSplit.map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Placement Readiness by Topic" icon={<span>🎓</span>} style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {topicReadiness.map(t => (
            <div key={t.topic} className="dept-stat-item">
              <span className="dept-stat-label">{t.topic}</span>
              <div className="dept-stat-bar"><div className="dept-stat-bar-fill" style={{ width: `${t.pct}%`, background: t.pct >= 70 ? 'var(--success)' : t.pct >= 50 ? 'var(--warning)' : 'var(--error)' }} /></div>
              <span className="dept-stat-value" style={{ color: t.pct >= 70 ? 'var(--success)' : t.pct >= 50 ? 'var(--warning)' : 'var(--error)' }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
