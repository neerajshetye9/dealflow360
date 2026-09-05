import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, Send, ShieldAlert, CheckCircle2, Trash2, X, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { api } from '../api';

export const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(new Set());

  // Interactive Add Line Form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newDiscount, setNewDiscount] = useState(0);

  // Status message
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Load products catalog
      const prods = await api.getProducts();
      setCatalogProducts(prods || []);

      if (!isNew && id) {
        const data = await api.getQuotation(id);
        setQuotation(data.quotation);
        setCustomer(data.customer);
        setLines(data.lines || []);

        try {
          const recs = await api.getRecommendations(id);
          setRecommendations(recs || []);
        } catch (e) {
          setRecommendations([]);
        }
      } else {
        // Mock default state for "new" until saved
        setQuotation({
          id: 'new',
          quote_number: 'QT-2026-NEW',
          total_amount: 0,
          margin_percent: 0,
          blended_risk_score: 0,
          approval_status: 'DRAFT',
        });
        setCustomer({ name: 'Acme Global Enterprises', company_name: 'Acme Global' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddLineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !id || isNew) return;
    try {
      setErrorMsg(null);
      await api.addLineItem(id, selectedProductId, Number(newQty), Number(newDiscount));
      setSelectedProductId('');
      setNewQty(1);
      setNewDiscount(0);
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add product line');
    }
  };

  const handleUpdateLine = async (lineId: string, qty: number, discount: number) => {
    try {
      setErrorMsg(null);
      await api.updateLineItem(lineId, qty, discount);
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update line item');
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    try {
      setErrorMsg(null);
      await api.deleteLineItem(lineId);
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete line item');
    }
  };

  const handleAddRecommendation = async (productId: string) => {
    if (!id || isNew) return;
    try {
      setErrorMsg(null);
      await api.acceptRecommendation(id, productId);
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept recommendation');
    }
  };

  const handleDismissRec = (productId: string) => {
    setDismissedRecs(prev => new Set(prev).add(productId));
  };

  const handleSubmitQuotation = async () => {
    if (!id || isNew) return;
    try {
      setErrorMsg(null);
      const res = await api.submitQuotation(id);
      setSubmitResult(res);
      await fetchDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quotation');
    }
  };

  const computeLineMargin = (unitCost: number, lineTotal: number, qty: number) => {
    const totalCost = unitCost * qty;
    if (lineTotal <= 0) return 0;
    return Math.round(((lineTotal - totalCost) / lineTotal) * 100);
  };

  const overallMargin = quotation ? Math.round(Number(quotation.margin_percent || 0)) : 0;
  const blendedRiskScore = quotation ? Number(quotation.blended_risk_score || 0) : 0;
  const totalNet = quotation ? Number(quotation.total_amount || 0) : 0;

  const activeRecs = recommendations.filter(r => !dismissedRecs.has(r.productId));

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link to="/quotations" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Pipeline
        </Link>
        <button onClick={fetchDetails} className="btn btn-secondary btn-sm" title="Reload live data">
          <RefreshCw size={14} /> Refresh Live Data
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-border)', color: '#f87171', marginBottom: 20 }}>
          {errorMsg}
        </div>
      )}

      {submitResult && (
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={20} /> Quotation submitted! Approval Route: <strong>{submitResult.approvalRoute || 'UNDER_REVIEW'}</strong>.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Quotation: {quotation?.quote_number || (isNew ? 'New Deal Proposal' : id)}
            </h1>
            <Badge label={quotation?.approval_status || 'DRAFT'} variant="info" />
            <Badge 
              label={`Overall Margin: ${overallMargin}%`} 
              variant={overallMargin >= 35 ? 'success' : overallMargin >= 20 ? 'warning' : 'danger'} 
            />
            <Badge 
              label={`Risk Score: ${blendedRiskScore}/100`} 
              variant={blendedRiskScore >= 70 ? 'danger' : blendedRiskScore >= 30 ? 'warning' : 'success'} 
            />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Customer: <strong style={{ color: '#fff' }}>{customer?.company_name || customer?.name || 'Enterprise Account'}</strong> • Live Governance Engine Connected
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleSubmitQuotation} disabled={isNew || lines.length === 0} className="btn btn-primary btn-lg">
            <Send size={16} /> Submit for Governance Approval
          </button>
        </div>
      </div>

      {/* Main Quotation Lines Table */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Commercial Line Items</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Rule 12: Margin Thresholds (<span style={{ color: 'var(--success)' }}>Green &gt;=35%</span>, <span style={{ color: 'var(--warning)' }}>Amber 20-34%</span>, <span style={{ color: 'var(--danger)' }}>Red &lt;20%</span>)
          </span>
        </div>

        {/* Add Product Line Form */}
        {!isNew && (
          <form onSubmit={handleAddLineSubmit} style={{ display: 'flex', gap: 12, marginBottom: 20, background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              style={{ flex: 2, padding: '8px 12px', borderRadius: 6, background: '#1e293b', border: '1px solid var(--border-subtle)', color: '#fff' }}
              required
            >
              <option value="">Select Product to Add...</option>
              {catalogProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${Number(p.base_price).toLocaleString()}) - {p.category_name || p.category}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={newQty}
              onChange={e => setNewQty(Number(e.target.value))}
              placeholder="Qty"
              style={{ width: 80, padding: '8px 12px', borderRadius: 6, background: '#1e293b', border: '1px solid var(--border-subtle)', color: '#fff' }}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={newDiscount}
              onChange={e => setNewDiscount(Number(e.target.value))}
              placeholder="Disc %"
              style={{ width: 90, padding: '8px 12px', borderRadius: 6, background: '#1e293b', border: '1px solid var(--border-subtle)', color: '#fff' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add Line
            </button>
          </form>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Qty</th>
                <th>List Price</th>
                <th>Discount %</th>
                <th>Net Total</th>
                <th>Gross Margin %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No line items added yet. Use the product selector above to add products.
                  </td>
                </tr>
              ) : (
                lines.map((line) => {
                  const unitPrice = Number(line.unit_price || line.unitPrice);
                  const unitCost = Number(line.unit_cost || line.unitCost);
                  const qty = Number(line.quantity || line.qty);
                  const discount = Number(line.discount_percent || line.discount);
                  const lineTotal = Number(line.line_total || line.netPrice);
                  const lineMargin = computeLineMargin(unitCost, lineTotal, qty);
                  const marginVariant = lineMargin >= 35 ? 'success' : lineMargin >= 20 ? 'warning' : 'danger';

                  return (
                    <tr key={line.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>
                        {line.productName || line.name}
                        {line.is_upsell && <span style={{ marginLeft: 8 }}><Badge label="UPSELL" variant="info" size="sm" /></span>}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => handleUpdateLine(line.id, Number(e.target.value), discount)}
                          style={{ width: 65, padding: '4px 6px', borderRadius: 4, background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff' }}
                        />
                      </td>
                      <td>${unitPrice.toLocaleString()}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discount}
                          onChange={(e) => handleUpdateLine(line.id, qty, Number(e.target.value))}
                          style={{ width: 65, padding: '4px 6px', borderRadius: 4, background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff' }}
                        /> %
                      </td>
                      <td style={{ fontWeight: 700 }}>${lineTotal.toLocaleString()}</td>
                      <td>
                        <Badge label={`${lineMargin}%`} variant={marginVariant} />
                      </td>
                      <td>
                        <button onClick={() => handleDeleteLine(line.id)} className="btn btn-secondary btn-sm" title="Delete Line">
                          <Trash2 size={14} color="#f87171" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 24, fontSize: '0.95rem' }}>
          <div>Total Net Deal Value: <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>${totalNet.toLocaleString()}</strong></div>
        </div>
      </div>

      {/* Smart Upsell / Cross-Sell Panel (Rule 13-15 & testing_framework.md) */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Intelligent Upsell & Cross-Sell Suggestions
          </h3>
          <Badge label="PROMOTION & MARGIN FLOOR SAFEGUARD ACTIVE" variant="success" />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
          Ranked by affinity co-purchase scoring with 20% margin dilution suppression safeguards (Rule 15).
        </p>

        {activeRecs.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
            No additional high-margin recommendations available for current product combination.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {activeRecs.map(rec => (
              <div key={rec.productId} className="glass-card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{rec.name}</span>
                    {rec.hasActivePromotion && <Badge label={`+${((rec.promotionBonusMultiplier - 1) * 100).toFixed(0)}% Promo`} variant="success" size="sm" />}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Score: {rec.calculatedScore} • Price: ${Number(rec.basePrice).toLocaleString()} • Margin Impact: {rec.projectedMarginImpact > 0 ? `+${rec.projectedMarginImpact}%` : `${rec.projectedMarginImpact}%`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleAddRecommendation(rec.productId)} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add to Quote
                  </button>
                  <button onClick={() => handleDismissRec(rec.productId)} className="btn btn-secondary btn-sm" title="Dismiss Recommendation">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
