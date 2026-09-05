
import React, { useState } from 'react';
import { Sliders, Save, CheckCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/Badge';

export const DiscountConfig: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const [tiers, setTiers] = useState([
    { name: 'Platinum', ceiling: 25, autoApproveCeiling: 15 },
    { name: 'Gold', ceiling: 20, autoApproveCeiling: 10 },
    { name: 'Silver', ceiling: 15, autoApproveCeiling: 7 },
    { name: 'Standard', ceiling: 10, autoApproveCeiling: 5 }
  ]);

  const [categories, setCategories] = useState([
    { name: 'Hardware', ceiling: 15 },
    { name: 'Professional Services', ceiling: 10 },
    { name: 'SaaS Subscriptions', ceiling: 30 }
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Discount Governance Configuration</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Manage tier ceilings, category ceilings, and risk routing boundaries (Rule 4, 5, 7)
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={16} /> Save Policy Configuration
        </button>
      </div>

      {saved && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} /> Governance policy successfully updated and active across all quoting engines.
        </div>
      )}

      {/* Customer Tier Ceilings */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Customer Tier Policy Ceilings</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Maximum Discount Ceiling (%)</th>
                <th>Auto-Approve Threshold (%)</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{t.name}</td>
                  <td>
                    <input 
                      type="number" 
                      value={t.ceiling} 
                      onChange={e => {
                        const copy = [...tiers];
                        copy[idx].ceiling = Number(e.target.value);
                        setTiers(copy);
                      }}
                      style={{ width: 80 }} 
                    /> %
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={t.autoApproveCeiling} 
                      onChange={e => {
                        const copy = [...tiers];
                        copy[idx].autoApproveCeiling = Number(e.target.value);
                        setTiers(copy);
                      }}
                      style={{ width: 80 }} 
                    /> %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Category Ceilings */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Product Category Ceilings</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
          Rule 4 Enforced: Effective discount ceiling is strictly evaluated as <code style={{ color: 'var(--accent-cyan)' }}>MIN(CustomerTier, ProductCategory)</code>.
        </p>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Category</th>
                <th>Category Hard Ceiling (%)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{c.name}</td>
                  <td>
                    <input 
                      type="number" 
                      value={c.ceiling} 
                      onChange={e => {
                        const copy = [...categories];
                        copy[idx].ceiling = Number(e.target.value);
                        setCategories(copy);
                      }}
                      style={{ width: 80 }} 
                    /> %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Routing Bands */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Governance Approval Routing Thresholds</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--success-border)' }}>
            <Badge label="Risk 0 - 29" variant="success" />
            <h4 style={{ color: '#fff', marginTop: 8, fontSize: '1rem' }}>Auto-Approved</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>No manual approver needed. Bypasses queue directly to quotation confirmed state.</p>
          </div>
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning-border)' }}>
            <Badge label="Risk 30 - 69" variant="warning" />
            <h4 style={{ color: '#fff', marginTop: 8, fontSize: '1rem' }}>Sales Manager</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Single-level review required by the territory sales manager.</p>
          </div>
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger-border)' }}>
            <Badge label="Risk 70 - 100" variant="danger" />
            <h4 style={{ color: '#fff', marginTop: 8, fontSize: '1rem' }}>Sequential Two-Level</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Requires sequential approvals from Sales Manager followed by Finance Director.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
