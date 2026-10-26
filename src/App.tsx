import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RadarProvider } from './context/RadarContext'
import { AppLayout } from './components/layout/AppLayout'

// Pages
import { Dashboard } from './pages/Dashboard'
import { Explore } from './pages/Explore'
import { OpportunityDetail } from './pages/OpportunityDetail'
import { Saved } from './pages/Saved'
import { Tracker } from './pages/Tracker'
import { Deadlines } from './pages/Deadlines'
import { Profile } from './pages/Profile'
import { Admin } from './pages/Admin'
import { NotFound } from './pages/NotFound'

export const App: React.FC = () => {
  return (
    <RadarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="explore" element={<Explore />} />
            <Route path="opportunity/:id" element={<OpportunityDetail />} />
            <Route path="saved" element={<Saved />} />
            <Route path="tracker" element={<Tracker />} />
            <Route path="deadlines" element={<Deadlines />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RadarProvider>
  )
}

export default App
