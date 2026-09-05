
import React, { useState } from 'react';
import { Download, Filter, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

export const Reports: React.FC = () => {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setDownloaded(format);
    setTimeout(() => setDownloaded(null), 3000);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Executive Reporting & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Cross-domain metrics: win rates, approval turnaround, and top upsells (Vignesh's Domain)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleExport('PDF')} className="btn btn-secondary">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={() => handleExport('Excel')} className="btn btn-primary">
            <Download size={16} /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {downloaded && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} /> Executive summary exported in {downloaded} format.
        </div>
      )}

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Total Deal Value Won"
          value="$842,000"
          subtext="+22% increase over Q2"
          trend={{ value: "22% QoQ", positive: true }}
          icon={<TrendingUp size={22} />}
        />
        <StatCard
          title="Avg Approval Cycle Time"
          value="3.8 Hours"
          subtext="From submission to director signoff"
          trend={{ value: "1.4 hr faster", positive: true }}
          icon={<BarChart3 size={22} />}
        />
        <StatCard
          title="Top Upsold Product"
          value="24/7 TAM Support"
          subtext="42% attach rate on enterprise deals"
          icon={<Badge label="Rank #1" variant="success" />}
        />
      </div>
    </div>
  );
};
