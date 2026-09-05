
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export const InvoicesList: React.FC = () => {
  const invoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2026-001',
      customer: 'Acme Global Enterprises',
      totalAmount: 54000,
      status: 'ISSUED',
      dueDate: '2026-10-01',
      createdAt: '2026-09-04'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2026-002',
      customer: 'Nexus Cloud Systems',
      totalAmount: 28500,
      status: 'PAID',
      dueDate: '2026-09-30',
      createdAt: '2026-09-01'
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Invoices & Payment Lifecycle</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            State transitions: DRAFT → ISSUED → PAID / OVERDUE / VOID / CREDITED (Rule 24, 25, 26)
          </p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Due Date</th>
              <th>State Transition Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <Link to={`/invoices/${inv.id}`} style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{inv.customer}</td>
                <td style={{ fontWeight: 700 }}>${inv.totalAmount.toLocaleString()}</td>
                <td>{inv.dueDate}</td>
                <td>
                  <Badge 
                    label={inv.status} 
                    variant={inv.status === 'PAID' ? 'success' : inv.status === 'ISSUED' ? 'info' : 'warning'} 
                  />
                </td>
                <td>
                  <Link to={`/invoices/${inv.id}`} className="btn btn-secondary btn-sm">
                    View & Record Payment <ArrowUpRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
