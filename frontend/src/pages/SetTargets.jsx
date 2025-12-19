import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, CheckCircle, AlertCircle, Store, ArrowLeft } from 'lucide-react';
import { AppwriteService, Query, databases, ID } from '../services/appwrite';

// Environment variables
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TARGETS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_TARGETS || 'store_targets';

const SetTargets = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const urlStoreId = searchParams.get('storeId');
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Target values
  const [targets, setTargets] = useState({
    targetScore: 28.0,
    warningThreshold: 26.0,
    criticalThreshold: 24.0
  });
  
  // Existing target document ID (for updates)
  const [existingTargetId, setExistingTargetId] = useState(null);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storeList = await AppwriteService.getStores();
        setStores(storeList);
        
        // If storeId in URL, select that store; otherwise select first
        if (urlStoreId && storeList.some(s => s.$id === urlStoreId)) {
          setSelectedStoreId(urlStoreId);
        } else if (storeList.length > 0 && !urlStoreId) {
          setSelectedStoreId(storeList[0].$id);
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setMessage({ type: 'error', text: 'Failed to load stores. Please check your Appwrite configuration.' });
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [urlStoreId]);

  // Fetch existing targets when store changes
  useEffect(() => {
    if (!selectedStoreId) return;
    
    const fetchTargets = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, TARGETS_COLLECTION_ID, [
          Query.equal('storeId', selectedStoreId),
          Query.limit(1)
        ]);
        
        if (response.documents.length > 0) {
          const doc = response.documents[0];
          setTargets({
            targetScore: doc.targetScore || 28.0,
            warningThreshold: doc.warningThreshold || 26.0,
            criticalThreshold: doc.criticalThreshold || 24.0
          });
          setExistingTargetId(doc.$id);
        } else {
          // Reset to defaults if no existing target
          setTargets({
            targetScore: 28.0,
            warningThreshold: 26.0,
            criticalThreshold: 24.0
          });
          setExistingTargetId(null);
        }
      } catch (err) {
        console.error('Error fetching targets:', err);
        // If collection doesn't exist yet, just use defaults
        setTargets({
          targetScore: 28.0,
          warningThreshold: 26.0,
          criticalThreshold: 24.0
        });
        setExistingTargetId(null);
      }
    };
    
    fetchTargets();
  }, [selectedStoreId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const data = {
        storeId: selectedStoreId,
        targetScore: parseFloat(targets.targetScore),
        warningThreshold: parseFloat(targets.warningThreshold),
        criticalThreshold: parseFloat(targets.criticalThreshold)
      };
      
      if (existingTargetId) {
        // Update existing document
        await databases.updateDocument(DATABASE_ID, TARGETS_COLLECTION_ID, existingTargetId, data);
      } else {
        // Create new document
        const newDoc = await databases.createDocument(DATABASE_ID, TARGETS_COLLECTION_ID, ID.unique(), data);
        setExistingTargetId(newDoc.$id);
      }
      
      setMessage({ type: 'success', text: 'Targets saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving targets:', err);
      setMessage({ type: 'error', text: `Failed to save targets: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setTargets(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedStoreName = () => {
    const store = stores.find(s => s.$id === selectedStoreId);
    return store?.name || store?.storeName || 'Unknown Store';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Back to Stores Button (if navigated from Stores page) */}
      {urlStoreId && (
        <button
          onClick={() => navigate('/stores')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={16} />
          Back to Stores
        </button>
      )}
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Set KPI Targets</h1>
          <p style={{ color: 'var(--text-muted)' }}>Define success criteria for your stores.</p>
        </div>
        
        {/* Store Selector (hidden if navigating from Stores page) */}
        {!urlStoreId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={20} color="var(--text-muted)" />
            <select 
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="glass-panel"
              style={{ padding: '0.75rem 1.5rem', color: 'var(--text-main)', outline: 'none', minWidth: '200px' }}
            >
              {stores.length === 0 ? (
                <option value="">No stores available</option>
              ) : (
                stores.map(s => (
                  <option key={s.$id} value={s.$id}>
                    {s.name || s.storeName || s.$id}
                  </option>
                ))
              )}
            </select>
          </div>
        )}
        
        {/* Current Store Display (when navigating from Stores page) */}
        {urlStoreId && selectedStoreId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '8px' }}>
            <Store size={20} color="#3b82f6" />
            <span style={{ color: '#1e40af', fontWeight: '600' }}>
              {stores.find(s => s.$id === selectedStoreId)?.name || 'Selected Store'}
            </span>
          </div>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px', 
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)', 
          color: message.type === 'success' ? '#059669' : '#dc2626', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          border: `1px solid ${message.type === 'success' ? '#059669' : '#dc2626'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Targets Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>
          Targets for: {getSelectedStoreName()}
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Metric</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Target (Green)</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Warning (Yellow)</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)' }}>Critical (Red)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '1.5rem 1rem', fontWeight: 500, fontSize: '1.1rem' }}>Daily Store Score</td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    step="0.1"
                    value={targets.targetScore}
                    onChange={(e) => handleChange('targetScore', e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.5)', 
                      border: '1px solid #22c55e', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      color: '#166534', 
                      width: '80px',
                      textAlign: 'center', 
                      fontWeight: 'bold'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>pts</span>
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    step="0.1"
                    value={targets.warningThreshold}
                    onChange={(e) => handleChange('warningThreshold', e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.5)', 
                      border: '1px solid #f59e0b', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      color: '#d97706', 
                      width: '80px',
                      textAlign: 'center', 
                      fontWeight: 'bold'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>pts</span>
                </div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    step="0.1"
                    value={targets.criticalThreshold}
                    onChange={(e) => handleChange('criticalThreshold', e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.5)', 
                      border: '1px solid #ef4444', 
                      padding: '0.5rem', 
                      borderRadius: '6px', 
                      color: '#dc2626', 
                      width: '80px',
                      textAlign: 'center', 
                      fontWeight: 'bold'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>pts</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleSave}
            disabled={saving || !selectedStoreId}
            className="btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 2rem', 
              fontSize: '1.1rem',
              opacity: (saving || !selectedStoreId) ? 0.7 : 1,
              cursor: (saving || !selectedStoreId) ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Targets'}
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: 'rgba(59, 130, 246, 0.1)', 
        borderRadius: '8px',
        color: '#1e40af',
        fontSize: '0.9rem'
      }}>
        <strong>Note:</strong> These targets will be used when calculating KPI status for daily entries.
        Green = at or above target, Yellow = between warning and target, Red = below critical.
      </div>
    </div>
  );
};

export default SetTargets;
