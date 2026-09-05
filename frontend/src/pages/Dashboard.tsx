
import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldAlert, TrendingUp, ArrowUpRight, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const Dashboard: React.FC = () => {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Welcome Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Executive Sales Workspace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
            Real-time quotation pipeline, discount risk telemetry, and health alerts (Atharva's Domain)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/quotations/new" className="btn btn-primary btn-lg">
            + Create New Quotation
          </Link>
        </div>
      </div>

      {/* 3 Primary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Active Quotations"
          value="$1,248,500"
          subtext="24 deals currently in pipeline"
          trend={{ value: "14.2% vs last mo", positive: true }}
          icon={<DollarSign size={22} />}
        />
        <StatCard
          title="Pending Governance Approvals"
          value="5 Deals"
          subtext="2 requiring Finance Director signoff"
          trend={{ value: "Avg 4.2 hr turnaround", positive: true }}
          icon={<Clock size={22} />}
        />
        <StatCard
          title="At-Risk Deal Alerts"
          value="3 Flagged"
          subtext="2 stalled >14d, 1 discount anomaly"
          trend={{ value: "Action required", positive: false }}
          icon={<ShieldAlert size={22} color="var(--danger)" />}
        />
      </div>

      {/* Main Grid: Pipeline Velocity & Recent Deals */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Active Pipeline Records */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Priority Quotations Pipeline</h3>
            <Link to="/quotations" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              Open Kanban <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Value</th>
                  <th>Blended Margin</th>
                  <th>Risk Score</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Link to="/quotations/q0000000-0000-0000-0000-000000000001" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>QT-2026-001</Link></td>
                  <td>Acme Global Enterprises</td>
                  <td style={{ fontWeight: 600 }}>$54,000</td>
                  <td><Badge label="38.5% (High)" variant="success" /></td>
                  <td><Badge label="78 / High" variant="danger" /></td>
                  <td><Badge label="Pending Approval" variant="warning" /></td>
                </tr>
                <tr>
                  <td><Link to="/quotations/q0000000-0000-0000-0000-000000000002" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>QT-2026-002</Link></td>
                  <td>Nexus Cloud Systems</td>
                  <td style={{ fontWeight: 600 }}>$28,500</td>
                  <td><Badge label="29.0% (Fair)" variant="warning" /></td>
                  <td><Badge label="45 / Med" variant="warning" /></td>
                  <td><Badge label="Customer Review" variant="info" /></td>
                </tr>
                <tr>
                  <td><Link to="/quotations/q0000000-0000-0000-0000-000000000003" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>QT-2026-003</Link></td>
                  <td>Starlight Retailers</td>
                  <td style={{ fontWeight: 600 }}>$12,000</td>
                  <td><Badge label="42.1% (High)" variant="success" /></td>
                  <td><Badge label="12 / Low" variant="success" /></td>
                  <td><Badge label="Accepted" variant="success" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>Live Governance Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Atharva Shirke</span>
                <span>10m ago</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: 4 }}>
                Approved Sales Manager stage for <strong>QT-2026-001</strong>. Routed to Finance Director.
              </p>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--danger)' }}>
                <span>Deal Health Bot</span>
                <span>1h ago</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: 4 }}>
                Flagged <strong>QT-2026-004</strong>: 16 days inactivity in Draft stage.
              </p>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--success-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--success)' }}>
                <span>Fulfillment Engine</span>
                <span>2h ago</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: 4 }}>
                Multi-warehouse split allocated for <strong>FO-2026-081</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
