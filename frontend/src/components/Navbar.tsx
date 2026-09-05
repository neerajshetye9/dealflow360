
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ExternalLink,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { role, switchRole, user, logout, hasAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isPortal = location.pathname.startsWith('/portal');
  if (isPortal) return null;

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = (r: UserRole) => {
    switch (r) {
      case 'sales_rep': return 'info';
      case 'sales_manager': return 'warning';
      case 'finance_director': return 'success';
      case 'admin': return 'danger';
      case 'customer': return 'neutral';
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'sales_rep': return 'Sales Rep';
      case 'sales_manager': return 'Sales Manager';
      case 'finance_director': return 'Finance Dir';
      case 'admin': return 'Admin';
      case 'customer': return 'Customer';
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 13, 20, 0.88)',
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

        {/* Dynamic Navigation Tabs (Filtered by Role Permissions) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Dashboard: Rep, Manager, Finance, Admin */}
          {hasAccess(['sales_rep', 'sales_manager', 'finance_director', 'admin']) && (
            <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{
              background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/dashboard') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)'
            }}>
              <BarChart3 size={15} /> Dashboard
            </Link>
          )}

          {/* Quotations: Rep, Manager, Admin */}
          {hasAccess(['sales_rep', 'sales_manager', 'admin']) && (
            <Link to="/quotations" className="btn btn-secondary btn-sm" style={{
              background: isActive('/quotations') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/quotations') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/quotations') ? '#fff' : 'var(--text-secondary)'
            }}>
              <Layers size={15} /> Quotes
            </Link>
          )}

          {/* Approvals: Manager, Finance, Admin */}
          {hasAccess(['sales_manager', 'finance_director', 'admin']) && (
            <Link to="/approvals" className="btn btn-secondary btn-sm" style={{
              background: isActive('/approvals') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/approvals') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/approvals') ? '#fff' : 'var(--text-secondary)'
            }}>
              <ShieldCheck size={15} /> Approvals
            </Link>
          )}

          {/* Deal Health: Manager, Finance, Admin */}
          {hasAccess(['sales_manager', 'finance_director', 'admin']) && (
            <Link to="/deal-health" className="btn btn-secondary btn-sm" style={{
              background: isActive('/deal-health') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/deal-health') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/deal-health') ? '#fff' : 'var(--text-secondary)'
            }}>
              <Activity size={15} /> Deal Health
            </Link>
          )}

          {/* Product Catalog: Rep, Manager, Admin */}
          {hasAccess(['sales_rep', 'sales_manager', 'admin']) && (
            <Link to="/products" className="btn btn-secondary btn-sm" style={{
              background: isActive('/products') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/products') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/products') ? '#fff' : 'var(--text-secondary)'
            }}>
              <Box size={15} /> Products
            </Link>
          )}

          {/* Fulfillment: Finance, Admin */}
          {hasAccess(['finance_director', 'admin']) && (
            <Link to="/fulfillment" className="btn btn-secondary btn-sm" style={{
              background: isActive('/fulfillment') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/fulfillment') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/fulfillment') ? '#fff' : 'var(--text-secondary)'
            }}>
              <Truck size={15} /> Fulfillment
            </Link>
          )}

          {/* Subscriptions: Finance, Admin */}
          {hasAccess(['finance_director', 'admin']) && (
            <Link to="/subscriptions" className="btn btn-secondary btn-sm" style={{
              background: isActive('/subscriptions') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/subscriptions') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/subscriptions') ? '#fff' : 'var(--text-secondary)'
            }}>
              <FileText size={15} /> Subscriptions
            </Link>
          )}

          {/* Invoices: Finance, Admin */}
          {hasAccess(['finance_director', 'admin']) && (
            <Link to="/invoices" className="btn btn-secondary btn-sm" style={{
              background: isActive('/invoices') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/invoices') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/invoices') ? '#fff' : 'var(--text-secondary)'
            }}>
              Invoices
            </Link>
          )}

          {/* Reports: Manager, Finance, Admin */}
          {hasAccess(['sales_manager', 'finance_director', 'admin']) && (
            <Link to="/reports" className="btn btn-secondary btn-sm" style={{
              background: isActive('/reports') ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderColor: isActive('/reports') ? 'var(--accent-primary)' : 'transparent',
              color: isActive('/reports') ? '#fff' : 'var(--text-secondary)'
            }}>
              Reports
            </Link>
          )}

          {/* Discount Policy Config: Admin only! */}
          {hasAccess(['admin']) && (
            <Link to="/admin/discount-config" className="btn btn-secondary btn-sm" style={{
              background: isActive('/admin/discount-config') ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              borderColor: isActive('/admin/discount-config') ? '#a855f7' : 'transparent',
              color: isActive('/admin/discount-config') ? '#fff' : 'var(--text-secondary)'
            }}>
              <Sliders size={15} color="#c084fc" /> Discount Rules
            </Link>
          )}
        </nav>

        {/* Right Persona Profile & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Active User Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {user?.territory || user?.division || user?.department || user?.email}
              </div>
            </div>

            <Badge label={getRoleLabel(role)} variant={getRoleBadgeVariant(role)} size="sm" />
          </div>

          {/* Real-Time Role Switcher */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer'
              }}
              title="Instant Persona Switcher"
            >
              <option value="sales_rep">💼 Sales Rep (Neeraj)</option>
              <option value="sales_manager">🛡️ Sales Manager (Atharva)</option>
              <option value="finance_director">📊 Finance Director (Vignesh)</option>
              <option value="admin">⚙️ Administrator</option>
              <option value="customer">🌐 Customer Portal</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            title="Log Out"
            style={{ padding: '6px 10px' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
