import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/kpi');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      paddingTop: '10vh',
      background: 'white', // Explicit white background as per reference
      color: 'black'
    }}>
      
      {/* Logo Section */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <img src="/logo.png" alt="StoreScore" style={{ height: '60px', objectFit: 'contain' }} />
      </div>

      {/* Login Form Container */}
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 2rem' }}>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '3rem', color: 'black' }}>Log in.</h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Email Input */}
          <div style={{ position: 'relative' }}>
            <label style={{ 
              position: 'absolute', 
              top: '-10px', 
              left: '0', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#333' 
            }}>
              Email *
            </label>
            <input 
              type="email" 
              required
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

          {/* Forgot Password Link */}
          <div style={{ marginTop: '-1rem' }}>
             <a href="#" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'black', textDecoration: 'none' }}>Password Help?</a>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '1rem', 
              background: 'black', 
              color: 'white', 
              border: 'none', 
              borderRadius: '50px', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Log in
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;
