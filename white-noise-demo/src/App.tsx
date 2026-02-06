import Home from '@/pages/Home'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/other"
          element={<div className="text-center text-xl">Other Page - Coming Soon</div>}
        />
      </Routes>
    </Router>
  )
}
