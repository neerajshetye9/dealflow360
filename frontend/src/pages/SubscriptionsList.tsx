
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight, DollarSign, Calendar, Users } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const SubscriptionsList: React.FC = () => {
  const subscriptions = [
    {
      id: 'sub-001',
      customer: 'Acme Global Enterprises',
      plan: 'DealFlow Platform SaaS - Enterprise',
      seats: 25,
      mrr: 2125,
      cycle: 'ANNUAL',
      status: 'ACTIVE',
      nextBill: '2027-09-01'
    },
    {
      id: 'sub-002',
      customer: 'Nexus Cloud Systems',
      plan: 'DealFlow Platform SaaS - Growth',
      seats: 15,
      mrr: 1275,
      cycle: 'MONTHLY',
      status: 'ACTIVE',
      nextBill: '2026-10-01'
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Hybrid Subscriptions & Recurring MRR</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Active recurring contracts, mid-cycle proration, and schedules (Vignesh's Domain)
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value="$34,800"
          subtext="+8% net new ARR this quarter"
          icon={<DollarSign size={22} />}
        />
        <StatCard
          title="Active Subscriptions"
          value="42 Contracts"
          subtext="98.2% retention rate"
          icon={<FileText size={22} />}
        />
        <StatCard
          title="Total Provisioned Seats"
          value="1,420 Seats"
          subtext="Avg 34 seats per tenant"
          icon={<Users size={22} />}
        />
      </div>

      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Active Subscriptions
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan Name</th>
                <th>Provisioned Seats</th>
                <th>Monthly Recurring (MRR)</th>
                <th>Billing Cadence</th>
                <th>Next Billing Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{s.customer}</td>
                  <td>{s.plan}</td>
                  <td>{s.seats} seats</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>${s.mrr.toLocaleString()}</td>
                  <td><Badge label={s.cycle} variant="info" /></td>
                  <td>{s.nextBill}</td>
                  <td><Badge label={s.status} variant="success" /></td>
                  <td>
                    <Link to={`/subscriptions/${s.id}`} className="btn btn-secondary btn-sm">
                      Manage Seats & Proration <ArrowUpRight size={14} />
                    </Link>
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
