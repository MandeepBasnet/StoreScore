import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, Query } from '../services/appwrite';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Monitor, UserCircle, Target, SlidersHorizontal, X } from 'lucide-react';

const Stores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchStoresData();
  }, []);

  const fetchStoresData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all data in parallel
      const [storesResponse, usersResponse, displaysResponse] = await Promise.all([
        databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_STORES,
          [Query.limit(100)]
        ),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/xibo/users`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/xibo/displays`, { headers })
      ]);

      setStores(storesResponse.documents);

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      setUsers(usersData);

      if (!displaysResponse.ok) throw new Error('Failed to fetch displays');
      const displaysData = await displaysResponse.json();
      setDisplays(displaysData);

    } catch (err) {
      console.error('Error fetching stores data:', err);
      setError('Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter stores based on user role
  const filteredStores = useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'super_admin') {
      return stores;
    }
    
    if (user.role === 'admin') {
      // Admin sees only stores they own
      // Assuming admin user has xiboUserId property
      const adminXiboId = user.xiboUserId || user.userId;
      return stores.filter(store => store.ownerXiboUserId === adminXiboId);
    }
    
    return [];
  }, [stores, user]);

  // Helper: Get owner name
  const getOwnerName = (xiboUserId) => {
    if (!xiboUserId) return 'Unassigned';
    const owner = users.find(u => u.userId === xiboUserId);
    return owner ? owner.fullName : `Unknown (${xiboUserId})`;
  };

  // Helper: Get display names
  const getDisplayNames = (displayIds) => {
    if (!displayIds || displayIds.length === 0) return 'No Displays';
    return displayIds.map(id => {
      const display = displays.find(d => String(d.id) === String(id));
      return display ? display.name : `Display #${id}`;
    }).join(', ');
  };

  // Helper: Get manager name
  const getManagerName = (storeId) => {
    // Manager info would need to be added to store schema or separate collection
    return 'N/A';
  };

  const handleStoreClick = (store) => {
    setSelectedStore(store);
  };

  const handleAction = (action) => {
    if (!selectedStore) return;
    
    if (action === 'kpi') {
      navigate(`/kpi?storeId=${selectedStore.$id}`);
    } else if (action === 'targets') {
      navigate(`/set-targets?storeId=${selectedStore.$id}`);
    }
    
    setSelectedStore(null);
  };

  // Styles
  const containerStyle = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const headerStyle = {
    marginBottom: '2rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  };

  const cardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    position: 'relative'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.25rem' }}>Loading stores...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>
          Stores Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          {user.role === 'super_admin' 
            ? 'View and manage all stores in the system' 
            : 'View and manage your assigned stores'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem', 
          background: '#fee2e2', 
          color: '#991b1b', 
          borderRadius: '8px' 
        }}>
          {error}
        </div>
      )}

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem', 
          background: 'white', 
          borderRadius: '12px',
          color: '#64748b'
        }}>
          <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Stores Found</h3>
          <p>There are no stores assigned to you yet.</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredStores.map(store => (
            <div
              key={store.$id}
              style={cardStyle}
              onClick={() => handleStoreClick(store)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = cardHoverStyle.transform;
                e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = cardStyle.boxShadow;
              }}
            >
              {/* Store Icon & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#3b82f6', 
                  borderRadius: '10px',
                  display: 'flex'
                }}>
                  <Building2 size={24} color="white" />
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#0f172a',
                  margin: 0
                }}>
                  {store.name}
                </h3>
              </div>

              {/* Store Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Owner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <User size={16} />
                  <span style={{ fontSize: '0.875rem' }}>
                    <strong>Owner:</strong> {getOwnerName(store.ownerXiboUserId)}
                  </span>
                </div>

                {/* Displays */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#64748b' }}>
                  <Monitor size={16} style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '0.875rem', flex: 1 }}>
                    <strong>Displays:</strong> {getDisplayNames(store.displayIds)}
                  </span>
                </div>

                {/* Manager */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <UserCircle size={16} />
                  <span style={{ fontSize: '0.875rem' }}>
                    <strong>Manager:</strong> {getManagerName(store.$id)}
                  </span>
                </div>
              </div>

              {/* Click hint */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid #e2e8f0',
                color: '#3b82f6',
                fontSize: '0.875rem',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                Click to view actions
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedStore && (
        <div style={modalOverlayStyle} onClick={() => setSelectedStore(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedStore(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '0.5rem'
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
              {selectedStore.name}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Choose an action for this store
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => handleAction('kpi')}
                style={{
                  padding: '1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                <Target size={20} />
                KPI Entry
              </button>

              <button
                onClick={() => handleAction('targets')}
                style={{
                  padding: '1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                <SlidersHorizontal size={20} />
                Set Targets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores;
