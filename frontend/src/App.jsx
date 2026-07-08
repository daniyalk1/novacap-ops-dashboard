import { useState } from 'react'
import MetricsDashboard from './components/MetricsDashboard'
import IncidentsList from './components/IncidentsList'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('metrics')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        backgroundColor: '#111827',
        padding: '16px 24px',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>
            NovaCap AI Operations Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Powered by AI Agents — NovaCap Bank IT Operations
          </p>
        </div>
        <nav style={{ display: 'flex', gap: '8px' }}>
          {['metrics', 'incidents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                backgroundColor: activeTab === tab ? '#3b82f6' : '#1f2937',
                color: activeTab === tab ? '#fff' : '#9ca3af',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'metrics' ? '📊 Metrics' : '🚨 Incidents'}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1, padding: '24px' }}>
        {activeTab === 'metrics' ? <MetricsDashboard /> : <IncidentsList />}
      </main>
    </div>
  )
}

export default App