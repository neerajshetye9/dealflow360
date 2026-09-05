
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';

// Neeraj Pages
import { Login } from './pages/Login';
import { ApprovalsList } from './pages/ApprovalsList';
import { ApprovalDetail } from './pages/ApprovalDetail';
import { CustomerPortal } from './pages/CustomerPortal';
import { ProductCatalog } from './pages/ProductCatalog';
import { DiscountConfig } from './pages/DiscountConfig';

// Atharva Pages
import { Dashboard } from './pages/Dashboard';
import { QuotationsKanban } from './pages/QuotationsKanban';
import { QuotationDetail } from './pages/QuotationDetail';
import { DealHealth } from './pages/DealHealth';

// Vignesh Pages
import { FulfillmentList } from './pages/FulfillmentList';
import { FulfillmentDetail } from './pages/FulfillmentDetail';
import { SubscriptionsList } from './pages/SubscriptionsList';
import { BillingDetail } from './pages/BillingDetail';
import { InvoicesList } from './pages/InvoicesList';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Reports } from './pages/Reports';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Default redirect to Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* S1: Login & Auth (Neeraj) */}
              <Route path="/login" element={<Login />} />

              {/* S2: Dashboard (Atharva) */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* S3: Quotations Kanban (Atharva) */}
              <Route path="/quotations" element={<QuotationsKanban />} />

              {/* S4: Quotation Detail & Upsell Engine (Atharva) */}
              <Route path="/quotations/:id" element={<QuotationDetail />} />

              {/* S5: Approvals List (Neeraj) */}
              <Route path="/approvals" element={<ApprovalsList />} />

              {/* S6: Approval Detail & Governance Audit (Neeraj) */}
              <Route path="/approvals/:id" element={<ApprovalDetail />} />

              {/* S7: Fulfillment List & Warehouses (Vignesh) */}
              <Route path="/fulfillment" element={<FulfillmentList />} />

              {/* S8: Fulfillment Detail & Warehouse Split (Vignesh) */}
              <Route path="/fulfillment/:id" element={<FulfillmentDetail />} />

              {/* S9: Subscriptions List (Vignesh) */}
              <Route path="/subscriptions" element={<SubscriptionsList />} />

              {/* S10: Billing Detail & Proration (Vignesh) */}
              <Route path="/subscriptions/:id" element={<BillingDetail />} />

              {/* S11: Customer Negotiation Portal (Neeraj) */}
              <Route path="/portal/:token" element={<CustomerPortal />} />

              {/* S12: Invoices List (Vignesh) */}
              <Route path="/invoices" element={<InvoicesList />} />

              {/* S13: Invoice Detail (Vignesh) */}
              <Route path="/invoices/:id" element={<InvoiceDetail />} />

              {/* S14: Deal Health Monitor & Alerts (Atharva) */}
              <Route path="/deal-health" element={<DealHealth />} />

              {/* S15: Executive Reports & Analytics (Vignesh) */}
              <Route path="/reports" element={<Reports />} />

              {/* S16: Product Catalog (Neeraj) */}
              <Route path="/products" element={<ProductCatalog />} />

              {/* S17: Product Detail (Neeraj) */}
              <Route path="/products/:id" element={<ProductCatalog />} />

              {/* S18: Discount Governance Configuration (Neeraj) */}
              <Route path="/admin/discount-config" element={<DiscountConfig />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
