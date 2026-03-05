// StudentLayout.jsx
import { Outlet } from 'react-router-dom'
import LeftNav from '../components/LeftNav'
import Header  from '../components/Header'

export default function StudentLayout() {
  return (
    <div className="app-layout">
      <LeftNav />
      <div className="main-area">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
