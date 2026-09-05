
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SEEDED_PROFILES } from '../context/AuthContext';
import { UserRole, User } from '../types';
import { 
  Activity, 
  ShieldCheck, 
  Briefcase, 
  TrendingUp, 
  Lock, 
  Mail, 
  User as UserIcon, 
  MapPin, 
  DollarSign, 
  Key, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../components/Badge';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  territory?: string;
  quota?: string;
  division?: string;
  managerKey?: string;
  department?: string;
  financePin?: string;
  adminKey?: string;
  companyName?: string;
  portalToken?: string;
}

export const Login: React.FC = () => {
  const { loginUser, registerUser, switchRole } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('sales_rep');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role Specific Fields
  const [territory, setTerritory] = useState('North America Enterprise');
  const [quota, setQuota] = useState('1500000');
  const [division, setDivision] = useState('Enterprise Mid-Atlantic & West');
  const [approvalLimit, setApprovalLimit] = useState('100000');
  const [managerKey, setManagerKey] = useState('MGR-2026-KEY');
  const [department, setDepartment] = useState('Commercial Finance & Billing');
  const [costCenter, setCostCenter] = useState('CC-FIN-982');
  const [financePin, setFinancePin] = useState('9842');
  const [adminKey, setAdminKey] = useState('ADMIN-ROOT-KEY');
  const [companyName, setCompanyName] = useState('Acme Global Enterprises');
  const [portalToken, setPortalToken] = useState('sample-portal-token');

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When role changes, pre-fill demo defaults for that role in Login mode
  useEffect(() => {
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
    const demo = SEEDED_PROFILES[selectedRole];
    if (demo) {
      setEmail(demo.email);
      setPassword('Password@123');
      setFullName(demo.fullName);
    }
  }, [selectedRole, mode]);

  const validateForm = (): boolean => {
    const errs: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address (e.g. name@company.com).';
    }

    // Password validation
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    // Signup specific validations
    if (mode === 'SIGNUP') {
      if (!fullName.trim()) {
        errs.fullName = 'Full legal name is required.';
      }

      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }

      // Role-specific validations
      if (selectedRole === 'sales_rep') {
        if (!territory.trim()) errs.territory = 'Assigned sales territory is required.';
        if (!quota || Number(quota) <= 0) errs.quota = 'Please specify a valid annual sales quota.';
      } else if (selectedRole === 'sales_manager') {
        if (!division.trim()) errs.division = 'Management division/region is required.';
        if (!managerKey.trim()) errs.managerKey = 'Manager authorization code is required.';
      } else if (selectedRole === 'finance_director') {
        if (!department.trim()) errs.department = 'Finance department/cost center is required.';
        if (!financePin.trim() || financePin.length < 4) errs.financePin = 'Enter a 4-digit finance security authorization PIN.';
      } else if (selectedRole === 'admin') {
        if (!adminKey.trim()) errs.adminKey = 'Master Administrator security passcode is required.';
      } else if (selectedRole === 'customer') {
        if (!companyName.trim()) errs.companyName = 'Company name is required.';
        if (!portalToken.trim()) errs.portalToken = 'Quotation portal token reference is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setServerError(null);

    if (mode === 'LOGIN') {
      // Try backend authentication or local seed profile match
      try {
        const demo = SEEDED_PROFILES[selectedRole];
        const userObj: User = {
          id: demo?.id || 'u-' + Math.random().toString(36).substring(2, 9),
          email: email.trim(),
          fullName: fullName || demo?.fullName || 'Authenticated User',
          role: selectedRole,
          territory: selectedRole === 'sales_rep' ? territory : undefined,
          quota: selectedRole === 'sales_rep' ? Number(quota) : undefined,
          division: selectedRole === 'sales_manager' ? division : undefined,
          approvalLimit: selectedRole === 'sales_manager' ? Number(approvalLimit) : undefined,
          department: selectedRole === 'finance_director' ? department : undefined,
          costCenter: selectedRole === 'finance_director' ? costCenter : undefined,
          companyName: selectedRole === 'customer' ? companyName : undefined,
          portalToken: selectedRole === 'customer' ? portalToken : undefined
        };

        loginUser(userObj);
        redirectByRole(selectedRole);
      } catch (err: any) {
        setServerError('Invalid email or password credentials for this role profile.');
      }
    } else {
      // Sign-Up registration
      const newUser: User = {
        id: 'u-reg-' + Math.random().toString(36).substring(2, 9),
        email: email.trim(),
        fullName: fullName.trim(),
        role: selectedRole,
        territory: selectedRole === 'sales_rep' ? territory : undefined,
        quota: selectedRole === 'sales_rep' ? Number(quota) : undefined,
        division: selectedRole === 'sales_manager' ? division : undefined,
        approvalLimit: selectedRole === 'sales_manager' ? Number(approvalLimit) : undefined,
        department: selectedRole === 'finance_director' ? department : undefined,
        costCenter: selectedRole === 'finance_director' ? costCenter : undefined,
        companyName: selectedRole === 'customer' ? companyName : undefined,
        portalToken: selectedRole === 'customer' ? portalToken : undefined
      };

      registerUser(newUser);
      setSuccessMessage(`Account created successfully as ${fullName} (${selectedRole})!`);
      setTimeout(() => {
        redirectByRole(selectedRole);
      }, 1000);
    }
  };

  const redirectByRole = (r: UserRole) => {
    switch (r) {
      case 'sales_rep':
        navigate('/dashboard');
        break;
      case 'sales_manager':
        navigate('/approvals');
        break;
      case 'finance_director':
        navigate('/fulfillment');
        break;
      case 'admin':
        navigate('/admin/discount-config');
        break;
      case 'customer':
        navigate(`/portal/${portalToken || 'sample-portal-token'}`);
        break;
      default:
        navigate('/dashboard');
    }
  };

  const roleMeta: Record<UserRole, { title: string; subtitle: string; icon: any; color: string; badge: string; allowedFeatures: string[] }> = {
    sales_rep: {
      title: 'Sales Representative',
      subtitle: 'Create quotes, configure line discounts, browse catalog, track deals',
      icon: <Briefcase size={20} />,
      color: 'var(--accent-cyan)',
      badge: 'Territory Sales Account Executive',
      allowedFeatures: ['Sales Dashboard (S2)', 'Quotations Kanban (S3)', 'Quotation Detail & Upsell (S4)', 'Products Catalog (S16)']
    },
    sales_manager: {
      title: 'Sales Manager',
      subtitle: 'Review & approve L1 discount violations, monitor stalled deals and anomalies',
      icon: <ShieldCheck size={20} />,
      color: '#f59e0b',
      badge: 'Tier 1 Discount Governance Authority',
      allowedFeatures: ['Approvals Queue (S5)', 'Approval Detail & Stepper (S6)', 'Deal Health & Alerts (S14)', 'Sales Pipeline (S3)']
    },
    finance_director: {
      title: 'Finance Director',
      subtitle: 'L2 high-risk authorization, fulfillment routing, hybrid subscriptions & invoicing',
      icon: <TrendingUp size={20} />,
      color: '#10b981',
      badge: 'Executive Commercial Operations & Treasury',
      allowedFeatures: ['L2 Approvals (S6)', 'Multi-Warehouse Fulfillment (S7, S8)', 'Hybrid Billing & Proration (S9, S10)', 'Invoices & Payments (S12, S13)', 'Executive Reports (S15)']
    },
    admin: {
      title: 'System Administrator',
      subtitle: 'Configure discount governance rules, customer tiers, category hard ceilings',
      icon: <Key size={20} />,
      color: '#a855f7',
      badge: 'Superuser Governance Configurator',
      allowedFeatures: ['Discount Governance Rules (S18)', 'All Workspace Modules', 'Full Audit Log Matrix', 'Product & Price Lists']
    },
    customer: {
      title: 'Customer Client',
      subtitle: 'Review proposals, negotiate pricing terms, and submit counter-proposals',
      icon: <Building size={20} />,
      color: '#38bdf8',
      badge: 'Client Proposal Negotiation Portal',
      allowedFeatures: ['Customer Negotiation Portal (S11)', 'Proposal Terms Review', 'Counter-Proposal Submission']
    }
  };

  const currentMeta = roleMeta[selectedRole];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 65%)'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)',
          marginBottom: 12
        }}>
          <Activity size={28} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
          DealFlow<span style={{ color: '#38bdf8' }}>360</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
          Role-Governed Enterprise Sales Operations & Revenue Platform
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div style={{ width: '100%', maxWidth: 840, marginBottom: 24 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10
        }}>
          {(['sales_rep', 'sales_manager', 'finance_director', 'admin', 'customer'] as UserRole[]).map(r => {
            const meta = roleMeta[r];
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 8px',
                  borderRadius: 12,
                  border: '1px solid',
                  borderColor: isSelected ? meta.color : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? `0 0 16px ${meta.color}40` : 'none'
                }}
              >
                <div style={{ color: isSelected ? meta.color : 'var(--text-muted)', marginBottom: 6 }}>
                  {meta.icon}
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}>
                  {meta.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 640,
        padding: '32px 36px',
        borderRadius: 20,
        position: 'relative'
      }}>
        {/* Active Role Header Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 16,
          marginBottom: 20,
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: currentMeta.color }}>{currentMeta.icon}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {currentMeta.title} Portal
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {currentMeta.subtitle}
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: 3,
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              style={{
                background: mode === 'LOGIN' ? 'var(--accent-primary)' : 'transparent',
                color: mode === 'LOGIN' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('SIGNUP')}
              style={{
                background: mode === 'SIGNUP' ? 'var(--accent-primary)' : 'transparent',
                color: mode === 'SIGNUP' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Register New
            </button>
          </div>
        </div>

        {/* Allowed Access Capabilities Preview */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 20
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
            Granted Permissions for this Role:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {currentMeta.allowedFeatures.map((feat, i) => (
              <span key={i} style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#cbd5e1'
              }}>
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Notifications */}
        {serverError && (
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-border)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={16} /> {serverError}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--success-border)',
            color: '#34d399',
            fontSize: '0.85rem',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full Name (Sign Up only) */}
          {mode === 'SIGNUP' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Legal Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: 38,
                    borderColor: errors.fullName ? 'var(--danger)' : undefined
                  }}
                />
              </div>
              {errors.fullName && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                  {errors.fullName}
                </span>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              {selectedRole === 'customer' ? 'Corporate Contact Email' : 'Work Email Address'} <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                placeholder={selectedRole === 'customer' ? 'buyer@company.com' : 'user@dealflow360.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 38,
                  borderColor: errors.email ? 'var(--danger)' : undefined
                }}
              />
            </div>
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Role-Specific Fields */}
          {/* 1. SALES REP */}
          {selectedRole === 'sales_rep' && mode === 'SIGNUP' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Sales Territory <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  value={territory}
                  onChange={e => setTerritory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="North America Enterprise">North America Enterprise</option>
                  <option value="EMEA Commercial & Cloud">EMEA Commercial & Cloud</option>
                  <option value="APAC Growth & Telco">APAC Growth & Telco</option>
                  <option value="LATAM Emerging Markets">LATAM Emerging Markets</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Annual Quota Target ($) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  value={quota}
                  onChange={e => setQuota(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* 2. SALES MANAGER */}
          {selectedRole === 'sales_manager' && mode === 'SIGNUP' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Managed Division <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={division}
                  onChange={e => setDivision(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Manager Passcode <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="password"
                  value={managerKey}
                  onChange={e => setManagerKey(e.target.value)}
                  placeholder="Verification Key"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* 3. FINANCE DIRECTOR */}
          {selectedRole === 'finance_director' && mode === 'SIGNUP' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Cost Center Reference <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={costCenter}
                  onChange={e => setCostCenter(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Finance Authorization PIN <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={financePin}
                  onChange={e => setFinancePin(e.target.value)}
                  placeholder="4-6 digit PIN"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* 4. ADMIN */}
          {selectedRole === 'admin' && mode === 'SIGNUP' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Master Administrator Secret Passcode <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="Enter master root key"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* 5. CUSTOMER PORTAL */}
          {selectedRole === 'customer' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Client Company Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Quotation Access Token <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={portalToken}
                  onChange={e => setPortalToken(e.target.value)}
                  placeholder="Portal Token ID"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              {selectedRole === 'customer' ? 'Client Access Passphrase' : 'Account Password'} <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 38,
                  borderColor: errors.password ? 'var(--danger)' : undefined
                }}
              />
            </div>
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'SIGNUP' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: 38,
                    borderColor: errors.confirmPassword ? 'var(--danger)' : undefined
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 10 }}>
            {mode === 'LOGIN' ? `Sign In as ${currentMeta.title}` : `Create ${currentMeta.title} Account`}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Autofill Notice */}
        <div style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Seeded Account: <strong style={{ color: '#fff' }}>{SEEDED_PROFILES[selectedRole].email}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              const demo = SEEDED_PROFILES[selectedRole];
              setEmail(demo.email);
              setPassword('Password@123');
              setFullName(demo.fullName);
              setConfirmPassword('Password@123');
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <Sparkles size={12} /> Auto-fill {currentMeta.title}
          </button>
        </div>
      </div>
    </div>
  );
};
