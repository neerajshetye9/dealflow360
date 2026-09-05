
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

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
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* S1: Role-Tailored Login & Registration */}
              <Route path="/login" element={<Login />} />

              {/* S2: Dashboard (Rep, Manager, Finance, Admin) */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance_director', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* S3: Quotations Kanban (Rep, Manager, Admin) */}
              <Route path="/quotations" element={
                <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
                  <QuotationsKanban />
                </ProtectedRoute>
              } />

              {/* S4: Quotation Detail & Upsell Engine (Rep, Manager, Admin) */}
              <Route path="/quotations/:id" element={
                <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
                  <QuotationDetail />
                </ProtectedRoute>
              } />

              {/* S5: Approvals Queue (Manager, Finance Director, Admin) */}
              <Route path="/approvals" element={
                <ProtectedRoute allowedRoles={['sales_manager', 'finance_director', 'admin']}>
                  <ApprovalsList />
                </ProtectedRoute>
              } />

              {/* S6: Approval Review (Manager, Finance Director, Admin) */}
              <Route path="/approvals/:id" element={
                <ProtectedRoute allowedRoles={['sales_manager', 'finance_director', 'admin']}>
                  <ApprovalDetail />
                </ProtectedRoute>
              } />

              {/* S7: Fulfillment List (Finance Director, Admin) */}
              <Route path="/fulfillment" element={
                <ProtectedRoute allowedRoles={['finance_director', 'admin']}>
                  <FulfillmentList />
                </ProtectedRoute>
              } />

              {/* S8: Fulfillment Detail & Warehouse Split (Finance Director, Admin) */}
              <Route path="/fulfillment/:id" element={
                <ProtectedRoute allowedRoles={['finance_director', 'admin']}>
                  <FulfillmentDetail />
                </ProtectedRoute>
              } />

              {/* S9: Subscriptions List (Finance Director, Admin) */}
              <Route path="/subscriptions" element={
                <ProtectedRoute allowedRoles={['finance_director', 'admin']}>
                  <SubscriptionsList />
                </ProtectedRoute>
              } />

              {/* S10: Billing Detail & Proration (Finance Director, Admin) */}
              <Route path="/subscriptions/:id" element={
                <ProtectedRoute allowedRoles={['finance_director', 'admin']}>
                  <BillingDetail />
                </ProtectedRoute>
              } />

              {/* S11: Customer Negotiation Portal (Accessible to all with portal token or customer role) */}
              <Route path="/portal/:token" element={<CustomerPortal />} />

              {/* S12: Invoices List (Finance Director, Admin) */}
              <Route path="/invoices" element={
                <ProtectedRoute allowedRoles={['finance_director', 'admin']}>
                  <InvoicesList />
                </ProtectedRoute>
              } />

              {/* S13: Invoice Detail & Payment (Finance Director, Admin) */}
              <Route path="/invoices/:id" element={
                <ProtectedRoute allowedRoles={['finance_director', 'admin']}>
                  <InvoiceDetail />
                </ProtectedRoute>
              } />

              {/* S14: Deal Health Monitor & Alerts (Manager, Finance Director, Admin) */}
              <Route path="/deal-health" element={
                <ProtectedRoute allowedRoles={['sales_manager', 'finance_director', 'admin']}>
                  <DealHealth />
                </ProtectedRoute>
              } />

              {/* S15: Executive Reports (Manager, Finance Director, Admin) */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['sales_manager', 'finance_director', 'admin']}>
                  <Reports />
                </ProtectedRoute>
              } />

              {/* S16: Product Catalog (Rep, Manager, Admin) */}
              <Route path="/products" element={
                <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
                  <ProductCatalog />
                </ProtectedRoute>
              } />

              {/* S17: Product Detail (Rep, Manager, Admin) */}
              <Route path="/products/:id" element={
                <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
                  <ProductCatalog />
                </ProtectedRoute>
              } />

              {/* S18: Discount Governance Config (Admin ONLY) */}
              <Route path="/admin/discount-config" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DiscountConfig />
                </ProtectedRoute>
              } />

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
