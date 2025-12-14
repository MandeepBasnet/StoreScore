import { useState } from 'react';
import { Save, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SetTargets = () => {
  const [selectedStore, setSelectedStore] = useState('store1');
  const [targets, setTargets] = useState([
    { id: 1, name: 'Daily Store Score', target: 28.0, unit: 'pts', warning: 26.0, critical: 24.0 },
  ]);
  const [message, setMessage] = useState('');

  const handleSave = () => {
    setMessage('Targets saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChange = (id, field, value) => {
    setTargets(targets.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const stores = [
    { id: 'store1', name: 'Downtown Toronto' },
    { id: 'store2', name: 'North York' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Set KPI Targets</h1>
          <p style={{ color: 'var(--text-muted)' }}>Define success criteria for your stores.</p>
        </div>
        <select 
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="glass-panel"
          style={{ padding: '0.75rem 1.5rem', color: 'var(--text-main)', outline: 'none', minWidth: '200px' }}
        >
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {message && (
        <div style={{ 
          padding: '1rem', marginBottom: '2rem', borderRadius: '8px', 
          background: 'rgba(16, 185, 129, 0.1)', color: '#059669', 
          display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #059669'
        }}>
          <CheckCircle size={20} /> {message}
        </div>
      )}

      {/* Targets Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>KPI Name</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Target (Green)</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Warning (Yellow)</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Critical (Red)</th>
            </tr>
          </thead>
          <tbody>
            {targets.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.5rem 1rem', fontWeight: 500, fontSize: '1.1rem' }}>{t.name}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={t.target}
                      onChange={(e) => handleChange(t.id, 'target', e.target.value)}
                      style={{ 
                        background: 'rgba(255,255,255,0.5)', border: '1px solid #cbd5e1', 
                        padding: '0.5rem', borderRadius: '6px', color: 'var(--text-main)', width: '80px',
                        textAlign: 'center', fontWeight: 'bold'
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>{t.unit}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={t.warning}
                      onChange={(e) => handleChange(t.id, 'warning', e.target.value)}
                      style={{ 
                        background: 'rgba(255,255,255,0.5)', border: '1px solid #cbd5e1', 
                        padding: '0.5rem', borderRadius: '6px', color: '#d97706', width: '80px',
                         textAlign: 'center', fontWeight: 'bold'
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>{t.unit}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={t.critical}
                      onChange={(e) => handleChange(t.id, 'critical', e.target.value)}
                      style={{ 
                        background: 'rgba(255,255,255,0.5)', border: '1px solid #cbd5e1', 
                        padding: '0.5rem', borderRadius: '6px', color: '#dc2626', width: '80px',
                         textAlign: 'center', fontWeight: 'bold'
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>{t.unit}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleSave}
            className="btn-primary" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.75rem 2rem', fontSize: '1.1rem' 
            }}
          >
            <Save size={20} /> Save Targets
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetTargets;
