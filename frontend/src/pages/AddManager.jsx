import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const AddManager = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    storeId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const stores = [ // Mock stores for now - ideally fetch from backend too
    { id: 'store1', name: 'Downtown Toronto' },
    { id: 'store2', name: 'North York' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await axios.post(`${apiBaseUrl}/managers`, formData);
        setMessage('Manager created successfully! username: ' + formData.username);
        setFormData({ name: '', username: '', password: '', phone: '', storeId: '' });
    } catch (err) {
        console.error("Error creating manager:", err);
        setError(err.response?.data?.error || 'Failed to create manager');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add Store Manager</h1>
      
      {message && (
          <div style={{ padding: '1rem', marginBottom: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px' }}>
              {message}
          </div>
      )}

      {error && (
          <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
              {error}
          </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                }}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mobile Number <span style={{color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.9em'}}>(Optional)</span></label>
           <input
            type="tel"
            placeholder="+1..."
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Assign Store</label>
           <select
            required
            value={formData.storeId}
            onChange={(e) => setFormData({...formData, storeId: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
           >
             <option value="">Select a Store</option>
             {stores.map(store => (
                 <option key={store.id} value={store.id}>{store.name}</option>
             ))}
           </select>
        </div>

        <button
            type="submit"
            disabled={loading}
            style={{
                padding: '1rem',
                background: 'black',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
            }}
        >
            {loading ? 'Sending Invite...' : 'Invite Manager'}
        </button>
      </form>
    </div>
  );
};

export default AddManager;
