
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, Send, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';
import { Badge } from '../components/Badge';

export const QuotationDetail: React.FC = () => {
  const { id } = useParams();
  const [submitted, setSubmitted] = useState(false);

  const [lines, setLines] = useState([
    {
      productId: 'p1',
      name: 'Enterprise Server Rack X-500',
      category: 'Hardware',
      categoryCeiling: 15,
      tierCeiling: 25,
      effectiveCeiling: 15, // Rule 4: MIN
      qty: 2,
      unitPrice: 20000,
      unitCost: 11000,
      discount: 28, // Over ceiling!
      netPrice: 28800
    },
    {
      productId: 'p2',
      name: 'DealFlow Platform SaaS (Annual)',
      category: 'SaaS',
      categoryCeiling: 30,
      tierCeiling: 25,
      effectiveCeiling: 25,
      qty: 25,
      unitPrice: 1020,
      unitCost: 140,
      discount: 15,
      netPrice: 21675
    }
  ]);

  // Dynamic Gross Margin calculation (Rule 12): ((Net Selling Price - Unit Cost) / Net Selling Price) * 100
  const computeLineMargin = (unitCost: number, netPrice: number, qty: number) => {
    const totalCost = unitCost * qty;
    if (netPrice <= 0) return 0;
    return Math.round(((netPrice - totalCost) / netPrice) * 100);
  };

  const totalNet = lines.reduce((acc, l) => acc + l.netPrice, 0);
  const totalCost = lines.reduce((acc, l) => acc + (l.unitCost * l.qty), 0);
  const overallMargin = Math.round(((totalNet - totalCost) / totalNet) * 100);

  // Recommendations with +20% Promo boost (Rule 13) and 20% Margin Floor protection (Rule 15)
  const recommendations = [
    {
      id: 'rec-1',
      productName: 'Dedicated 24/7 TAM Support',
      affinityScore: 0.94,
      promoBoost: '+20% Promotion Bonus',
      price: 6000,
      unitCost: 2000,
      marginImpact: '+2.4% overall margin'
    },
    {
      id: 'rec-2',
      productName: 'Redundant Power Supply Unit',
      affinityScore: 0.88,
      promoBoost: 'Catalog Co-Purchase',
      price: 1200,
      unitCost: 450,
      marginImpact: '+0.8% overall margin'
    }
  ];

  const handleAddRec = (rec: any) => {
    const net = rec.price * 0.9;
    setLines([...lines, {
      productId: rec.id,
      name: rec.productName,
      category: 'Hardware',
      categoryCeiling: 15,
      tierCeiling: 25,
      effectiveCeiling: 15,
      qty: 1,
      unitPrice: rec.price,
      unitCost: rec.unitCost,
      discount: 10,
      netPrice: net
    }]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/quotations" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Pipeline
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Quotation: {id === 'new' ? 'New Deal Proposal' : 'QT-2026-001 (Rev 2)'}
            </h1>
            <Badge label="PLATINUM CUSTOMER" variant="info" />
            <Badge 
              label={`Overall Margin: ${overallMargin}%`} 
              variant={overallMargin >= 35 ? 'success' : overallMargin >= 20 ? 'warning' : 'danger'} 
            />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Customer: <strong style={{ color: '#fff' }}>Acme Global Enterprises</strong> • Standard Price List (USD)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            Save Draft
          </button>
          <button onClick={handleSubmit} className="btn btn-primary btn-lg">
            <Send size={16} /> Submit for Governance Approval
          </button>
        </div>
      </div>

      {submitted && (
        <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={20} /> Quotation submitted! Risk Score calculated: <strong>78/100</strong>. Routed to Sales Manager & Finance Director.
        </div>
      )}

      {/* Main Quotation Lines Table */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Commercial Line Items</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Rule 12: Margin Thresholds (<span style={{ color: 'var(--success)' }}>Green &gt;=35%</span>, <span style={{ color: 'var(--warning)' }}>Amber 20-34%</span>, <span style={{ color: 'var(--danger)' }}>Red &lt;20%</span>)
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Category</th>
                <th>Qty</th>
                <th>List Price</th>
                <th>Discount %</th>
                <th>Ceiling [MIN]</th>
                <th>Net Total</th>
                <th>Gross Margin %</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const isOver = line.discount > line.effectiveCeiling;
                const lineMargin = computeLineMargin(line.unitCost, line.netPrice, line.qty);
                const marginVariant = lineMargin >= 35 ? 'success' : lineMargin >= 20 ? 'warning' : 'danger';
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{line.name}</td>
                    <td><Badge label={line.category} variant="info" /></td>
                    <td>{line.qty}</td>
                    <td>${line.unitPrice.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: isOver ? 'var(--danger)' : '#fff' }}>
                        {line.discount}%
                      </span>
                      {isOver && (
                        <span style={{ marginLeft: 6 }}>
                          <Badge label="OVER CEILING" variant="danger" size="sm" />
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{line.effectiveCeiling}%</td>
                    <td style={{ fontWeight: 700 }}>${line.netPrice.toLocaleString()}</td>
                    <td>
                      <Badge label={`${lineMargin}%`} variant={marginVariant} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 24, fontSize: '0.95rem' }}>
          <div>Total List: <strong style={{ color: '#fff' }}>${(lines.reduce((a, b) => a + (b.unitPrice * b.qty), 0)).toLocaleString()}</strong></div>
          <div>Total Net: <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>${totalNet.toLocaleString()}</strong></div>
        </div>
      </div>

      {/* Smart Upsell / Cross-Sell Panel (Rule 13-15) */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Intelligent Upsell & Cross-Sell Suggestions
          </h3>
          <Badge label="+20% PROMOTION MULTIPLIER ACTIVE" variant="success" />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
          Ranked by affinity co-purchase scoring with 20% margin dilution suppression safeguards (Rule 15).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {recommendations.map(rec => (
            <div key={rec.id} className="glass-card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{rec.productName}</span>
                  <Badge label={rec.promoBoost} variant="success" size="sm" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Affinity Score: {(rec.affinityScore * 100).toFixed(0)}% • List: ${rec.price.toLocaleString()} • Margin Impact: {rec.marginImpact}
                </div>
              </div>
              <button onClick={() => handleAddRec(rec)} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add to Quote
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
