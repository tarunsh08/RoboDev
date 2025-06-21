import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    axios.post('/users/register', { name, email, password })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      })
      .catch((err) => {
        console.log(err.response.data);
        alert(err.response.data.message || 'Registration failed');
      });
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Left side - Description */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 5%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Join Our Community</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
          Create your account and get access to exclusive features, collaborate with other developers, 
          and build amazing projects together.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
          <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#007bff', marginRight: '10px' }}>✓</span>
            Access to all projects and resources
          </li>
          <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#007bff', marginRight: '10px' }}>✓</span>
            Collaborate with other developers
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#007bff', marginRight: '10px' }}>✓</span>
            Get personalized recommendations
          </li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ width: '50px', height: '2px', backgroundColor: '#007bff', marginRight: '15px' }}></div>
          <span>Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Sign in</Link></span>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 40px',
        backgroundColor: '#1e1e1e'
      }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2c2c2c',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2c2c2c',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2c2c2c',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                // border: '1px solid '#333',
                // backgroundColor: '#2c2c2c',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;