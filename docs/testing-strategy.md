# DealFlow360 â€” Testing Strategy & Quality Assurance

## 1. Testing Frameworks
- **Backend**: Vitest / Jest + Supertest for Express API route testing.
- **Frontend**: Vitest + React Testing Library for UI components and custom hooks.
- **Database**: In-memory / Dockerized test database for transaction-isolated integration tests.

---

## 2. Mandatory End-to-End Test Flows
All 11 end-to-end flows must pass before releasing into production:
1. **Flow 1**: Login -> Role-Based Routing -> Sales Workspace.
2. **Flow 2**: Create Quotation -> Apply Line Discounts -> Blended Risk Calculation.
3. **Flow 3**: Threshold Violation -> Sales Manager Approval -> Finance Approval.
4. **Flow 4**: Quotation Builder -> Upsell Recommendation -> Instant Margin Recalculation.
5. **Flow 5**: Customer Access Portal -> Counter-Discount Submission -> Re-evaluation.
6. **Flow 6**: Order Confirmation -> Inventory Check -> Multi-Warehouse Split.
7. **Flow 7**: Hybrid Order -> One-Time Billing + Recurring Subscription Generation.
8. **Flow 8**: Active Subscription -> Mid-Cycle Upgrade -> Prorated Invoice.
9. **Flow 9**: Confirmed Invoice -> Payment Capture -> Audit Trail Entry.
10. **Flow 10**: Stagnant Quote -> Stalled Deal Alert Generation -> Sales Rep Notification.
11. **Flow 11**: Executive Filter Bar -> Multi-Dimensional Filter -> PDF & XLS Export.
