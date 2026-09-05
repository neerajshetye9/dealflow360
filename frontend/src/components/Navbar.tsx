
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  Layers, 
  Truck, 
  BarChart3, 
  Activity, 
  FileText, 
  Box, 
  Sliders, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, switchRole, user } = useAuth();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal');
  if (isPortal) return null;

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
            }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#fff' }}>
                DealFlow<span style={{ color: '#38bdf8' }}>360</span>
              </span>
              <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: -2 }}>
                Intelligent Sales Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Domain Navigation Clusters */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Workspace (Atharva) */}
          <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{
            background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/dashboard') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)'
          }}>
            <BarChart3 size={15} /> Dashboard
          </Link>

          <Link to="/quotations" className="btn btn-secondary btn-sm" style={{
            background: isActive('/quotations') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/quotations') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/quotations') ? '#fff' : 'var(--text-secondary)'
          }}>
            <Layers size={15} /> Quotes Kanban
          </Link>

          <Link to="/deal-health" className="btn btn-secondary btn-sm" style={{
            background: isActive('/deal-health') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/deal-health') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/deal-health') ? '#fff' : 'var(--text-secondary)'
          }}>
            <Activity size={15} /> Deal Health
          </Link>

          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Governance (Neeraj) */}
          <Link to="/approvals" className="btn btn-secondary btn-sm" style={{
            background: isActive('/approvals') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/approvals') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/approvals') ? '#fff' : 'var(--text-secondary)'
          }}>
            <ShieldCheck size={15} /> Approvals
          </Link>

          <Link to="/products" className="btn btn-secondary btn-sm" style={{
            background: isActive('/products') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/products') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/products') ? '#fff' : 'var(--text-secondary)'
          }}>
            <Box size={15} /> Products
          </Link>

          <Link to="/admin/discount-config" className="btn btn-secondary btn-sm" style={{
            background: isActive('/admin/discount-config') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/admin/discount-config') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/admin/discount-config') ? '#fff' : 'var(--text-secondary)'
          }}>
            <Sliders size={15} /> Discount Rules
          </Link>

          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Operations & Billing (Vignesh) */}
          <Link to="/fulfillment" className="btn btn-secondary btn-sm" style={{
            background: isActive('/fulfillment') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/fulfillment') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/fulfillment') ? '#fff' : 'var(--text-secondary)'
          }}>
            <Truck size={15} /> Fulfillment
          </Link>

          <Link to="/subscriptions" className="btn btn-secondary btn-sm" style={{
            background: isActive('/subscriptions') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/subscriptions') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/subscriptions') ? '#fff' : 'var(--text-secondary)'
          }}>
            <FileText size={15} /> Subscriptions
          </Link>

          <Link to="/invoices" className="btn btn-secondary btn-sm" style={{
            background: isActive('/invoices') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/invoices') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/invoices') ? '#fff' : 'var(--text-secondary)'
          }}>
            Invoices
          </Link>

          <Link to="/reports" className="btn btn-secondary btn-sm" style={{
            background: isActive('/reports') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            borderColor: isActive('/reports') ? 'var(--accent-primary)' : 'transparent',
            color: isActive('/reports') ? '#fff' : 'var(--text-secondary)'
          }}>
            Reports
          </Link>
        </nav>

        {/* Right Persona Switcher & Portal Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/portal/sample-portal-token" className="btn btn-secondary btn-sm" title="Open Customer Portal (S11)">
            <ExternalLink size={14} /> Portal
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 8px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)'
          }}>
            <UserCheck size={16} color="var(--accent-cyan)" />
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              <option value="sales_rep" style={{ background: '#0f172a' }}>Neeraj (Sales Rep)</option>
              <option value="sales_manager" style={{ background: '#0f172a' }}>Atharva (Sales Manager)</option>
              <option value="finance_director" style={{ background: '#0f172a' }}>Vignesh (Finance Director)</option>
              <option value="admin" style={{ background: '#0f172a' }}>Admin (Superuser)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
