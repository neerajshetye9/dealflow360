import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { api } from '../api';

export const ApprovalsList: React.FC = () => {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listApprovals();
      setApprovals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filtered = approvals.filter(a => {
    if (filter === 'ALL') return true;
    const status = (a.status || a.decision_status || '').toUpperCase();
    if (filter === 'PENDING') return status === 'PENDING';
    if (filter === 'APPROVED') return status === 'APPROVED';
    return true;
  });

  const pendingCount = approvals.filter(a => (a.status || a.decision_status || '').toUpperCase() === 'PENDING').length;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Governance Approval Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Multi-tier discount governance workflows and risk routing (Neeraj's Domain)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={fetchApprovals} className="btn btn-secondary btn-sm" title="Reload Approvals">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`btn btn-sm ${filter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending Action ({pendingCount})
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

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-border)', color: '#f87171', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading governance approval queue...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Requested By</th>
                <th>Quote Total</th>
                <th>Blended Risk Score</th>
                <th>Routing Tier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No approval requests match current filter.
                  </td>
                </tr>
              ) : (
                filtered.map(app => {
                  const risk = Number(app.blendedRiskScore || app.blended_risk_score || 0);
                  const riskVariant = risk >= 70 ? 'danger' : risk >= 30 ? 'warning' : 'success';
                  const status = app.status || app.decision_status || 'PENDING';
                  const route = app.approvalRoute || app.route || (risk >= 70 ? 'Sequential Two-Level' : risk >= 30 ? 'Sales Manager' : 'Auto-Approved');

                  return (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/approvals/${app.id}`} style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                          {app.quoteNumber || app.quote_number || app.quotation_id}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{app.customerName || app.customer_name || 'Customer'}</div>
                      </td>
                      <td>{app.requestedBy || app.requested_by || 'Sales Rep'}</td>
                      <td style={{ fontWeight: 600 }}>${Number(app.totalValue || app.total_value || 0).toLocaleString()}</td>
                      <td>
                        <Badge label={`Risk: ${risk}/100`} variant={riskVariant} />
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {route}
                      </td>
                      <td>
                        <Badge
                          label={status}
                          variant={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning'}
                        />
                      </td>
                      <td>
                        <Link to={`/approvals/${app.id}`} className="btn btn-secondary btn-sm">
                          Review <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
