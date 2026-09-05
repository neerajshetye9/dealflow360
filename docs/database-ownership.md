# DealFlow360 â€” Database Ownership & Schema Architecture

## Guiding Schema Principles
1. **Domain Boundary Isolation**: Each developer completely owns their domain tables and migrations.
2. **Referential Integrity**: Cross-domain relationships must use standard UUID foreign keys.
3. **Immutability of Audit Trails**: Financial, approval, and audit records must be append-only.
4. **No Unilateral Schema Changes**: If Member A needs a new field in Member Bâ€™s table, an RFC or contract review is required.

---

## 1. Neeraj Shetye Domain Schema
- **`users`**: User identity, password hash, email, status.
- **`roles`**: System roles (`admin`, `sales_rep`, `sales_manager`, `finance_director`, `warehouse_manager`, `customer`).
- **`permissions`**: Granular action capabilities.
- **`customers`**: Customer accounts, company name, credit rating.
- **`customer_tiers`**: Tier definitions (`Platinum`, `Gold`, `Silver`, `Standard`) with base discount allowances.
- **`products`**: Product catalog items, SKU, product type (`ONE_TIME`, `SUBSCRIPTION`).
- **`product_categories`**: Product taxonomy hierarchy.
- **`product_variants`**: Specific options (specs, licensing tiers).
- **`price_lists`**: Price catalogs with effective date windows.
- **`price_list_items`**: Unit prices for products/variants within a price list.
- **`discount_rules`**: Category-specific discount ceilings and rules.
- **`approval_chains`**: Configured multi-level approval hierarchies.
- **`approval_steps`**: Sequential steps required for a specific approval chain.
- **`approval_decisions`**: Recorded decisions (Approved, Rejected, Escalated) with timestamps and comments.
- **`negotiation_requests`**: Customer-initiated change and counter-discount requests.
- **`audit_logs`**: Tamper-evident log of all critical state transitions.

---

## 2. Atharva Shirke Domain Schema
- **`quotations`**: Quotation header, quote number, customer_id, current_stage, total_amount, blended_risk_score, margin_percent.
- **`quotation_lines`**: Quotation line items, product_id, quantity, unit_price, discount_percent, calculated_margin.
- **`quotation_revisions`**: Version history tracking line-item changes and counter-proposals.
- **`deal_stages`**: Stage lookup (`Draft`, `Under Review`, `Approved`, `Customer Negotiation`, `Confirmed`, `Lost`).
- **`pipeline_records`**: Tracking stage velocity and estimated close dates.
- **`product_recommendation_rules`**: Configured cross-sell pairings and triggers.
- **`product_pairings`**: Historical affinity matrix between products.
- **`promotions`**: Active commercial campaigns affecting suggestion priority.
- **`recommendation_history`**: Suggestions presented to sales reps and whether accepted/dismissed.
- **`deal_health_metrics`**: Stagnation counters, last activity timestamps, discount delta from rep average.
- **`deal_alerts`**: Generated alert records (`STALLED_DEAL`, `DISCOUNT_ANOMALY`, `DELIVERY_SLIPPAGE`).

---

## 3. Vignesh Shetty Domain Schema
- **`warehouses`**: Warehouse facility records, physical locations, dispatch capacity.
- **`warehouse_inventory`**: Available, reserved, and backordered quantities per SKU per warehouse.
- **`stock_movements`**: Immutable log of inventory movements and adjustments.
- **`fulfillment_orders`**: Order fulfillment records linked to confirmed quotations.
- **`fulfillment_allocations`**: Quantities assigned to specific warehouses.
- **`shipments`**: Tracking numbers, carrier, dispatch status, delivery timestamps.
- **`backorders`**: Unfulfilled line item balances awaiting incoming stock.
- **`subscription_plans`**: Recurring cadence definitions (`MONTHLY`, `ANNUAL`).
- **`active_subscriptions`**: Live subscriptions, start date, next billing date, active state.
- **`billing_schedules`**: Scheduled invoice generation dates and amounts.
- **`proration_records`**: Adjustments calculated for mid-cycle quantity/tier adjustments.
- **`invoices`**: Invoices generated for one-time orders or recurring billing cycles.
- **`invoice_lines`**: Itemized lines on invoices.
- **`payments`**: Payment transactions, gateway reference, captured amount, status.
- **`refunds`**: Full or partial refunds processed.
- **`credit_notes`**: Credit balances issued upon contract reduction or cancellation.
- **`report_exports`**: Records of generated analytical reports and export files.
