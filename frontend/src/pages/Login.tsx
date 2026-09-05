
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sales.rep@dealflow360.internal');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<UserRole>('sales_rep');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(role);
    if (role === 'sales_rep') navigate('/dashboard');
    else if (role === 'sales_manager') navigate('/approvals');
    else if (role === 'finance_director') navigate('/fulfillment');
    else navigate('/admin/discount-config');
  };

  const setQuickUser = (r: UserRole, em: string) => {
    setRole(r);
    setEmail(em);
    switchRole(r);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: 36, borderRadius: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            marginBottom: 16
          }}>
            <Activity size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            DealFlow<span style={{ color: '#38bdf8' }}>360</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            Enterprise Sales Operations & Governance Platform
          </p>
        </div>

        {/* Quick Persona Buttons */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
            Instant Demo Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => setQuickUser('sales_rep', 'sales.rep@dealflow360.internal')}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: role === 'sales_rep' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: role === 'sales_rep' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              Sales Rep
            </button>
            <button
              type="button"
              onClick={() => setQuickUser('sales_manager', 'sales.manager@dealflow360.internal')}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: role === 'sales_manager' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: role === 'sales_manager' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              Sales Manager
            </button>
            <button
              type="button"
              onClick={() => setQuickUser('finance_director', 'finance.director@dealflow360.internal')}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: role === 'finance_director' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: role === 'finance_director' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              Finance Director
            </button>
            <button
              type="button"
              onClick={() => setQuickUser('admin', 'admin@dealflow360.internal')}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: role === 'admin' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
            Sign In to DealFlow360 <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
