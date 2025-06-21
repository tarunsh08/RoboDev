import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { gsap } from 'gsap';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Refs for GSAP animations
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const formRef = useRef(null);
  const checkIconsRef = useRef([]);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const dividerRef = useRef(null);
  const svgRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    // Initial setup - hide elements
    gsap.set([leftPanelRef.current, rightPanelRef.current], { opacity: 0 });
    gsap.set(svgRef.current, { opacity: 0, y: 50 });
    gsap.set(checkIconsRef.current, { opacity: 0, x: -20 });
    gsap.set(titleRef.current, { opacity: 0, y: 20 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
    gsap.set(dividerRef.current, { scaleX: 0 });
    gsap.set(formRef.current.children, { opacity: 0, y: 20 });

    // Master timeline
    const tl = gsap.timeline();

    // Panel entrance
    tl.to(leftPanelRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" })
      .to(rightPanelRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5");

    // Content animations
    tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "back.out" }, "-=0.4")
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "back.out" }, "-=0.3")
      .to(svgRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: "elastic.out(1, 0.5)"
      }, "-=0.3")
      .to(checkIconsRef.current, { 
        opacity: 1, 
        x: 0, 
        duration: 0.5, 
        stagger: 0.15,
        ease: "back.out" 
      }, "-=0.5")
      .to(dividerRef.current, { 
        scaleX: 1, 
        duration: 0.8, 
        ease: "power3.out",
        transformOrigin: "left center" 
      }, "-=0.3")
      .to(formRef.current.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out"
      }, "-=0.4");

    // Button hover animation
    const button = formRef.current.querySelector("button");
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        backgroundColor: "#0056b3",
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        backgroundColor: "#007bff",
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    return () => {
      button.removeEventListener("mouseenter", () => {});
      button.removeEventListener("mouseleave", () => {});
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // Animate the error state
      gsap.to([formRef.current.querySelectorAll("input[type='password']")], {
        x: [0, 5, -5, 5, -5, 0],
        duration: 0.6,
        ease: "power1.inOut",
        backgroundColor: "#ff3e3e20",
        borderColor: "#ff3e3e",
        onComplete: () => {
          gsap.to([formRef.current.querySelectorAll("input[type='password']")], {
            backgroundColor: "#2c2c2c",
            borderColor: "#333",
            duration: 0.5
          });
        }
      });
      return;
    }
    
    // Loading animation
    const button = e.currentTarget.querySelector("button");
    gsap.to(button, {
      backgroundColor: "#0056b3",
      scale: 0.98,
      duration: 0.3
    });
    
    axios.post('/users/register', { name, email, password })
      .then((res) => {
        // Success animation
        gsap.to(formRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          onComplete: () => {
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            navigate('/');
          }
        });
      })
      .catch((err) => {
        console.log(err.response.data);
        // Error animation
        gsap.to(formRef.current, {
          x: [0, 10, -10, 10, -10, 0],
          duration: 0.6,
          ease: "power1.inOut"
        });
      });
  };

  // Simple checkmark SVG
  const CheckIcon = () => (
    <svg 
      ref={el => checkIconsRef.current.push(el)} 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#007bff" 
      strokeWidth="2" 
      style={{ marginRight: '10px' }}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  // Simple developer illustration SVG
  const DeveloperIllustration = () => (
    <svg 
      ref={svgRef}
      width="300" 
      height="300" 
      viewBox="0 0 200 200"
      style={{ position: 'absolute', top: '10%', right: '5%' }}
    >
      {/* Laptop base */}
      <rect x="40" y="120" width="120" height="10" rx="2" fill="#333" />
      {/* Laptop screen */}
      <rect x="50" y="50" width="100" height="70" rx="2" fill="#1e1e1e" stroke="#007bff" strokeWidth="2" />
      {/* Code lines */}
      <rect x="60" y="70" width="60" height="3" fill="#007bff" />
      <rect x="60" y="80" width="40" height="3" fill="#007bff" />
      <rect x="60" y="90" width="70" height="3" fill="#007bff" />
      <rect x="60" y="100" width="30" height="3" fill="#007bff" />
      {/* Person head */}
      <circle cx="150" cy="100" r="15" fill="none" stroke="#007bff" strokeWidth="2" />
      {/* Person body */}
      <path d="M150 115v30 M140 140l10 10 M160 140l-10 10" stroke="#007bff" strokeWidth="2" fill="none" />
    </svg>
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left side - Description */}
      <div ref={leftPanelRef} style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 5%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        position: 'relative'
      }}>
        <DeveloperIllustration />
        
        <h1 ref={titleRef} style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1
        }}>Join RoboDev Community</h1>
        
        <p ref={subtitleRef} style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.6', 
          marginBottom: '30px',
          position: 'relative',
          zIndex: 1
        }}>
          Create your account and get access to exclusive features, collaborate with other developers, 
          and build amazing projects together.
        </p>
        
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          marginBottom: '30px',
          position: 'relative',
          zIndex: 1
        }}>
          <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <CheckIcon />
            Access to all projects and resources
          </li>
          <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <CheckIcon />
            Collaborate with other developers
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <CheckIcon />
            Get personalized recommendations
          </li>
        </ul>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginTop: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div ref={dividerRef} style={{ 
            width: '50px', 
            height: '2px', 
            backgroundColor: '#007bff', 
            marginRight: '15px',
            transform: 'scaleX(0)'
          }}></div>
          <span>Already have an account? <Link to="/login" style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => gsap.to(e.target, { color: '#00a8ff', duration: 0.3 })}
          onMouseLeave={(e) => gsap.to(e.target, { color: '#007bff', duration: 0.3 })}>Sign in</Link></span>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div ref={rightPanelRef} style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 40px',
        backgroundColor: '#1e1e1e'
      }}>
        <h2 style={{ 
          marginBottom: '30px', 
          textAlign: 'center',
          position: 'relative'
        }}>
          <span style={{
            display: 'inline-block',
            padding: '0 10px',
            background: 'linear-gradient(90deg, transparent, #007bff, transparent)',
            backgroundSize: '200% 100%',
            backgroundPosition: '100% 0',
            animation: 'shine 2s infinite',
          }}>Create Your Account</span>
        </h2>
        
        <form ref={formRef} onSubmit={handleSubmit}>
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
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => gsap.to(e.target, { 
                borderColor: '#007bff',
                boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
                duration: 0.3
              })}
              onBlur={(e) => gsap.to(e.target, { 
                borderColor: '#333',
                boxShadow: 'none',
                duration: 0.3
              })}
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
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => gsap.to(e.target, { 
                borderColor: '#007bff',
                boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
                duration: 0.3
              })}
              onBlur={(e) => gsap.to(e.target, { 
                borderColor: '#333',
                boxShadow: 'none',
                duration: 0.3
              })}
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
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => gsap.to(e.target, { 
                borderColor: '#007bff',
                boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
                duration: 0.3
              })}
              onBlur={(e) => gsap.to(e.target, { 
                borderColor: '#333',
                boxShadow: 'none',
                duration: 0.3
              })}
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
                border: '1px solid #333',
                backgroundColor: '#2c2c2c',
                color: 'white',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => gsap.to(e.target, { 
                borderColor: '#007bff',
                boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
                duration: 0.3
              })}
              onBlur={(e) => gsap.to(e.target, { 
                borderColor: '#333',
                boxShadow: 'none',
                duration: 0.3
              })}
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
          }}>
            Create Account
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

export default Register;