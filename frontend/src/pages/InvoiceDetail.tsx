
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Download, DollarSign } from 'lucide-react';
import { Badge } from '../components/Badge';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const [paid, setPaid] = useState(false);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/invoices" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Invoices
      </Link>

      <div className="glass-panel" style={{ padding: 36, borderRadius: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 24, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Invoice: {id || 'INV-2026-001'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Billed to: <strong>Acme Global Enterprises</strong>
            </p>
          </div>
          <Badge label={paid ? 'PAID IN FULL' : 'ISSUED'} variant={paid ? 'success' : 'info'} />
        </div>

        {/* Section 1: One-Time Charges */}
        <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: 12 }}>
          Section 1: One-Time Hardware & Delivery Charges
        </h4>
        <div className="table-container" style={{ marginBottom: 24 }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Net Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Enterprise Server Rack X-500</td>
                <td>2</td>
                <td>$16,000</td>
                <td>$32,000</td>
              </tr>
              <tr>
                <td>Cloud Deployment Pro Services</td>
                <td>1</td>
                <td>$12,750</td>
                <td>$12,750</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Recurring Subscription */}
        <h4 style={{ fontSize: '0.9rem', color: '#34d399', textTransform: 'uppercase', marginBottom: 12 }}>
          Section 2: Recurring Subscription Charges
        </h4>
        <div className="table-container" style={{ marginBottom: 24 }}>
          <table>
            <thead>
              <tr>
                <th>Plan Description</th>
                <th>Seats</th>
                <th>Monthly Rate</th>
                <th>Net Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DealFlow Platform SaaS - Enterprise (Sep 2026)</td>
                <td>25</td>
                <td>$85/seat</td>
                <td>$2,125</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginBottom: 24, fontSize: '1.2rem', fontWeight: 700 }}>
          Total Due: ${paid ? '0.00' : '46,875.00'}
        </div>

        {!paid && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setPaid(true)} className="btn btn-primary btn-lg">
              <CreditCard size={18} /> Record Full Payment (Rule 26)
            </button>
            <button className="btn btn-secondary btn-lg">
              <Download size={18} /> Download PDF
            </button>
          </div>
        )}

        {paid && (
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} /> Payment recorded successfully. Invoice transitioned to PAID state.
          </div>
        )}
      </div>
    </div>
  );
};
