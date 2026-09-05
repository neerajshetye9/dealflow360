# DealFlow360 â€” Comprehensive Business Logic & Governance Rules

This document codifies all 30 mandatory business rules governing the DealFlow360 platform.

---

### 1. Authentication Rules
- Internal users must authenticate using email and password with bcrypt hashing (work factor >= 12) or approved corporate SSO.
- JWT tokens expire after 60 minutes; refresh tokens expire after 7 days with rotation.
- Customer access to the negotiation portal is strictly restricted to quote-specific, single-use, time-bound cryptographic tokens.

### 2. Role Permissions (RBAC)
- `admin`: Full system configuration, user provisioning, rule editing, overriding approvals.
- `sales_rep`: Create/manage owned quotations, view recommendations, initiate approvals, access deal alerts.
- `sales_manager`: Approve Level 1 quotations, manage team quotas, review anomaly reports.
- `finance_director`: Level 2 approval for high-risk quotations, override payment/credit terms.
- `warehouse_manager`: Manage warehouse stock, override fulfillment splits, dispatch shipments.
- `customer`: View shared quotations, propose counter-discounts, submit line-item comments.

### 3. Product Pricing Rules
- Products possess a standard List Price (`base_price`).
- Products are classified as `ONE_TIME` (physical hardware/services) or `SUBSCRIPTION` (recurring SaaS/maintenance).
- Bundled products reflect component pricing minus configured bundle discount rules.

### 4. Customer-Tier Pricing Rules
- Customers belong to a commercial tier: `Platinum`, `Gold`, `Silver`, or `Standard`.
- Customer tier determines the standard base discount ceiling:
  - `Platinum`: Up to 20% standard discount.
  - `Gold`: Up to 15% standard discount.
  - `Silver`: Up to 10% standard discount.
  - `Standard`: Up to 5% standard discount.

### 5. Category-Specific Discount Ceilings
- Regardless of customer tier, individual product categories enforce rigid discount caps:
  - e.g., *Hardware Infrastructure*: Max 15% discount.
  - e.g., *SaaS Software Licenses*: Max 30% discount.
  - e.g., *Professional Services*: Max 10% discount.
- The stricter ceiling between Customer Tier and Category Ceiling always takes precedence.

### 6. Blended Discount Risk Calculation
- Risk evaluation is **never** based merely on the quote's aggregate discount percentage.
- The system evaluates every line item:
  $$\text{Line Risk} = \max(0, \text{Requested Discount} - \text{Allowed Ceiling}) \times \text{Line Total Weight}$$
- The Blended Risk Score ($0 - 100$) aggregates individual line violations, weighted by margin impact and customer lifetime value.

### 7. Approval Routing Logic
- **Low Risk ($Score < 30$)**: No approval required. Auto-approved for customer presentation.
- **Medium Risk ($30 \le Score < 70$)**: Routes to `sales_manager`.
- **High Risk ($Score \ge 70$)**: Sequential multi-level routing: `sales_manager` followed by `finance_director`.

### 8. Approval & Rejection Transitions
- Approvers must be presented with the full blended risk breakdown and line-item violations.
- A rejection requires a mandatory reason code and textual explanation.
- Rejection transitions the quotation to `REJECTED`, notifying the sales representative with revision suggestions.

### 9. Quote Revision Behavior
- Any modification to quantities, prices, or discounts on an approved quote increments the quote revision number (`v1` -> `v2`).
- Creating a revision resets approval status to `DRAFT` or `UNDER_REVIEW`.

### 10. Customer Negotiation Behavior
- Customers access an isolated negotiation portal displaying line items, totals, and delivery terms.
- Customers may comment on specific lines or submit a counter-discount proposal.

### 11. Re-Approval Triggers
- When customer counter-proposals increase the discount or reduce total margin below approval thresholds, the quotation is automatically re-routed through the approval chain.

### 12. Dynamic Margin Calculation
- Live Gross Margin is computed as:
  $$\text{Margin \%} = \frac{\text{Net Selling Price} - \text{Unit Cost}}{\text{Net Selling Price}} \times 100$$
- Visual indicators update dynamically in the Quotation Builder:
  - Green: Margin $\ge 35\%$
  - Amber: $20\% \le \text{Margin} < 35\%$
  - Red: Margin $< 20\%$

### 13. Upsell Ranking Logic
- Upsell recommendations score higher based on:
  1. Pairing affinity score.
  2. Margin contribution.
  3. Active promotion weight (+20% rank bonus).

### 14. Cross-Sell Ranking Logic
- Cross-sell pairings are determined by historical co-purchase frequency in confirmed orders.
- Only products compatible with the customer's selected primary items are displayed.

### 15. Minimum Margin Thresholds
- Any recommendation whose addition would dilute overall quote margin below 20% is automatically suppressed by the recommendation engine.

### 16. Warehouse Selection
- Inventory availability across all warehouses is queried in real time upon order confirmation.
- The warehouse with the lowest transit cost and complete stock availability is chosen as primary.

### 17. Multi-Warehouse Split Rules
- If no single warehouse has sufficient inventory, the allocation engine splits the order across the minimum number of warehouses required to fulfill total units.

### 18. Shipment Optimization
- Fulfillment plans favor consolidating items to minimize distinct shipments and carrier dispatch costs.

### 19. Backorder Behavior
- When inventory across all warehouses is insufficient, available units are allocated and remaining units enter a tracked `BACKORDER` state with expected arrival dates.

### 20. Subscription Scheduling
- Subscriptions generate automated billing schedules (monthly, quarterly, annual) starting from the contract activation date.

### 21. Proration Calculation
- Mid-cycle subscription adjustments (adding seats, upgrading tier) apply daily proration:
  $$\text{Prorated Charge} = \frac{\text{Remaining Days in Cycle}}{\text{Total Days in Cycle}} \times (\text{New Price} - \text{Old Price})$$

### 22. Cancellation Workflow
- Cancellations take effect immediately or at period end based on customer contract terms.
- Unused prepaid service days generate credit notes.

### 23. Refunds
- Full or partial refunds against invoices are tracked with original payment transaction IDs and require Finance role authorization.

### 24. Credit Notes
- Credit notes are issued for billing errors, SLA credits, or subscription downgrades, and can be applied toward future invoices.

### 25. Invoice States
- State transitions: `DRAFT` -> `ISSUED` -> `PAID` / `OVERDUE` / `VOID` / `CREDITED`.

### 26. Payment States
- State transitions: `PENDING` -> `AUTHORIZED` -> `CAPTURED` / `FAILED` / `REFUNDED`.

### 27. Stalled Deal Detection
- Quotations remaining in `DRAFT` or `CUSTOMER_REVIEW` without activity for > 14 days trigger a `STALLED_DEAL` alert.

### 28. Discount Anomaly Rules
- A discount exceeding the individual sales representative's 90-day rolling average discount by > 1.5 standard deviations triggers a `DISCOUNT_ANOMALY` signal.

### 29. Delivery Slippage Rules
- Delayed warehouse stock movements that jeopardize quotation delivery promises automatically flag a `DELIVERY_SLIPPAGE` risk.

### 30. Audit Trail Requirements
- Every change to discounts, approvals, stage transitions, customer negotiations, and billing adjustments is stored in an immutable, timestamped audit log with actor ID and IP.
