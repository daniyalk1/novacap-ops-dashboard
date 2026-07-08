import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://novacap-ops-backend.bravebeach-bb6dfe67.eastus.azurecontainerapps.io'

function IncidentsList() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [responding, setResponding] = useState(null)
  const [notes, setNotes] = useState({})
  const [message, setMessage] = useState('')

  const fetchIncidents = async () => {
    try {
      const status = filter === 'all' ? '' : filter
      const res = await axios.get(`${API}/api/incidents${status ? `?status=${status}` : ''}`)
      setIncidents(res.data.incidents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [filter])

  const respond = async (incidentId, severity, action) => {
    setResponding(incidentId)
    try {
      await axios.post(`${API}/api/actions/respond`, {
        incident_id: incidentId,
        severity: severity,
        action: action,
        notes: notes[incidentId] || ''
      })
      setMessage(`Incident ${action}d successfully`)
      fetchIncidents()
    } catch (err) {
      setMessage('Action failed')
    } finally {
      setResponding(null)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const severityColor = (severity) => {
    if (severity === 'high') return '#ef4444'
    if (severity === 'medium') return '#f59e0b'
    return '#10b981'
  }

  const statusColor = (status) => {
    if (status === 'pending') return '#f59e0b'
    if (status === 'approved') return '#10b981'
    if (status === 'rejected') return '#ef4444'
    return '#6b7280'
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: filter === f ? '#3b82f6' : '#1f2937',
                color: filter === f ? '#fff' : '#9ca3af',
                textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={fetchIncidents}
          style={{
            padding: '8px 14px', backgroundColor: '#1f2937',
            color: '#9ca3af', border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '13px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', backgroundColor: '#1f2937',
          borderRadius: '8px', marginBottom: '16px',
          borderLeft: '4px solid #3b82f6', fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div style={{
          backgroundColor: '#111827', border: '1px solid #1f2937',
          borderRadius: '8px', padding: '40px', textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>No incidents found. Trigger an anomaly and run AI analysis to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {incidents.map(incident => (
            <div key={incident.id} style={{
              backgroundColor: '#111827',
              border: `1px solid ${incident.status === 'pending' ? '#f59e0b' : '#1f2937'}`,
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', maxWidth: '70%' }}>{incident.title}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                    backgroundColor: `${severityColor(incident.severity)}22`,
                    color: severityColor(incident.severity)
                  }}>
                    {incident.severity?.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                    backgroundColor: `${statusColor(incident.status)}22`,
                    color: statusColor(incident.status)
                  }}>
                    {incident.status?.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                    backgroundColor: '#1f2937', color: '#9ca3af'
                  }}>
                    {incident.priority}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>{incident.summary}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#0a0e1a', borderRadius: '6px', padding: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Root Cause</p>
                  <p style={{ fontSize: '13px' }}>{incident.root_cause}</p>
                </div>
                <div style={{ backgroundColor: '#0a0e1a', borderRadius: '6px', padding: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Impact</p>
                  <p style={{ fontSize: '13px' }}>{incident.impact}</p>
                </div>
              </div>

              {Array.isArray(incident.recommended_action) && (
                <div style={{ backgroundColor: '#0a0e1a', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Recommended Actions</p>
                  {incident.recommended_action.map((action, i) => (
                    <p key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>• {action}</p>
                  ))}
                </div>
              )}

              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                Created: {new Date(incident.created_at).toLocaleString()}
                {incident.updated_at && ` · Updated: ${new Date(incident.updated_at).toLocaleString()}`}
              </p>

              {incident.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Add notes (optional)"
                    value={notes[incident.id] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, [incident.id]: e.target.value }))}
                    style={{
                      flex: 1, padding: '8px 12px', backgroundColor: '#0a0e1a',
                      border: '1px solid #1f2937', borderRadius: '6px',
                      color: '#e0e0e0', fontSize: '13px', outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => respond(incident.id, incident.severity, 'approve')}
                    disabled={responding === incident.id}
                    style={{
                      padding: '8px 16px', backgroundColor: '#059669',
                      color: '#fff', border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontWeight: '500', fontSize: '13px'
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => respond(incident.id, incident.severity, 'reject')}
                    disabled={responding === incident.id}
                    style={{
                      padding: '8px 16px', backgroundColor: '#dc2626',
                      color: '#fff', border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontWeight: '500', fontSize: '13px'
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default IncidentsList