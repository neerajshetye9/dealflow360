import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { api } from '../api';

export const QuotationsKanban: React.FC = () => {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listQuotations();
      setQuotations(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Standard pipeline columns
  const columnConfigs = [
    { id: 'Draft', title: 'Draft', statuses: ['DRAFT'] },
    { id: 'Under Review', title: 'Pending Approval', statuses: ['UNDER_REVIEW', 'PENDING_APPROVAL'] },
    { id: 'Approved', title: 'Approved', statuses: ['APPROVED'] },
    { id: 'Sent to Customer', title: 'Customer Review', statuses: ['SENT_TO_CUSTOMER', 'CUSTOMER_REVIEW', 'UNDER_NEGOTIATION'] },
    { id: 'Confirmed', title: 'Confirmed / Won', statuses: ['CONFIRMED', 'FULFILLED', 'BILLED'] }
  ];

  const columns = columnConfigs.map(col => {
    const cards = quotations.filter(q => {
      const stage = (q.stageName || q.approval_status || '').toUpperCase();
      const appStatus = (q.approval_status || '').toUpperCase();
      return col.statuses.some(s => stage.includes(s) || appStatus === s);
    }).map(q => ({
      id: q.id,
      number: q.quote_number || q.id,
      customer: q.customerCompanyName || q.customerContactName || 'Customer',
      value: Number(q.total_amount || 0),
      margin: Math.round(Number(q.margin_percent || 0)),
      risk: Number(q.blended_risk_score || 0),
      stageName: q.stageName || q.approval_status
    }));

    return {
      ...col,
      cards
    };
  });

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Quotations Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Track deals across 5 pipeline stages with live risk & margin scoring (Backend API Connected)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={fetchQuotations} className="btn btn-secondary btn-sm" title="Reload Pipeline Data">
            <RefreshCw size={14} /> Reload Data
          </button>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, padding: 2 }}>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`btn btn-sm ${viewMode === 'KANBAN' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              <LayoutGrid size={15} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`btn btn-sm ${viewMode === 'TABLE' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              <List size={15} /> Table
            </button>
          </div>

          <Link to="/quotations/new" className="btn btn-primary">
            <Plus size={16} /> New Quotation
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-border)', color: '#f87171', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading active deal pipeline...
        </div>
      ) : viewMode === 'KANBAN' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}>
          {columns.map(col => (
            <div key={col.id} style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              padding: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{col.title}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)'
                }}>
                  {col.cards.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.cards.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    No quotes in this stage
                  </div>
                ) : (
                  col.cards.map(card => {
                    const riskVariant = card.risk >= 70 ? 'danger' : card.risk >= 30 ? 'warning' : 'success';
                    const marginVariant = card.margin >= 35 ? 'success' : card.margin >= 20 ? 'warning' : 'danger';
                    return (
                      <Link
                        key={card.id}
                        to={`/quotations/${card.id}`}
                        className="glass-card"
                        style={{ padding: 14, display: 'block' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{card.number}</span>
                          <Badge label={`R: ${card.risk}`} variant={riskVariant} size="sm" />
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: 8 }}>{card.customer}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 700, color: '#fff' }}>${card.value.toLocaleString()}</span>
                          <Badge label={`${card.margin}% Mgn`} variant={marginVariant} size="sm" />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Gross Margin</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No quotations found in database.
                  </td>
                </tr>
              ) : (
                quotations.map(card => {
                  const val = Number(card.total_amount || 0);
                  const margin = Math.round(Number(card.margin_percent || 0));
                  const risk = Number(card.blended_risk_score || 0);
                  return (
                    <tr key={card.id}>
                      <td><Link to={`/quotations/${card.id}`} style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{card.quote_number || card.id}</Link></td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{card.customerCompanyName || card.customerContactName || 'Customer'}</td>
                      <td><Badge label={card.stageName || card.approval_status} variant="info" /></td>
                      <td style={{ fontWeight: 700 }}>${val.toLocaleString()}</td>
                      <td><Badge label={`${margin}%`} variant={margin >= 35 ? 'success' : 'warning'} /></td>
                      <td><Badge label={`${risk}/100`} variant={risk >= 70 ? 'danger' : 'warning'} /></td>
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
