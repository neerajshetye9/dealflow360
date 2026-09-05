
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calculator, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/Badge';

export const BillingDetail: React.FC = () => {
  const { id } = useParams();
  const [currentSeats, setCurrentSeats] = useState(25);
  const [newSeats, setNewSeats] = useState(35);
  const [prorationCalculated, setProrationCalculated] = useState(false);

  // Rule 21 formula: (remainingDays / totalDays) * (newPrice - oldPrice)
  const remainingDays = 20;
  const totalDays = 30;
  const unitRate = 85;
  const oldPrice = currentSeats * unitRate;
  const newPrice = newSeats * unitRate;
  const prorationAmount = Math.round((remainingDays / totalDays) * (newPrice - oldPrice));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/subscriptions" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Subscriptions
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              Subscription Contract: {id || 'sub-001'}
            </h1>
            <Badge label="ACTIVE CONTRACT" variant="success" />
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Customer: <strong style={{ color: '#fff' }}>Acme Global Enterprises</strong> • Enterprise Tier
          </p>
        </div>
      </div>

      {/* Hybrid Separation (Rule 20 & 25) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            Section 1: One-Time Hardware & Services
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: 8 }}>
            $44,750.00
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Server Racks + Pro Services Deployment (Invoiced Upfront)
          </p>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
            Section 2: Recurring Subscription MRR
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: 8 }}>
            $2,125.00 / mo
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            25 SaaS Seats @ $85/seat (Invoiced on 1st of month)
          </p>
        </div>
      </div>

      {/* Proration Adjustment Engine (Rule 21) */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Calculator size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Mid-Cycle Seat Modification & Proration Calculator (Rule 21)
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
          Rule 21: Prorated adjustment is strictly computed as <code style={{ color: 'var(--accent-cyan)' }}>(remainingDays / totalDays) * (newAmount - oldAmount)</code>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Current Seats</label>
            <input type="number" value={currentSeats} disabled style={{ width: '100%', opacity: 0.7 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Requested New Seats</label>
            <input 
              type="number" 
              value={newSeats} 
              onChange={e => setNewSeats(Number(e.target.value))} 
              style={{ width: '100%' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Prorated Catchup Charge</label>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', paddingTop: 4 }}>
              +${prorationAmount}.00
            </div>
          </div>
        </div>

        <button 
          onClick={() => setProrationCalculated(true)} 
          className="btn btn-primary"
        >
          Apply Seat Change & Prorate
        </button>

        {prorationCalculated && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', fontSize: '0.85rem' }}>
            ✓ Seat change scheduled. Prorated invoice line of +${prorationAmount}.00 generated for remainder of current billing cycle ({remainingDays} days).
          </div>
        )}
      </div>
    </div>
  );
};
