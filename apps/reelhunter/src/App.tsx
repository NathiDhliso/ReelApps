import { useEffect } from 'react'
import ReelHunter from './components/ReelHunter'
import './index.css'

function App() {
  useEffect(() => {
    // Force dark mode and gradient background
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('gradient-background');
  }, []);

  return (
    <div className="App" style={{ background: 'var(--gradient-hero)', minHeight: '100vh' }}>
      <header style={{
        background: 'var(--gradient-secondary)',
        padding: '1.5rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{
          background: 'var(--gradient-text)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '28px',
          fontWeight: '700',
          margin: 0
        }}>
          ReelHunter
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          fontWeight: '500',
          margin: '0.5rem 0 0 0'
        }}>
          AI-Powered Talent Acquisition
        </p>
      </header>
      <main>
        <ReelHunter />
      </main>
    </div>
  )
}

export default App 