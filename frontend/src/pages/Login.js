import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-2" data-testid="login-page-title">
            Library Management
          </h1>
          <p className="text-base font-medium leading-relaxed text-[#595956] mb-8">
            Sign in to manage your library operations
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <label className="label-text" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                required
                data-testid="login-email-input"
              />
            </div>

            <div>
              <label className="label-text" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                required
                data-testid="login-password-input"
              />
            </div>

            {error && (
              <div className="error-text" data-testid="login-error-message">
                Error: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E0E0D9]">
            <p className="text-sm text-[#595956] font-medium">
              <span className="font-['IBM_Plex_Mono'] text-xs">Test Credentials:</span><br />
              Admin: admin@library.com / admin123<br />
              User: user@library.com / user123
            </p>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block lg:w-1/2 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1650099661671-a6db70726e99?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBsaWJyYXJ5JTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3NTAzNDI0NXww&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[rgba(17,17,17,0.2)]"></div>
      </div>
    </div>
  );
};

export default Login;
