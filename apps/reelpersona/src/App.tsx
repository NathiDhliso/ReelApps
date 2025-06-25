import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import ReelPersona from './components/ReelPersona'
import './index.css'

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-[var(--bg-primary)]">
        <header className="bg-[var(--brand-primary)] text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                <span className="font-bold">R</span>
              </div>
              <h1 className="text-xl font-bold">ReelPersona</h1>
            </div>
            <nav>
              <a href="https://reelapps.co.za" className="text-white/90 hover:text-white">
                Back to ReelApps
              </a>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <ReelPersona />
        </main>
      </div>
    </Router>
  )
}

export default App