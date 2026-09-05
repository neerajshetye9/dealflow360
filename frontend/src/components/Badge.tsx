
import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', size = 'md' }) => {
  const className = `badge badge-${variant} ${size === 'sm' ? 'btn-sm' : ''}`;
  return <span className={className}>{label}</span>;
};
