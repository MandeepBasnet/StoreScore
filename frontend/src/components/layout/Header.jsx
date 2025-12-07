import { Bell, Search, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="header glass-panel" style={{
      margin: '1rem 1rem 1rem 0', // Right margin for symmetry
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '80px'
    }}>
      <div className="search-bar" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(0,0,0,0.2)', 
        padding: '0.5rem 1rem',
        borderRadius: '50px',
        width: '300px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search..." 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            marginLeft: '0.75rem',
            outline: 'none',
            width: '100%'
          }} 
        />
      </div>

      <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-main)" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-1px',
            width: '8px',
            height: '8px',
            background: 'var(--danger)',
            borderRadius: '50%'
          }}></span>
        </div>
        
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Alex Morgan</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Store Manager</p>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
