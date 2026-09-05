import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { api } from '../api';

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchApprovalDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      // Fetch approvals list and find this one, or fetch individual
      const allApprovals = await api.listApprovals();
      const found = (allApprovals || []).find((a: any) => a.id === id);
      if (found) {
        setApproval(found);
        setSteps(found.steps || []);
        setViolations(found.violations || []);
      } else {
        setErrorMsg(`Approval step ${id} not found in queue.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load approval details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalDetail();
  }, [id]);

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'RETURN_FOR_REVISION') => {
    if (!id) return;
    try {
      setErrorMsg(null);
      await api.actOnApproval(id, action, comment);
      setActionResult(action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'RETURNED');
      await fetchApprovalDetail();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit approval decision');
    }
  };

  const risk = Number(approval?.blendedRiskScore || approval?.blended_risk_score || 0);
  const riskVariant = risk >= 70 ? 'danger' : risk >= 30 ? 'warning' : 'success';
  const quoteNumber = approval?.quoteNumber || approval?.quote_number || id;
  const customerName = approval?.customerName || approval?.customer_name || 'Customer';
  const requestedBy = approval?.requestedBy || approval?.requested_by || 'Sales Rep';
  const totalValue = Number(approval?.totalValue || approval?.total_value || 0);
  const marginPercent = Number(approval?.marginPercent || approval?.margin_percent || 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link to="/approvals" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Approvals
        </Link>
        <button onClick={fetchApprovalDetail} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-border)', color: '#f87171', marginBottom: 20 }}>
          {errorMsg}
        </div>
      )}

      {actionResult && (
        <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', fontWeight: 600, marginBottom: 20 }}>
          Decision Recorded: {actionResult}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading approval details...</div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                  Approval Review: {quoteNumber}
                </h1>
                <Badge label={`Risk ${risk}/100`} variant={riskVariant} />
                {marginPercent > 0 && (
                  <Badge
                    label={`Margin: ${Math.round(marginPercent)}%`}
                    variant={marginPercent >= 15 ? 'success' : 'danger'}
                  />
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                Customer: <strong style={{ color: '#fff' }}>{customerName}</strong> • Requested by {requestedBy} • Value: ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Stepper Timeline */}
          {steps.length > 0 && (
            <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
                Sequential Approval Pipeline (Rule 7)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`, gap: 16 }}>
                {steps.map((st: any, idx: number) => {
                  const stepStatus = (st.status || st.decision_status || 'PENDING').toUpperCase();
                  const isCompleted = stepStatus === 'COMPLETED' || stepStatus === 'APPROVED';
                  return (
                    <div key={idx} style={{
                      padding: 16,
                      borderRadius: 10,
                      background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid',
                      borderColor: isCompleted ? 'var(--success-border)' : 'var(--accent-primary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {isCompleted ? <CheckCircle2 size={16} color="var(--success)" /> : <Clock size={16} color="var(--accent-cyan)" />}
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{st.name || st.step_label || `Step ${st.step_order || idx + 1}`}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {st.actor || st.decided_by_name || 'Awaiting'} • {st.time || st.decided_at || 'Pending'}
                      </div>
                      {st.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>"{st.note}"</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Violation Breakdown Table */}
          {violations.length > 0 && (
            <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>
                Policy Violation Audit Matrix (Rule 4, 5, 6)
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product Line</th>
                      <th>Effective Ceiling</th>
                      <th>Requested Discount</th>
                      <th>Overage</th>
                      <th>Margin Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((v: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{v.productName || v.product || v.productId}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{v.effectiveCeilingPercent || v.effectiveCeiling}%</td>
                        <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{v.requestedDiscountPercent || v.requestedDiscount}%</td>
                        <td><Badge label={`+${v.overByPoints || v.overage}%`} variant="danger" /></td>
                        <td><Badge label={v.lineRiskContribution ? `Risk: ${v.lineRiskContribution}` : (v.marginImpact || 'High')} variant="warning" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 15% Profit Guardrail Warning */}
          {marginPercent > 0 && marginPercent < 15 && (
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24
            }}>
              <XCircle size={22} color="var(--danger)" />
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>
                <strong>Profit Guardrail Breach:</strong> This quotation's net profit margin ({Math.round(marginPercent)}%) is below the required 15% minimum. Finance review and discount reduction is recommended before approval.
              </span>
            </div>
          )}

          {/* Decision Action Box */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Take Governance Action
            </h3>
            <textarea
              placeholder="Enter reason or negotiation instructions for the sales rep..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              style={{ width: '100%', marginBottom: 16, padding: 12, borderRadius: 8, background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleAction('APPROVE')} className="btn btn-success btn-lg" disabled={!!actionResult}>
                <CheckCircle2 size={18} /> Approve Discount
              </button>
              <button onClick={() => handleAction('RETURN_FOR_REVISION')} className="btn btn-warning btn-lg" disabled={!!actionResult}>
                <RotateCcw size={18} /> Return with Comments
              </button>
              <button onClick={() => handleAction('REJECT')} className="btn btn-danger btn-lg" disabled={!!actionResult}>
                <XCircle size={18} /> Reject
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};