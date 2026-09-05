# DealFlow360 â€” Team Module Ownership & Engineering Responsibilities

## Philosophy: True Full-Stack Ownership
In DealFlow360, responsibilities are organized around end-to-end commercial domains rather than horizontal technical silos. Every team member has full-stack ownership across:
- Frontend UI/UX (React + TypeScript + Vite)
- Backend APIs & Middleware (Node.js + Express + TypeScript)
- Database Schema & Migrations (PostgreSQL)
- Core Business Logic & Validation
- Automated Testing (Unit, Integration, and E2E)
- Git Commits and Pull Requests

---

## 1. Neeraj Shetye (`neerajshetye9`) â€” Repository Owner
**Primary Domain**: Identity Foundation, Commercial Configuration, Discount Governance, Approval Engine, and Customer Negotiation.

### Frontend Ownership
- Employee Authentication UI (Login, Signup, Password Reset)
- Role-aware Navigation and Protected App Shell
- Admin Configuration Center:
  - Product Catalog Management (Categories, Products, Variants)
  - Price List Matrix and Customer Tier Assignment
  - Multi-tier Discount Policy Configuration & Category Discount Ceilings
  - Multi-level Approval Chain & Escalation Rule Builder
- Customer-Facing Negotiation Portal:
  - Secure Magic-Link / Token-based Quote Access
  - Line-item Commenting and Term Change Requests
  - Counter-Discount Proposal Interface
- Approval Inbox and Audit Trail History

### Backend Ownership
- Authentication APIs & JWT/Session Management
- Authorization Middleware & Role-Based Access Control (RBAC)
- Product & Catalog Management APIs
- Price List & Tier-Based Pricing Engine
- Discount Policy & Governance Engine
- Blended Risk Calculation Algorithm
- Multi-Level Approval Routing Engine
- Customer Negotiation & Counter-Proposal APIs
- Quote Revision & Re-evaluation Orchestrator
- Immutable Audit Logging Service

### Database Ownership
- `users`, `roles`, `permissions`, `user_roles`
- `customers`, `customer_tiers`
- `products`, `product_categories`, `product_variants`
- `price_lists`, `price_list_items`
- `discount_rules`, `discount_thresholds`
- `approval_chains`, `approval_steps`, `approval_decisions`
- `negotiation_requests`, `negotiation_comments`
- `audit_logs`

---

## 2. Atharva Shirke (`atharvashirke18`) â€” Repository Collaborator
**Primary Domain**: Sales Representative Workspace, Quotation Builder Lifecycle, Upsell/Cross-Sell Intelligence, Pipeline Management, and Deal Health Monitoring.

### Frontend Ownership
- Sales Representative Workspace Dashboard
- Quotation Management Interface (List, Filter, Search, Draft Cards)
- Visual Pipeline / Kanban Board (Deal Stages)
- Interactive Quotation Builder:
  - Smart Product Selector with Instant Search & Filtering
  - Dynamic Cart with Quantity Controls
  - Line-Level and Order-Level Discount Controls
  - Live Margin Impact and Real-Time Profitability Visualizer
- Deal Intelligence Sidecar:
  - Ranked Upsell Suggestions Panel
  - Cross-Sell Recommendation Cards with One-Click Insertion
  - Promotional Product Badges
- Deal Health Dashboard:
  - Stalled Deal Alerts & Stagnation Timers
  - Discount Anomaly Indicators
  - Delivery Risk & Delay Flags

### Backend Ownership
- Quotation CRUD & Lifecycle State Management APIs
- Quotation Line Item APIs with Bulk Operations
- Sales Workspace & Pipeline Analytics APIs
- Real-Time Margin & Profitability Engine
- Recommendation Intelligence Engine:
  - Historical Co-Purchase Pairing Engine
  - Promotion Priority Weighting Algorithm
  - Minimum Margin Threshold Enforcer (Filtering unviable suggestions)
  - Suggestion Conversion Tracking
- Deal Health Monitoring Service:
  - Inactivity & Stalled Deal Cron Detection
  - Historical Discount Anomaly Detection
  - Automated Sales Rep Nudge Generator

### Database Ownership
- `quotations`, `quotation_lines`, `quotation_revisions`
- `deal_stages`, `pipeline_records`
- `product_recommendation_rules`, `product_pairings`, `promotions`
- `recommendation_history`, `recommendation_conversions`
- `deal_health_metrics`, `deal_alerts`, `sales_activity_records`

---

## 3. Vignesh Shetty (`vignesh752006`) â€” Repository Collaborator
**Primary Domain**: Warehouse Fulfillment, Multi-Warehouse Order Splitting, Subscriptions, Hybrid Billing, Payments, Analytics, and Production Deployment.

### Frontend Ownership
- Warehouse Network & Inventory Visibility Screens
- Order Fulfillment & Stock Allocation Dashboard
- Interactive Warehouse Split Console:
  - Recommended Fulfillment Strategy Display
  - Manual Stock Allocation Overrides
  - Backorder Tracker & Stock Inflow Monitoring
- Subscription Management UI:
  - Recurring Billing Schedule Visualizer
  - Mid-Cycle Subscription Modification & Proration Preview
  - Cancellation & Credit Note Generation Console
- Invoice & Payment Processing Console
- Executive Reporting & Analytics Center:
  - Multi-Dimensional Filter Bar (Date, Rep, Team, Category, Status)
  - Export Controls (High-Fidelity PDF and Raw XLS)
- Deployment Status & Production Health Indicators

### Backend Ownership
- Warehouse & Multi-Location Inventory APIs
- Stock Movement & Reservation Engine
- Multi-Warehouse Fulfillment Allocation Engine:
  - Shipment Minimization & Distance Optimization
  - Automatic Order Splitting Service
  - Backorder Management & Inbound Stock Consolidation
- Subscription Engine:
  - Recurring Billing Schedule Generator
  - Mid-Cycle Proration Calculation Engine
  - Cancellation, Credit Note, and Refund Processing
- Hybrid Invoicing APIs (Separating one-time and recurring items)
- Payment Gateway & Transaction Tracking APIs
- Multi-Dimensional Analytics & Aggregation Engine
- Document Generation Service (PDF Invoices/Quotes & XLS Data Exports)
- Production Docker & CI/CD Deployment Orchestration

### Database Ownership
- `warehouses`, `warehouse_inventory`, `stock_movements`
- `fulfillment_orders`, `fulfillment_allocations`, `shipments`, `backorders`
- `subscription_plans`, `active_subscriptions`, `billing_schedules`, `proration_records`
- `invoices`, `invoice_lines`, `payments`, `refunds`, `credit_notes`
- `report_exports`
