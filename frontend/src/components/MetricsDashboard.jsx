import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API = 'https://novacap-ops-backend.bravebeach-bb6dfe67.eastus.azurecontainerapps.io'

function MetricsDashboard() {
  const [metricsHistory, setMetricsHistory] = useState([])
  const [currentMetrics, setCurrentMetrics] = useState(null)
  const [anomalyStatus, setAnomalyStatus] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastIncident, setLastIncident] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/api/metrics/current`)
        const data = res.data
        setCurrentMetrics(data.metrics)
        setAnomalyStatus(data)
        setMetricsHistory(prev => {
          const updated = [...prev, {
            time: new Date().toLocaleTimeString(),
            cpu: data.metrics.cpu_usage,
            memory: data.metrics.memory_usage,
            error_rate: data.metrics.error_rate,
            response_time: data.metrics.response_time_ms / 10
          }]
          return updated.slice(-20)
        })
      } catch (err) {
        console.error(err)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const triggerAnomaly = async () => {
    await axios.post(`${API}/api/metrics/trigger-anomaly`)
    setMessage('Anomaly triggered — watch the metrics spike')
    setTimeout(() => setMessage(''), 3000)
  }

  const clearAnomaly = async () => {
    await axios.post(`${API}/api/metrics/clear-anomaly`)
    setMessage('Anomaly cleared — metrics returning to normal')
    setTimeout(() => setMessage(''), 3000)
  }

  const analyzeAndCreateTicket = async () => {
    setAnalyzing(true)
    try {
      const res = await axios.post(`${API}/api/metrics/analyze`)
      if (res.data.anomaly_detected) {
        setLastIncident(res.data.ticket)
        setMessage(`Incident created: ${res.data.ticket.title}`)
      } else {
        setMessage('All systems normal — no incident created')
      }
    } catch (err) {
      setMessage('Analysis failed')
    } finally {
      setAnalyzing(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const MetricCard = ({ label, value, unit, threshold, direction = 'high' }) => {
    const isAlert = direction === 'high' ? value > threshold : value < threshold
    return (
      <div style={{
        backgroundColor: '#111827',
        border: `1px solid ${isAlert ? '#ef4444' : '#1f2937'}`,
        borderRadius: '8px',
        padding: '16px',
        minWidth: '160px'
      }}>
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{label}</p>
        <p style={{
          fontSize: '24px',
          fontWeight: '700',
          color: isAlert ? '#ef4444' : '#10b981'
        }}>
          {value?.toFixed(1)}{unit}
        </p>
        {isAlert && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>⚠ Anomaly</p>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={triggerAnomaly} style={{
          padding: '10px 16px', backgroundColor: '#dc2626', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
        }}>
          🔥 Trigger Anomaly
        </button>
        <button onClick={clearAnomaly} style={{
          padding: '10px 16px', backgroundColor: '#059669', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
        }}>
          ✅ Clear Anomaly
        </button>
        <button onClick={analyzeAndCreateTicket} disabled={analyzing} style={{
          padding: '10px 16px', backgroundColor: analyzing ? '#1f2937' : '#3b82f6',
          color: analyzing ? '#6b7280' : '#fff',
          border: 'none', borderRadius: '6px', cursor: analyzing ? 'not-allowed' : 'pointer', fontWeight: '500'
        }}>
          {analyzing ? '🤖 Analyzing...' : '🤖 Run AI Analysis'}
        </button>
        {anomalyStatus?.anomaly_detected && (
          <span style={{
            padding: '10px 16px', backgroundColor: '#7f1d1d',
            color: '#fca5a5', borderRadius: '6px', fontSize: '14px', fontWeight: '500'
          }}>
            🚨 Anomaly Active: {anomalyStatus.anomaly_metric}
          </span>
        )}
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

      {currentMetrics && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <MetricCard label="CPU Usage" value={currentMetrics.cpu_usage} unit="%" threshold={80} />
          <MetricCard label="Memory Usage" value={currentMetrics.memory_usage} unit="%" threshold={85} />
          <MetricCard label="Error Rate" value={currentMetrics.error_rate} unit="%" threshold={5} />
          <MetricCard label="Response Time" value={currentMetrics.response_time_ms} unit="ms" threshold={500} />
          <MetricCard label="Transactions" value={currentMetrics.transaction_volume} unit="/min" threshold={200} direction="low" />
        </div>
      )}

      <div style={{
        backgroundColor: '#111827', border: '1px solid #1f2937',
        borderRadius: '8px', padding: '20px', marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px' }}>Live Metrics (last 20 readings)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metricsHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '6px' }} />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="#3b82f6" dot={false} name="CPU %" />
            <Line type="monotone" dataKey="memory" stroke="#8b5cf6" dot={false} name="Memory %" />
            <Line type="monotone" dataKey="error_rate" stroke="#ef4444" dot={false} name="Error %" />
            <Line type="monotone" dataKey="response_time" stroke="#f59e0b" dot={false} name="Response (x10ms)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {lastIncident && (
        <div style={{
          backgroundColor: '#111827', border: '1px solid #ef4444',
          borderRadius: '8px', padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#ef4444' }}>
            🚨 Latest Incident Created
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Title:</strong> {lastIncident.title}</p>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Severity:</strong> {lastIncident.severity} | <strong>Priority:</strong> {lastIncident.priority}</p>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Summary:</strong> {lastIncident.summary}</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Go to Incidents tab to approve or reject</p>
        </div>
      )}
    </div>
  )
}

export default MetricsDashboard