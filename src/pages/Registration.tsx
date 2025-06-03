import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '+63',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+63')) {
      value = '+63' + value.replace('+63', '');
    }
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long');
      return;
    }

    if (!formData.phone.startsWith('+63') || formData.phone.length !== 13) {
      setError('Please enter a valid Philippine phone number (+63XXXXXXXXXX)');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { 
        displayName: formData.username
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number (+63XXXXXXXXXX)"
          value={formData.phone}
          onChange={handlePhoneChange}
          style={{ width: '100%', marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 10, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          required
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: 'purple', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{error}</div>}
    </div>
  );
};

export default Registration;
