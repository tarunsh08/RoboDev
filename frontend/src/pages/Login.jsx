import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
import { gsap } from 'gsap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Refs for GSAP animations
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const dividerRef = useRef(null);
  const svgRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    // Initial setup - hide elements
    gsap.set([leftPanelRef.current, rightPanelRef.current], { opacity: 0 });
    gsap.set(svgRef.current, { opacity: 0, y: 50 });
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
    
    // Loading animation
    const button = e.currentTarget.querySelector("button");
    gsap.to(button, {
      backgroundColor: "#0056b3",
      scale: 0.98,
      duration: 0.3
    });
    
    axios.post('/users/login', { email, password })
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
          ease: "power1.inOut",
          backgroundColor: "#ff3e3e20",
          onComplete: () => {
            gsap.to(formRef.current, {
              backgroundColor: "#1e1e1e",
              duration: 0.5
            });
          }
        });
      });
  };

  // Simple login illustration SVG
  const LoginIllustration = () => (
    <svg 
      ref={svgRef}
      width="300" 
      height="300" 
      viewBox="0 0 200 200"
      style={{ position: 'absolute', top: '10%', right: '5%' }}
    >
      {/* Shield/Login symbol */}
      <path d="M100 30L30 60V100C30 150 100 170 100 170C100 170 170 150 170 100V60Z" 
        fill="none" stroke="#007bff" strokeWidth="2" />
      {/* Keyhole */}
      <circle cx="100" cy="100" r="20" fill="none" stroke="#007bff" strokeWidth="2" />
      <rect x="95" y="100" width="10" height="30" fill="none" stroke="#007bff" strokeWidth="2" />
      {/* Key */}
      <path d="M140 100L160 80 M160 80L180 60 M160 80C160 60 140 60 140 80C140 100 160 100 160 80Z" 
        fill="none" stroke="#007bff" strokeWidth="2" />
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
        <LoginIllustration />
        
        <h1 ref={titleRef} style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1
        }}>Welcome Back! To RoboDev</h1>
        
        <p ref={subtitleRef} style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.6', 
          marginBottom: '30px',
          position: 'relative',
          zIndex: 1
        }}>
          Join our community of developers and enthusiasts. Access your projects, collaborate with others, 
          and take your skills to the next level.
        </p>
        
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
          <span>New here? <Link to="/register" style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => gsap.to(e.target, { color: '#00a8ff', duration: 0.3 })}
          onMouseLeave={(e) => gsap.to(e.target, { color: '#007bff', duration: 0.3 })}>Create an account</Link></span>
        </div>
      </div>

      {/* Right side - Login Form */}
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
          }}>Login to Your Account</span>
        </h2>
        
        <form ref={formRef} onSubmit={handleSubmit}>
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
          
          <div style={{ marginBottom: '25px' }}>
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
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}>
            Sign In
          </button>
          
          <div style={{ 
            textAlign: 'center', 
            fontSize: '14px',
            opacity: 0 // Will be animated by GSAP
          }}>
            <Link to="/forgot-password" style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => gsap.to(e.target, { color: '#00a8ff', duration: 0.3 })}
            onMouseLeave={(e) => gsap.to(e.target, { color: '#007bff', duration: 0.3 })}>
              Forgot password?
            </Link>
          </div>
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

export default Login;