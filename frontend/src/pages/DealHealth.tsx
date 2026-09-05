
import React, { useState } from 'react';
import { Activity, Bell, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const DealHealth: React.FC = () => {
  const [nudged, setNudged] = useState<string | null>(null);

  const alerts = [
    {
      id: 'dh-1',
      quoteNumber: 'QT-2026-004',
      customer: 'Apex Global Logistics',
      salesRep: 'Neeraj Shetye',
      type: 'STALLED_DEAL',
      daysInactive: 16,
      severity: 'HIGH',
      description: 'Quote has remained in Draft status without customer touchpoint for >14 days (Rule 27).'
    },
    {
      id: 'dh-2',
      quoteNumber: 'QT-2026-005',
      customer: 'BioTech Labs',
      salesRep: 'Neeraj Shetye',
      type: 'DISCOUNT_ANOMALY',
      daysInactive: 4,
      severity: 'MEDIUM',
      description: 'Requested discount (27%) deviates by >1.5 standard deviations from rep 90-day rolling baseline (Rule 28).'
    }
  ];

  const handleNudge = (id: string) => {
    setNudged(id);
    setTimeout(() => setNudged(null), 3000);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Deal Health Monitor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Automated inactivity detection, discount anomaly tracking, and pipeline velocity audits (Atharva's Domain)
          </p>
        </div>
      </div>

      {nudged && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} /> Automated nudge notification dispatched to sales rep.
        </div>
      )}

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Stalled Deals (>14d)"
          value="2 Deals"
          subtext="$72,000 pipeline value"
          icon={<AlertTriangle size={22} color="var(--warning)" />}
        />
        <StatCard
          title="Discount Anomalies (>1.5σ)"
          value="1 Deal"
          subtext="Excessive discount vs rep baseline"
          icon={<ShieldAlert size={22} color="var(--danger)" />}
        />
        <StatCard
          title="Slippage Risk"
          value="1 Deal"
          subtext="Expected close date passed"
          icon={<Activity size={22} color="var(--accent-cyan)" />}
        />
      </div>

      {/* Flagged Deals Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Active Deal Alerts & Escalations
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Customer</th>
                <th>Assigned Rep</th>
                <th>Alert Type</th>
                <th>Inactivity</th>
                <th>Severity</th>
                <th>Audit Finding</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{a.quoteNumber}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{a.customer}</td>
                  <td>{a.salesRep}</td>
                  <td><Badge label={a.type.replace('_', ' ')} variant="warning" /></td>
                  <td>{a.daysInactive} days</td>
                  <td><Badge label={a.severity} variant={a.severity === 'HIGH' ? 'danger' : 'warning'} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.description}</td>
                  <td>
                    <button onClick={() => handleNudge(a.id)} className="btn btn-secondary btn-sm">
                      <Bell size={13} /> Nudge Rep
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
