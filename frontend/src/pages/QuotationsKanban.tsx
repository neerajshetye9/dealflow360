
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List, ArrowRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export const QuotationsKanban: React.FC = () => {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');

  const columns = [
    {
      id: 'DRAFT',
      title: 'Draft',
      cards: [
        { id: 'q-101', number: 'QT-2026-101', customer: 'Apex Logistics', value: 34000, margin: 41, risk: 15 },
        { id: 'q-102', number: 'QT-2026-102', customer: 'BioTech Labs', value: 18500, margin: 28, risk: 25 }
      ]
    },
    {
      id: 'PENDING_APPROVAL',
      title: 'Pending Approval',
      cards: [
        { id: 'q0000000-0000-0000-0000-000000000001', number: 'QT-2026-001', customer: 'Acme Global Enterprises', value: 54000, margin: 38, risk: 78 }
      ]
    },
    {
      id: 'APPROVED',
      title: 'Approved',
      cards: [
        { id: 'q-103', number: 'QT-2026-103', customer: 'Quantum Dynamics', value: 89000, margin: 36, risk: 40 }
      ]
    },
    {
      id: 'CUSTOMER_REVIEW',
      title: 'Customer Review',
      cards: [
        { id: 'q0000000-0000-0000-0000-000000000002', number: 'QT-2026-002', customer: 'Nexus Cloud Systems', value: 28500, margin: 29, risk: 45 }
      ]
    },
    {
      id: 'CONFIRMED',
      title: 'Confirmed / Won',
      cards: [
        { id: 'q0000000-0000-0000-0000-000000000003', number: 'QT-2026-003', customer: 'Starlight Retailers', value: 12000, margin: 42, risk: 12 }
      ]
    }
  ];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Quotations Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Track deals across 5 pipeline stages with live risk & margin scoring
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

      {viewMode === 'KANBAN' ? (
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
                {col.cards.map(card => {
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
                })}
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
              {columns.flatMap(c => c.cards.map(card => (
                <tr key={card.id}>
                  <td><Link to={`/quotations/${card.id}`} style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{card.number}</Link></td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{card.customer}</td>
                  <td><Badge label={c.title} variant="info" /></td>
                  <td style={{ fontWeight: 700 }}>${card.value.toLocaleString()}</td>
                  <td><Badge label={`${card.margin}%`} variant={card.margin >= 35 ? 'success' : 'warning'} /></td>
                  <td><Badge label={`${card.risk}/100`} variant={card.risk >= 70 ? 'danger' : 'warning'} /></td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
