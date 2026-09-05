
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { Badge } from './Badge';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, role, switchRole, hasAccess } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isPermitted = hasAccess(allowedRoles);

  if (!isPermitted) {
    // Choose one role from allowed to offer quick escalation / demo switch
    const recommendedRole = allowedRoles[0];

    const getRoleName = (r: UserRole) => {
      switch (r) {
        case 'sales_rep': return 'Sales Representative';
        case 'sales_manager': return 'Sales Manager';
        case 'finance_director': return 'Finance Director';
        case 'admin': return 'Administrator';
        case 'customer': return 'Customer Portal';
      }
    };

    return (
      <div style={{
        maxWidth: 720,
        margin: '60px auto',
        padding: 32,
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{ padding: 40, borderRadius: 20 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}>
            <ShieldAlert size={34} color="var(--danger)" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Access Restricted (403 Forbidden)
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 20, lineHeight: 1.6 }}>
            Your active role (<strong style={{ color: 'var(--accent-cyan)' }}>{getRoleName(role)}</strong>) does not have sufficient governance clearance to view or operate this module.
          </p>

          <div style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 28,
            display: 'inline-block',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>
              Authorized Roles for this Screen:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allowedRoles.map(r => (
                <Badge key={r} label={getRoleName(r)} variant="info" />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              <ArrowLeft size={16} /> Return to Allowed Workspace
            </Link>

            <button
              onClick={() => switchRole(recommendedRole)}
              className="btn btn-primary btn-lg"
            >
              <RefreshCw size={16} /> Switch to {getRoleName(recommendedRole)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
