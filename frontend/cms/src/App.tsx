import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Shows } from './pages/Shows'
import { ShowForm } from './pages/ShowForm'
import { EpisodeForm } from './pages/EpisodeForm'
import { Publish } from './pages/Publish'
import { ShowSeasons } from './pages/ShowSeasons'
import { useAuthStore } from './store/authStore'

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="shows" element={<Shows />} />
          <Route path="shows/new" element={<ShowForm />} />
          <Route path="shows/:id/edit" element={<ShowForm />} />
          <Route path="shows/:id/seasons" element={<ShowSeasons />} />
          <Route path="episodes/new" element={<EpisodeForm />} />
          <Route path="episodes/:id/edit" element={<EpisodeForm />} />
          <Route path="publish" element={<Publish />} />
          {/* Add more routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
