'use client';
import { useState } from 'react';

const INCIDENT_TYPES = [
  { icon: '🔥', label: 'Fire' },
  { icon: '🌊', label: 'Flood' },
  { icon: '🏥', label: 'Medical' },
  { icon: '🚗', label: 'Accident' },
  { icon: '⚡', label: 'Electric' },
  { icon: '🌪️', label: 'Storm' },
  { icon: '🏚️', label: 'Collapse' },
  { icon: '☣️', label: 'Hazmat' },
];

export default function IncidentForm({ onSubmit, onClose }) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmit = () => {
    if (!type || !description) {
      alert('Please fill all fields!');
      return;
    }
    const report = `INCIDENT REPORT:\nType: ${type}\nSeverity: ${severity.toUpperCase()}\nDescription: ${description}`;
    onSubmit(report);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: '24px', padding: '28px',
        width: '100%', maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>

        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
          📋 Report Incident
        </h2>

        {/* Incident Type */}
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '10px', fontWeight: 600 }}>
          INCIDENT TYPE
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {INCIDENT_TYPES.map((t, i) => (
            <button key={i} onClick={() => setType(t.label)} style={{
              background: type === t.label ? 'rgba(230,57,70,0.3)' : 'rgba(255,255,255,0.05)',
              border: type === t.label ? '1px solid #e63946' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '10px 4px',
              color: '#fff', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '20px' }}>{t.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Severity */}
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '10px', fontWeight: 600 }}>
          SEVERITY
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['low', 'medium', 'high', 'critical'].map(s => (
            <button key={s} onClick={() => setSeverity(s)} style={{
              flex: 1, padding: '8px 4px',
              background: severity === s
                ? s === 'critical' ? '#dc2626'
                  : s === 'high' ? '#f97316'
                    : s === 'medium' ? '#eab308'
                      : '#22c55e'
                : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontSize: '11px', fontWeight: 700,
              cursor: 'pointer', textTransform: 'uppercase',
            }}>{s}</button>
          ))}
        </div>

        {/* Description */}
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '10px', fontWeight: 600 }}>
          DESCRIPTION
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Kya hua hai describe karo..."
          rows={3}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', padding: '12px',
            color: '#fff', fontSize: '13px', outline: 'none',
            resize: 'none', marginBottom: '20px',
            fontFamily: 'Inter, sans-serif',
          }}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '13px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            flex: 1, padding: '13px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            border: 'none', color: '#fff', fontSize: '14px',
            fontWeight: 700, cursor: 'pointer',
          }}>Submit 🚨</button>
        </div>
      </div>
    </div>
  );
}