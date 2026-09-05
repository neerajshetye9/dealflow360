
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Send, MessageSquare, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/Badge';

export const CustomerPortal: React.FC = () => {
  const { token } = useParams();
  const [counterDiscount, setCounterDiscount] = useState(24);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const quote = {
    quoteNumber: 'QT-2026-001',
    customer: 'Acme Global Enterprises',
    currentTotal: 54000,
    items: [
      { name: 'Enterprise Server Rack X-500', qty: 2, listPrice: 20000, offDiscount: 20, netPrice: 32000 },
      { name: 'Cloud Deployment Pro Services', qty: 1, listPrice: 15000, offDiscount: 15, netPrice: 12750 },
      { name: '24/7 Enterprise Support SLA', qty: 1, listPrice: 10000, offDiscount: 10, netPrice: 9000 }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Customer Portal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CUSTOMER NEGOTIATION PORTAL
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4 }}>
              Proposal Review: {quote.quoteNumber}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Prepared for {quote.customer}</p>
          </div>
          <Badge label="Active Proposal" variant="info" />
        </div>

        {/* Warning Banner */}
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid var(--warning-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 28
        }}>
          <ShieldAlert size={22} color="var(--warning)" />
          <span style={{ fontSize: '0.875rem', color: '#fbbf24' }}>
            <strong>Governance Notice:</strong> Counter-proposals exceeding standard policy ceilings will automatically route for executive re-approval.
          </span>
        </div>

        {/* Quote Items */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Offered Quotation Breakdown</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product / Solution</th>
                  <th>Quantity</th>
                  <th>List Price</th>
                  <th>Offered Discount</th>
                  <th>Net Price</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{it.name}</td>
                    <td>{it.qty}</td>
                    <td>${it.listPrice.toLocaleString()}</td>
                    <td><Badge label={`${it.offDiscount}%`} variant="success" /></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>${it.netPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Counter Negotiation Card */}
        <div className="glass-panel" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Submit Counter-Proposal</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            Propose revised commercial terms directly to your DealFlow360 account executive.
          </p>

          {submitted ? (
            <div style={{ padding: 20, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', textAlign: 'center' }}>
              <CheckCircle size={36} style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Counter Proposal Submitted</h4>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Your proposal has been routed to the sales operations team.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Proposed Blended Discount: {counterDiscount}%</label>
                  <span style={{ fontSize: '0.8rem', color: counterDiscount > 20 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {counterDiscount > 20 ? 'Requires Re-Approval' : 'Standard Band'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={counterDiscount}
                  onChange={e => setCounterDiscount(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>Comments & Justification</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="e.g., We are willing to sign a 3-year agreement if you can provide a 24% discount..."
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-lg">
                  <Send size={16} /> Submit Counter-Proposal
                </button>
                <button type="button" className="btn btn-success btn-lg">
                  <CheckCircle size={16} /> Accept Current Offer (${quote.currentTotal.toLocaleString()})
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
