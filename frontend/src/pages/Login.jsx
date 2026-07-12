import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IconTruck } from '../components/icons';

const ROLES = [
  { value: 'FLEET_MANAGER', label: 'Fleet Manager' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'SAFETY_OFFICER', label: 'Safety Officer' },
  { value: 'FINANCIAL_ANALYST', label: 'Financial Analyst' },
];

// One page, two modes: /login = sign in, /signup = create account
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isSignup = useLocation().pathname === '/signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DRIVER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isSignup
        ? await api.post('/auth/register', { name, email, password, role })
        : await api.post('/auth/login', { email, password });
      login(data);
      if (isSignup) toast.success(`Welcome to TransitOps, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-ico"><IconTruck size={22} /></div>
          <div>
            <div className="brand-name">TransitOps</div>
            <div className="brand-tag">Fleet Operations</div>
          </div>
        </div>
        <p className="muted">
          {isSignup ? 'Create your account to join the operations command center.' : 'Sign in to your operations command center.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {isSignup && (
          <label>
            Full Name
