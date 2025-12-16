import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddStore = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        displayIds: []
    });
    const [displays, setDisplays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDisplays();
    }, []);

    const fetchDisplays = async () => {
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/xibo/displays`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch displays');
            }

            const data = await response.json();
            setDisplays(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create store');
            }

            setMessage('Store created successfully! Name: ' + formData.name);
            setFormData({
                name: '',
                location: '',
                displayIds: []
            });
            // navigate('/'); // Removed immediate redirect to show success message
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisplayToggle = (displayId) => {
        setFormData(prev => {
            const currentIds = prev.displayIds;
            if (currentIds.includes(displayId)) {
                return { ...prev, displayIds: currentIds.filter(id => id !== displayId) };
            } else {
                return { ...prev, displayIds: [...currentIds, displayId] };
            }
        });
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading displays...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Store</h1>
            
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

            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Store Name</label>
                    <input
                        type="text"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Downtown Branch"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location</label>
                    <input
                        type="text"
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. 123 Main St, City"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Assign Displays (Xibo)</label>
                    <div style={{ 
                        border: '1px solid #ccc', 
                        borderRadius: '8px', 
                        maxHeight: '240px', 
                        overflowY: 'auto',
                        background: '#f9fafb'
                    }}>
                        {displays.length === 0 ? (
                            <div style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>No displays found in Xibo</div>
                        ) : (
                            displays.map(display => (
                                <div key={display.id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid #eee',
                                    background: display.isAssigned ? '#f3f4f6' : 'white',
                                    opacity: display.isAssigned ? 0.7 : 1
                                }}>
                                    <input
                                        type="checkbox"
                                        id={`display-${display.id}`}
                                        checked={formData.displayIds.includes(display.id)}
                                        onChange={() => handleDisplayToggle(display.id)}
                                        disabled={display.isAssigned}
                                        style={{ width: '1rem', height: '1rem', cursor: display.isAssigned ? 'not-allowed' : 'pointer' }}
                                    />
                                    <label htmlFor={`display-${display.id}`} style={{ marginLeft: '0.75rem', flex: 1, cursor: display.isAssigned ? 'not-allowed' : 'pointer' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: display.isAssigned ? '#6b7280' : 'inherit' }}>
                                            {display.name} 
                                            {display.isAssigned && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold' }}>(Assigned to: {display.assignedStoreName})</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                            Status: <span style={{ color: display.status === 'Online' ? '#166534' : '#666' }}>{display.status}</span>
                                        </div>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Select displays to link to this store.</p>
                </div>

                <div style={{ paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            color: '#374151',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'black',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1
                        }}
                    >
                        {submitting ? 'Creating...' : 'Create Store'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStore;
