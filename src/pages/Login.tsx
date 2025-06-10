import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'; // <-- make sure this exports your Firestore instance
import { useAuthStore } from '../store/useAuthStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const setAuthUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get the user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;
        
        // Set authenticated user in the auth store
        setAuthUser({
          id: user.uid,
          email: userData.email || user.email || '',
          name: userData.name || user.displayName || 'User',
          role: userData.role || 'user',
          addresses: userData.addresses || []
        });

        // 3. Navigate based on role
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError('User data not found');
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials or user does not exist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
          top: 0,
          left: 0
        }}
      >
        <source src="/images/vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay to darken the video and make the form more visible */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: -1
      }} />
      
      {/* Decorative Gem Icon */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 40,
        fontSize: 48,
        color: '#e0b973',
        opacity: 0.25,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <span role="img" aria-label="gem">💎</span>
      </div>
      
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <img 
          src="../images/new2.png" 
          alt="Amethyst Jewelry" 
          width={120} 
          height={120} 
          style={{ 
            filter: 'drop-shadow(0px 4px 10px rgba(224,185,115,0.4))',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            padding: '4px'
          }} 
        />
      </div>
      
      {/* Login Form */}
      <div style={{ 
        maxWidth: 400, 
        width: '90%',
        padding: 32, 
        borderRadius: 18, 
        boxShadow: '0 8px 32px rgba(224,185,115,0.2), 0 2px 8px rgba(0,0,0,0.1)', 
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}>
        <h2 style={{ 
          marginBottom: 28, 
          textAlign: 'center', 
          color: '#a084ca', 
          fontSize: '2rem',
          fontFamily: 'serif',
          fontWeight: 700,
          textShadow: '0 2px 8px rgba(224,185,115,0.15)',
          letterSpacing: '2px'
        }}>Welcome Back</h2>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              marginBottom: 16, 
              padding: '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #e0b973',
              backgroundColor: 'rgba(255,255,255,0.95)',
              fontSize: '1rem',
              fontFamily: 'serif',
              color: '#7d5a5a',
              boxShadow: '0 1px 4px rgba(224,185,115,0.07)',
              outline: 'none',
              transition: 'border 0.2s'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              marginBottom: 16, 
              padding: '12px 16px', 
              borderRadius: 8, 
              border: '1px solid #e0b973',
              backgroundColor: 'rgba(255,255,255,0.95)',
              fontSize: '1rem',
              fontFamily: 'serif',
              color: '#7d5a5a',
              boxShadow: '0 1px 4px rgba(224,185,115,0.07)',
              outline: 'none',
              transition: 'border 0.2s'
            }}
          />
          {error && 
            <div style={{ 
              color: '#a084ca', 
              background: '#fff6e7',
              marginBottom: 16, 
              textAlign: 'center', 
              fontWeight: 500,
              borderRadius: 8,
              padding: '10px 0',
              fontFamily: 'serif',
              fontSize: '0.95rem',
              boxShadow: '0 1px 4px rgba(224,185,115,0.07)'
            }}>{error}</div>
          }
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: 13, 
              borderRadius: 8, 
              background: 'linear-gradient(90deg, #a084ca 0%, #e0b973 100%)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              fontFamily: 'serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 8px rgba(224,185,115,0.2)',
              letterSpacing: '1px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: 20, 
          textAlign: 'center', 
          color: '#7d5a5a',
          fontFamily: 'serif',
          fontSize: '0.95rem'
        }}>
          Don't have an account? <Link to="/registration" style={{ 
            color: '#a084ca', 
            fontWeight: 500,
            textDecoration: 'none',
            borderBottom: '1px dotted #a084ca'
          }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
