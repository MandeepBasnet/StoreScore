import { LayoutDashboard, Target, LogOut, Store, SlidersHorizontal } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth } from '../../utils/auth';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const allNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'manager'] },
    { icon: Target, label: 'KPI Entry', path: '/kpi', roles: ['admin', 'manager'] },
    { icon: SlidersHorizontal, label: 'Set Targets', path: '/set-targets', roles: ['admin'] },
    { icon: Store, label: 'Add Manager', path: '/add-manager', roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass-panel" style={{
      width: '280px',
      margin: '1rem',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 2rem)',
      position: 'sticky',
      top: '1rem',
      color: 'var(--text-main)'
    }}>
      <div className="logo-container" style={{ marginBottom: '3rem', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '8px', display: 'flex' }}>
          <Store size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', lineHeight: '1' }}>StoreScore</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager Portal</span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? '#334155' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), transparent)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="footer" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
        <button 
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--danger)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)'
        }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
