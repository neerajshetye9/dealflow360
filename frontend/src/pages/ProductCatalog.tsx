
import React, { useState } from 'react';
import { Box, Plus, Search, Tag, DollarSign } from 'lucide-react';
import { Badge } from '../components/Badge';

export const ProductCatalog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const products = [
    { id: '1', name: 'Enterprise Server Rack X-500', category: 'Hardware', basePrice: 12000, unitCost: 7500, variants: 3, status: 'ACTIVE' },
    { id: '2', name: 'Edge Gateway Node Pro', category: 'Hardware', basePrice: 3500, unitCost: 1900, variants: 2, status: 'ACTIVE' },
    { id: '3', name: 'DealFlow Platform SaaS (Per Seat)', category: 'SaaS', basePrice: 85, unitCost: 12, variants: 3, status: 'ACTIVE' },
    { id: '4', name: 'Cloud Deployment Pro Services', category: 'Services', basePrice: 15000, unitCost: 9000, variants: 1, status: 'ACTIVE' },
    { id: '5', name: '24/7 Enterprise Support SLA', category: 'Services', basePrice: 8000, unitCost: 3500, variants: 2, status: 'ACTIVE' }
  ];

  const filtered = activeCategory === 'ALL' ? products : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Product & Catalog Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Catalog, multi-currency price lists, and variant definitions (Neeraj's Domain)
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', 'Hardware', 'SaaS', 'Services'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Base List Price</th>
              <th>Unit Cost</th>
              <th>Default Gross Margin</th>
              <th>Active Variants</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const margin = Math.round(((p.basePrice - p.unitCost) / p.basePrice) * 100);
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{p.name}</td>
                  <td><Badge label={p.category} variant="info" /></td>
                  <td style={{ fontWeight: 600 }}>${p.basePrice.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>${p.unitCost.toLocaleString()}</td>
                  <td>
                    <Badge 
                      label={`${margin}%`} 
                      variant={margin >= 35 ? 'success' : margin >= 20 ? 'warning' : 'danger'} 
                    />
                  </td>
                  <td>{p.variants} variants</td>
                  <td><Badge label={p.status} variant="success" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
