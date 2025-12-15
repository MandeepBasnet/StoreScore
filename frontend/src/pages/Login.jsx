import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username) {
      setError('Please enter your username.');
      return;
    }
    
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    
    setLoading(true);
    
    try {
      await login(username, password, activeTab);
      navigate('/kpi', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '10vh',
      background: 'white',
      color: 'black'
    }}>
      
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #1e3a8a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: 500 }}>
              Logging you in...
            </p>
          </div>
        </div>
      )}
      
      {/* Logo Section */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <img src="/logo.png" alt="StoreScore" style={{ height: '60px', objectFit: 'contain' }} />
      </div>

      {/* Login Form Container */}
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 2rem' }}>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'black', textAlign: 'center' }}>Log in.</h1>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#f1f5f9', 
          padding: '4px', 
          borderRadius: '12px', 
          marginBottom: '2rem' 
        }}>
          <button
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'admin' ? 'white' : 'transparent',
              color: activeTab === 'admin' ? 'black' : '#64748b',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Admin
          </button>
          <button
            onClick={() => {
              setActiveTab('manager');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'manager' ? 'white' : 'transparent',
              color: activeTab === 'manager' ? 'black' : '#64748b',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'manager' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Manager
          </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Username Input */}
          <div style={{ position: 'relative' }}>
            <label style={{ 
              position: 'absolute', 
              top: '-10px', 
              left: '0', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#333' 
            }}>
              Username *
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0',
                border: 'none',
                borderBottom: error ? '2px solid #dc2626' : '2px solid black',
                background: error ? '#fef2f2' : 'transparent',
                fontSize: '1rem',
                outline: 'none',
                marginTop: '10px'
              }}
            />
            <div style={{ position: 'absolute', right: 0, bottom: '8px' }}>
              <Lock size={16} color="#666" />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <label style={{ 
              position: 'absolute', 
              top: '-10px', 
              left: '0', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#333' 
            }}>
              Password *
            </label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0',
                border: 'none',
                borderBottom: '2px solid black',
                background: 'transparent',
                fontSize: '1rem',
                outline: 'none',
                marginTop: '10px'
              }}
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 0, bottom: '8px', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={16} color="#666" /> : <Eye size={16} color="#666" />}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '-1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>⚠️</span>
              {error}
            </p>
          )}

          {/* Forgot Password Link */}
          <div style={{ marginTop: '-1rem' }}>
             <a href="#" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'black', textDecoration: 'none' }}>Password Help?</a>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              background: loading ? '#9ca3af' : 'black', 
              color: 'white', 
              border: 'none', 
              borderRadius: '50px', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem', 
              opacity: loading ? 0.65 : 1
            }}
          >
            {loading ? 'Logging in...' : `Log in as ${activeTab === 'admin' ? 'Admin' : 'Manager'}`}
          </button>

        </form>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;

