import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Bell, AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Play } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { api } from '../api';

export const DealHealth: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [nudgedAlertId, setNudgedAlertId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getDealHealthSummary();
      setSummary(data.summary || {});
      setAlerts(data.alerts || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch deal health monitor metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleRunEvaluation = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await api.evaluateDealHealth();
      await fetchHealthData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to evaluate deals');
      setLoading(false);
    }
  };

  const handleNudge = async (alertId: string) => {
    try {
      setErrorMsg(null);
      await api.nudgeSalesRep(alertId);
      setNudgedAlertId(alertId);
      setTimeout(() => setNudgedAlertId(null), 4000);
      await fetchHealthData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch nudge to sales rep');
    }
  };

  const stalledCount = summary?.stalledCount || 0;
  const anomalyCount = summary?.anomalyCount || 0;
  const slippageCount = summary?.slippageCount || 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Deal Health Monitor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Automated inactivity detection, discount anomaly tracking, and pipeline velocity audits (Atharva's Domain)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleRunEvaluation} className="btn btn-primary btn-sm" title="Run Inactivity & Anomaly Scan">
            <Play size={14} /> Run Deal Evaluation Scan
          </button>
          <button onClick={fetchHealthData} className="btn btn-secondary btn-sm" title="Refresh Deal Health Data">
            <RefreshCw size={14} /> Refresh Metrics
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-border)', color: '#f87171', marginBottom: 20 }}>
          {errorMsg}
        </div>
      )}

      {nudgedAlertId && (
        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success-border)', color: '#34d399', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} /> Automated nudge notification dispatched to assigned sales rep & logged in audit trail.
        </div>
      )}

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Stalled Deals (>14d)"
          value={`${stalledCount} Deals`}
          subtext="Inactivity timer exceeded"
          icon={<AlertTriangle size={22} color="var(--warning)" />}
        />
        <StatCard
          title="Discount Anomalies (>1.5σ)"
          value={`${anomalyCount} Deals`}
          subtext="Excessive discount vs rep baseline"
          icon={<ShieldAlert size={22} color="var(--danger)" />}
        />
        <StatCard
          title="Slippage Risk"
          value={`${slippageCount} Deals`}
          subtext="Expected close date passed"
          icon={<Activity size={22} color="var(--accent-cyan)" />}
        />
      </div>

      {/* Flagged Deals Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Active Deal Health Alerts & Escalations
        </h3>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
            Evaluating active deal health metrics...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Quotation</th>
                  <th>Alert Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Audit Finding / Finding Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No active deal health alerts detected. All deals healthy!
                    </td>
                  </tr>
                ) : (
                  alerts.map(a => {
                    const alertType = a.alert_type || a.type || 'ALERT';
                    const severity = a.severity || 'MEDIUM';
                    const isNudged = a.status === 'NUDGE_SENT';

                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link to={`/quotations/${a.quotation_id || a.quotationId}`} style={{ color: 'var(--accent-cyan)' }}>
                            {a.quoteNumber || a.quotation_id || 'View Quotation'}
                          </Link>
                        </td>
                        <td><Badge label={alertType.replace(/_/g, ' ')} variant={alertType.includes('ANOMALY') ? 'danger' : 'warning'} /></td>
                        <td><Badge label={severity} variant={severity === 'HIGH' ? 'danger' : 'warning'} /></td>
                        <td><Badge label={a.status || 'OPEN'} variant={isNudged ? 'info' : 'warning'} /></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.message || a.description}</td>
                        <td>
                          <button
                            onClick={() => handleNudge(a.id)}
                            disabled={isNudged}
                            className={`btn ${isNudged ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          >
                            <Bell size={13} /> {isNudged ? 'Nudge Sent' : 'Nudge Rep'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
