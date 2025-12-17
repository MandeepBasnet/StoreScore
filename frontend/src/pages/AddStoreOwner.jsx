import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, Query } from '../services/appwrite';

const AddStoreOwner = () => {
    const navigate = useNavigate();
    
    // State
    const [stores, setStores] = useState([]);
    const [users, setUsers] = useState([]);
    const [displays, setDisplays] = useState([]); // New state for displays
    const [suggestions, setSuggestions] = useState({ suggestedUserIds: [], reasons: {} });
    
    // Form State
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedStoreId) {
            fetchSuggestions(selectedStoreId);
        } else {
            setSuggestions({ suggestedUserIds: [], reasons: {} });
        }
    }, [selectedStoreId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Stores, Users, and Displays in parallel
            const [storesResponse, usersResponse, displaysResponse] = await Promise.all([
                databases.listDocuments(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    import.meta.env.VITE_APPWRITE_COLLECTION_STORES,
                    [Query.limit(100)]
                ),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/xibo/users`, { headers }),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/xibo/displays`, { headers })
            ]);

            // Process Stores
            setStores(storesResponse.documents);

            // Process Users
            if (!usersResponse.ok) throw new Error('Failed to fetch users');
            const usersData = await usersResponse.json();
            setUsers(usersData);

            // Process Displays
            if (!displaysResponse.ok) throw new Error('Failed to fetch displays');
            const displaysData = await displaysResponse.json();
            setDisplays(displaysData);

        } catch (err) {
            console.error(err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (storeId) => {
        try {
            setFetchingSuggestions(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/xibo/suggestions/${storeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
                
                // Auto-select if there's only one strong suggestion
                if (data.suggestedUserIds.length === 1) {
                    setSelectedUserId(data.suggestedUserIds[0]);
                }
            }
        } catch (err) {
            console.warn("Failed to fetch suggestions", err);
        } finally {
            setFetchingSuggestions(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stores/${selectedStoreId}/owner`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ xiboUserId: parseInt(selectedUserId) })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to assign owner');
            }

            setMessage('Store owner assigned successfully!');
            // Refresh stores list to update the table
            const storesResponse = await databases.listDocuments(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_COLLECTION_STORES,
                [Query.limit(100)]
            );
            setStores(storesResponse.documents);

            // Reset selection
            setSelectedStoreId('');
            setSelectedUserId('');
            setSuggestions({ suggestedUserIds: [], reasons: {} });

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    // Helper to categorize users
    const suggestedUsers = users.filter(u => suggestions.suggestedUserIds.includes(u.userId));
    const otherUsers = users.filter(u => !suggestions.suggestedUserIds.includes(u.userId));

    // Helper to resolve Owner Name
    const getOwnerName = (xiboUserId) => {
        if (!xiboUserId) return <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Unassigned</span>;
        const user = users.find(u => u.userId === xiboUserId);
        return user ? user.fullName : `Unknown ID: ${xiboUserId}`;
    };

    // Helper to resolve Display Names
    const getDisplayNames = (displayIds) => {
        if (!displayIds || displayIds.length === 0) return 'No Displays';
        return displayIds.map(id => {
            const display = displays.find(d => String(d.id) === String(id));
            return display ? display.name : `Display #${id}`;
        }).join(', ');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Assign Store Owner</h1>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                {/* Section 1: Assignment Form */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>New Assignment</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Store Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Store</label>
                            <select
                                required
                                value={selectedStoreId}
                                onChange={(e) => setSelectedStoreId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Choose a Store --</option>
                                {stores.map(store => (
                                    <option key={store.$id} value={store.$id}>
                                        {store.name} {store.ownerXiboUserId ? '(Owner Assigned)' : '(No Owner)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* User Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Owner (Xibo User)</label>
                            <select
                                required
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                disabled={!selectedStoreId}
                            >
                                <option value="">-- Choose a User --</option>
                                
                                {fetchingSuggestions && <option disabled>Loading suggestions...</option>}

                                {suggestedUsers.length > 0 && (
                                    <optgroup label="Suggested (Based on Display Access)">
                                        {suggestedUsers.map(u => (
                                            <option key={u.userId} value={u.userId}>
                                                {u.fullName} ({u.userName}) - {suggestions.reasons[u.userId]}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                                
                                <optgroup label="All Users">
                                    {otherUsers.map(u => (
                                        <option key={u.userId} value={u.userId}>
                                            {u.fullName} ({u.userName})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
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
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !selectedStoreId || !selectedUserId}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'black',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: (submitting || !selectedStoreId || !selectedUserId) ? 'not-allowed' : 'pointer',
                                    opacity: (submitting || !selectedStoreId || !selectedUserId) ? 0.7 : 1
                                }}
                            >
                                {submitting ? 'Assigning...' : 'Assign Owner'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Current Assignments Dashboard */}
                <div>
                     <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Current Stores & Owners</h2>
                     <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>Store Name</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>Assigned Owner</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>Linked Displays</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No stores found.</td></tr>
                                ) : (
                                    stores.map(store => (
                                        <tr key={store.$id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{store.name}</td>
                                            <td style={{ padding: '1rem' }}>{getOwnerName(store.ownerXiboUserId)}</td>
                                            <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>{getDisplayNames(store.displayIds)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button 
                                                    onClick={() => setSelectedStoreId(store.$id)}
                                                    style={{ color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default AddStoreOwner;
