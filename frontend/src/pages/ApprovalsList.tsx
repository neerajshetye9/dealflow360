
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Filter, ArrowUpRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '../components/Badge';

export const ApprovalsList: React.FC = () => {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');

  const mockApprovals = [
    {
      id: 'app-001',
      quotationId: 'q0000000-0000-0000-0000-000000000001',
      quoteNumber: 'QT-2026-001',
      customerName: 'Acme Global Enterprises',
      tier: 'PLATINUM',
      requestedBy: 'Neeraj Shetye',
      totalValue: 54000,
      blendedRiskScore: 78,
      maxDiscount: 28,
      route: 'Sequential Two-Level (Manager + Director)',
      currentStep: 'Finance Director Review',
      status: 'PENDING',
      submittedAt: '2026-09-04 14:30'
    },
    {
      id: 'app-002',
      quotationId: 'q0000000-0000-0000-0000-000000000002',
      quoteNumber: 'QT-2026-002',
      customerName: 'Nexus Cloud Systems',
      tier: 'GOLD',
      requestedBy: 'Neeraj Shetye',
      totalValue: 28500,
      blendedRiskScore: 45,
      maxDiscount: 18,
      route: 'Sales Manager Review',
      currentStep: 'Sales Manager Approval',
      status: 'PENDING',
      submittedAt: '2026-09-05 09:15'
    },
    {
      id: 'app-003',
      quotationId: 'q0000000-0000-0000-0000-000000000003',
      quoteNumber: 'QT-2026-003',
      customerName: 'Starlight Retailers',
      tier: 'SILVER',
      requestedBy: 'Atharva Shirke',
      totalValue: 12000,
      blendedRiskScore: 22,
      maxDiscount: 10,
      route: 'Auto-Approved (<30 Risk)',
      currentStep: 'Completed',
      status: 'APPROVED',
      submittedAt: '2026-09-03 11:00'
    }
  ];

  const filtered = mockApprovals.filter(a => filter === 'ALL' || a.status === filter);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Governance Approval Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Multi-tier discount governance workflows and risk routing (Neeraj's Domain)
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setFilter('PENDING')}
            className={`btn btn-sm ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending Action ({mockApprovals.filter(a => a.status === 'PENDING').length})
          </button>
          <button 
            onClick={() => setFilter('APPROVED')}
            className={`btn btn-sm ${filter === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Approved History
          </button>
          <button 
            onClick={() => setFilter('ALL')}
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Customer</th>
              <th>Requested By</th>
              <th>Quote Total</th>
              <th>Max Discount</th>
              <th>Blended Risk Score</th>
              <th>Routing Tier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => {
              const riskVariant = app.blendedRiskScore >= 70 ? 'danger' : app.blendedRiskScore >= 30 ? 'warning' : 'success';
              return (
                <tr key={app.id}>
                  <td>
                    <Link to={`/approvals/${app.id}`} style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {app.quoteNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{app.customerName}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.tier} TIER</span>
                  </td>
                  <td>{app.requestedBy}</td>
                  <td style={{ fontWeight: 600 }}>${app.totalValue.toLocaleString()}</td>
                  <td>
                    <span style={{ color: app.maxDiscount > 20 ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {app.maxDiscount}%
                    </span>
                  </td>
                  <td>
                    <Badge 
                      label={`Risk: ${app.blendedRiskScore}/100`} 
                      variant={riskVariant} 
                    />
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {app.route}
                  </td>
                  <td>
                    <Badge 
                      label={app.status} 
                      variant={app.status === 'APPROVED' ? 'success' : 'warning'} 
                    />
                  </td>
                  <td>
                    <Link to={`/approvals/${app.id}`} className="btn btn-secondary btn-sm">
                      Review <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
