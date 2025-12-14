import { useState } from 'react';
// import { AppwriteService } from '../services/appwrite'; // Will use when connected

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

  const stores = [ // Mock stores for now
    { id: 'store1', name: 'Downtown Toronto' },
    { id: 'store2', name: 'North York' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to invite manager
    setTimeout(() => {
        console.log('Inviting manager:', formData);
        setMessage('Manager invited successfully! (Mock)');
        setLoading(false);
        setFormData({ name: '', username: '', password: '', phone: '', storeId: '' });
    }, 1000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add Store Manager</h1>
      
      {message && (
          <div style={{ padding: '1rem', marginBottom: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px' }}>
              {message}
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
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
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
