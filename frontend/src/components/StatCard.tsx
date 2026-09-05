
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  status?: 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  status,
  onClick
}) => {
  return (
    <div 
      className="glass-card" 
      onClick={onClick}
      style={{
        padding: '20px 24px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#fff', marginTop: 4, letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>
        {icon && (
          <div style={{
            padding: 10,
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-cyan)'
          }}>
            {icon}
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: '0.8rem' }}>
          {trend && (
            <span style={{
              fontWeight: 600,
              color: trend.positive ? 'var(--success)' : 'var(--danger)'
            }}>
              {trend.positive ? '+' : ''}{trend.value}
            </span>
          )}
          {subtext && <span style={{ color: 'var(--text-muted)' }}>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
