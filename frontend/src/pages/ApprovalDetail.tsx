
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ArrowLeft , Clock } from 'lucide-react';
import { Badge } from '../components/Badge';

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams();
  const [decision, setDecision] = useState<'IDLE' | 'APPROVED' | 'REJECTED' | 'RETURNED'>('IDLE');
  const [comment, setComment] = useState('');

  const mockData = {
    id: id || 'app-001',
    quoteNumber: 'QT-2026-001',
    customerName: 'Acme Global Enterprises',
    customerTier: 'PLATINUM',
    requestedBy: 'Neeraj Shetye (Sales Rep)',
    blendedRiskScore: 78,
    totalValue: 54000,
    currentStep: 'Finance Director Review (Step 2 of 2)',
    steps: [
      { name: 'Submission', actor: 'Neeraj Shetye', status: 'COMPLETED', time: 'Sep 4, 14:30' },
      { name: 'Sales Manager Approval', actor: 'Atharva Shirke', status: 'COMPLETED', time: 'Sep 4, 16:15', note: 'Approved due to 3-year term' },
      { name: 'Finance Director Approval', actor: 'Vignesh K', status: 'PENDING', time: 'Awaiting decision' }
    ],
    violations: [
      {
        product: 'Enterprise Server Rack X-500',
        category: 'Hardware',
        categoryCeiling: 15,
        tierCeiling: 25,
        effectiveCeiling: 15, // Rule 4: MIN(tier, category)
        requestedDiscount: 28,
        overage: 13,
        marginImpact: 'High'
      },
      {
        product: 'Cloud Deployment Pro Services',
        category: 'Professional Services',
        categoryCeiling: 10,
        tierCeiling: 25,
        effectiveCeiling: 10,
        requestedDiscount: 18,
        overage: 8,
        marginImpact: 'Medium'
      }
    ]
  };

  const handleAction = (type: 'APPROVED' | 'REJECTED' | 'RETURNED') => {
    setDecision(type);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/approvals" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Approvals
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Approval Review: {mockData.quoteNumber}
            </h1>
            <Badge label="HIGH RISK (78/100)" variant="danger" />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Customer: <strong style={{ color: '#fff' }}>{mockData.customerName}</strong> ({mockData.customerTier} Tier) • Requested by {mockData.requestedBy}
          </p>
        </div>

        {decision !== 'IDLE' && (
          <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', fontWeight: 600 }}>
            Decision Recorded: {decision}
          </div>
        )}
      </div>

      {/* Stepper Timeline */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
          Sequential Approval Pipeline (Rule 7)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {mockData.steps.map((st, idx) => (
            <div key={idx} style={{
              padding: 16,
              borderRadius: 10,
              background: st.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
              border: '1px solid',
              borderColor: st.status === 'COMPLETED' ? 'var(--success-border)' : 'var(--accent-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {st.status === 'COMPLETED' ? <CheckCircle2 size={16} color="var(--success)" /> : <Clock size={16} color="var(--accent-cyan)" />}
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{st.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.actor} • {st.time}</div>
              {st.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>"{st.note}"</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Violation Breakdown Table */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
          Policy Violation Audit Matrix (Rule 4, 5, 6)
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Line</th>
                <th>Category</th>
                <th>Category Ceiling</th>
                <th>Tier Ceiling</th>
                <th>Effective Ceiling [MIN]</th>
                <th>Requested Discount</th>
                <th>Overage</th>
                <th>Margin Risk</th>
              </tr>
            </thead>
            <tbody>
              {mockData.violations.map((v, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{v.product}</td>
                  <td>{v.category}</td>
                  <td>{v.categoryCeiling}%</td>
                  <td>{v.tierCeiling}%</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{v.effectiveCeiling}%</td>
                  <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{v.requestedDiscount}%</td>
                  <td><Badge label={`+${v.overage}%`} variant="danger" /></td>
                  <td><Badge label={v.marginImpact} variant="warning" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Action Box */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          Take Governance Action
        </h3>
        <textarea
          placeholder="Enter reason or negotiation instructions for the sales rep..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          style={{ width: '100%', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleAction('APPROVED')} className="btn btn-success btn-lg">
            <CheckCircle2 size={18} /> Approve Discount
          </button>
          <button onClick={() => handleAction('RETURNED')} className="btn btn-warning btn-lg">
            <RotateCcw size={18} /> Return with Comments
          </button>
          <button onClick={() => handleAction('REJECTED')} className="btn btn-danger btn-lg">
            <XCircle size={18} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};
