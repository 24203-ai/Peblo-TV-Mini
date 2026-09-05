import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'

import { Dashboard } from './pages/Dashboard'
import { Shows } from './pages/Shows'
import { ShowForm } from './pages/ShowForm'
import { EpisodeForm } from './pages/EpisodeForm'
import { Publish } from './pages/Publish'
import { ShowSeasons } from './pages/ShowSeasons'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unprotected Routes */}
        <Route path="/" element={<Layout />}>
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
