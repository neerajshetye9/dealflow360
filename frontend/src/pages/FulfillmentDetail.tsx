
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Truck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/Badge';

export const FulfillmentDetail: React.FC = () => {
  const { id } = useParams();
  const [confirmed, setConfirmed] = useState(false);

  const order = {
    orderNumber: 'FO-2026-001',
    customer: 'Acme Global Enterprises',
    quoteNumber: 'QT-2026-001',
    shippingAddress: '452 Enterprise Way, Austin, TX 78701',
    status: 'OPTIMAL_SPLIT_CALCULATED',
    suggestedPlan: [
      {
        warehouse: 'Austin Central Facility',
        transitCost: 12.50,
        allocatedUnits: 2,
        product: 'Enterprise Server Rack X-500',
        reason: 'Lowest single-warehouse transit cost (Rule 16)'
      }
    ],
    backorders: [
      {
        product: 'High-Density Fiber Patch Panels',
        shortfall: 10,
        expectedArrival: '2026-09-18',
        reason: 'Total inventory across all nodes insufficient (Rule 19)'
      }
    ]
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/fulfillment" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Fulfillment Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Allocation Plan: {order.orderNumber}
            </h1>
            <Badge label="OPTIMAL PLAN COMPUTED" variant="success" />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Customer: <strong style={{ color: '#fff' }}>{order.customer}</strong> • Ship To: {order.shippingAddress}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleConfirm} className="btn btn-primary btn-lg">
            <CheckCircle2 size={18} /> Confirm Allocation & Reserve Stock (Rule 18)
          </button>
        </div>
      </div>

      {confirmed && (
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={20} /> Inventory atomically reserved in Austin Central Facility. Shipment manifest generated.
        </div>
      )}

      {/* Suggested Allocation Table */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Optimal Warehouse Split Allocation
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Origin Warehouse</th>
                <th>Allocated Units</th>
                <th>Transit Cost / Unit</th>
                <th>Optimization Rationale</th>
              </tr>
            </thead>
            <tbody>
              {order.suggestedPlan.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{p.product}</td>
                  <td>{p.warehouse}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{p.allocatedUnits} units</td>
                  <td>${p.transitCost.toFixed(2)}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backorders Section (Rule 19) */}
      {order.backorders.length > 0 && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={20} color="var(--warning)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Backorder Shortfall Manifest (Rule 19)
            </h3>
            <Badge label="INSUFFICIENT STOCK SHORTFALL" variant="warning" />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Shortfall Quantity</th>
                  <th>Estimated Factory Arrival</th>
                  <th>Shortfall Note</th>
                </tr>
              </thead>
              <tbody>
                {order.backorders.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{b.product}</td>
                    <td><Badge label={`${b.shortfall} Units`} variant="danger" /></td>
                    <td>{b.expectedArrival}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
