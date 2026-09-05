import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Send, ShieldAlert, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { api } from '../api';

export const CustomerPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [counterDiscount, setCounterDiscount] = useState(15);
  const [comment, setComment] = useState('');
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPortalData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getPortalQuote(token);
      setData(res);
      if (res?.quotation) {
        // Default counter discount slider to average line discount
        const lines = res.lines || [];
        if (lines.length > 0) {
          const avgDisc = lines.reduce((acc: number, l: any) => acc + Number(l.discount_percent || 0), 0) / lines.length;
          setCounterDiscount(Math.round(avgDisc));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load customer quotation proposal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [token]);

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setErrorMsg(null);
      const res = await api.submitCounterProposal(token, Number(counterDiscount), comment);
      setSubmittedResult(res);
      await fetchPortalData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit counter-proposal');
    }
  };

  const handleConfirmQuote = async () => {
    if (!token) return;
    try {
      setErrorMsg(null);
      await api.confirmPortalQuote(token);
      setConfirmed(true);
      await fetchPortalData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to confirm quotation');
    }
  };

  const quote = data?.quotation;
  const customer = data?.customer;
  const lines = data?.lines || [];

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
              Proposal Review: {quote?.quote_number || 'Quotation Proposal'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Prepared for {customer?.company_name || customer?.name || 'Valued Customer'}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Badge label={quote?.approval_status || 'Active Proposal'} variant="info" />
            <button onClick={fetchPortalData} className="btn btn-secondary btn-sm" title="Refresh Proposal">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-border)', color: '#f87171', marginBottom: 24 }}>
            {errorMsg}
          </div>
        )}

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
            <strong>Governance & Profitability Notice:</strong> Counter-proposals exceeding standard policy ceilings or breaching the 15% net profit guardrail will automatically route for executive re-approval.
          </span>
        </div>

        {/* Quote Items */}
        <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Offered Quotation Breakdown</h3>
          {loading ? (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Loading proposal details...</div>
          ) : (
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
                  {lines.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)' }}>No line items in proposal</td></tr>
                  ) : (
                    lines.map((it: any) => (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{it.productName || it.name}</td>
                        <td>{it.quantity || it.qty}</td>
                        <td>${Number(it.unit_price || it.unitPrice).toLocaleString()}</td>
                        <td><Badge label={`${it.discount_percent || it.discount}%`} variant="success" /></td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>${Number(it.line_total || it.netPrice).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Counter Negotiation Card */}
        <div className="glass-panel" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Submit Counter-Proposal</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            Propose revised commercial terms directly to your DealFlow360 account executive.
          </p>

          {confirmed ? (
            <div style={{ padding: 20, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', textAlign: 'center' }}>
              <CheckCircle size={36} style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quotation Confirmed!</h4>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Order has been locked and moved to warehouse fulfillment and billing.</p>
            </div>
          ) : submittedResult ? (
            <div style={{ padding: 20, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', textAlign: 'center' }}>
              <CheckCircle size={36} style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Counter Proposal Submitted</h4>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                {submittedResult.needsReapproval 
                  ? 'Your requested terms exceed standard thresholds and have been routed for executive re-approval.' 
                  : 'Your proposal has been submitted to the sales operations team.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitCounter} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Proposed Blended Discount: {counterDiscount}%</label>
                  <span style={{ fontSize: '0.8rem', color: counterDiscount > 15 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {counterDiscount > 15 ? 'Triggers Executive Re-Approval' : 'Standard Band'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
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
                  placeholder="e.g., We are willing to sign a 3-year agreement if you can provide a 20% discount..."
                  style={{ width: '100%', padding: 12, borderRadius: 8, background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-lg">
                  <Send size={16} /> Submit Counter-Proposal
                </button>
                <button type="button" onClick={handleConfirmQuote} className="btn btn-success btn-lg">
                  <CheckCircle size={16} /> Accept Current Offer (${Number(quote?.total_amount || 0).toLocaleString()})
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
