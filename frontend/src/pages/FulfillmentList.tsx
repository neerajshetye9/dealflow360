
import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Box, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export const FulfillmentList: React.FC = () => {
  const warehouses = [
    { name: 'Austin Central Facility', code: 'WH-ATX-01', location: 'Austin, TX', transitCost: 12.50, available: 450, reserved: 80 },
    { name: 'Seattle West Terminal', code: 'WH-SEA-02', location: 'Seattle, WA', transitCost: 18.00, available: 320, reserved: 45 },
    { name: 'Frankfurt European Hub', code: 'WH-FRA-01', location: 'Frankfurt, DE', transitCost: 35.00, available: 190, reserved: 20 }
  ];

  const orders = [
    {
      id: 'fo-001',
      orderNumber: 'FO-2026-001',
      quoteNumber: 'QT-2026-001',
      customer: 'Acme Global Enterprises',
      itemsCount: 3,
      status: 'ALLOCATED',
      splitType: 'Single Warehouse (Austin)',
      createdAt: '2026-09-04 17:00'
    },
    {
      id: 'fo-002',
      orderNumber: 'FO-2026-002',
      quoteNumber: 'QT-2026-002',
      customer: 'Nexus Cloud Systems',
      itemsCount: 5,
      status: 'PENDING_ALLOCATION',
      splitType: 'Requires Split (Austin + Seattle)',
      createdAt: '2026-09-05 10:15'
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Multi-Warehouse Inventory & Fulfillment</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Multi-node stock allocation, transit cost optimization, and backorders (Vignesh's Domain)
          </p>
        </div>
      </div>

      {/* Warehouses Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
        Active Warehouse Distribution Hubs (Rule 16 & 17)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {warehouses.map((wh, idx) => (
          <div key={idx} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{wh.code}</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>{wh.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{wh.location}</p>
              </div>
              <Badge label={`$${wh.transitCost.toFixed(2)}/unit`} variant="info" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{wh.available}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reserved</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{wh.reserved}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Awaiting Fulfillment */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Fulfillment Orders Queue
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Quote Reference</th>
                <th>Customer</th>
                <th>Total Items</th>
                <th>Allocation Strategy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/fulfillment/${o.id}`} style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>{o.quoteNumber}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{o.customer}</td>
                  <td>{o.itemsCount} lines</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.splitType}</td>
                  <td>
                    <Badge 
                      label={o.status.replace('_', ' ')} 
                      variant={o.status === 'ALLOCATED' ? 'success' : 'warning'} 
                    />
                  </td>
                  <td>
                    <Link to={`/fulfillment/${o.id}`} className="btn btn-secondary btn-sm">
                      Inspect Split <ArrowUpRight size={14} />
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
