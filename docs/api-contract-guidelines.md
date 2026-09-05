# DealFlow360 â€” Shared API Contracts & Integration Guidelines

## Standard Request / Response Envelope
All DealFlow360 APIs follow a consistent REST structure:

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-09-05T10:00:00Z",
    "version": "v1"
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "DISCOUNT_CEILING_EXCEEDED",
    "message": "Discount of 25% exceeds the category ceiling of 15% for Category ID 3",
    "details": [ ... ]
  },
  "timestamp": "2026-09-05T10:00:00Z"
}
```

---

## Shared Cross-Module Dependencies & Endpoints

### 1. Quotation -> Approval Engine (Atharva -> Neeraj)
When a sales rep submits a quotation, it must be evaluated for blended risk and routed:
- **Endpoint**: `POST /api/v1/approvals/evaluate`
- **Auth**: Required (`sales_rep`, `sales_manager`, `admin`)
- **Request Body**:
  ```json
  {
    "quotation_id": "UUID",
    "customer_id": "UUID",
    "customer_tier_id": "UUID",
    "total_amount": 15400.00,
    "lines": [
      {
        "line_id": "UUID",
        "product_id": "UUID",
        "category_id": "UUID",
        "unit_price": 500.00,
        "quantity": 10,
        "discount_percent": 18.5,
        "margin_percent": 24.0
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "quotation_id": "UUID",
    "requires_approval": true,
    "blended_risk_score": 72.5,
    "risk_level": "HIGH",
    "approval_chain_id": "UUID",
    "required_steps": [
      { "step": 1, "role": "sales_manager", "status": "PENDING" },
      { "step": 2, "role": "finance_director", "status": "WAITING" }
    ],
    "violations": [
      {
        "type": "CATEGORY_CEILING",
        "category_name": "Hardware",
        "max_allowed": 15.0,
        "requested": 18.5
      }
    ]
  }
  ```

---

### 2. Quotation -> Recommendation Engine (Atharva Internal)
Dynamic recommendations based on current cart state:
- **Endpoint**: `POST /api/v1/recommendations/suggest`
- **Request Body**:
  ```json
  {
    "customer_id": "UUID",
    "current_product_ids": ["UUID_PROD_1", "UUID_PROD_2"],
    "cart_subtotal": 12000.00,
    "current_margin_percent": 31.5
  }
  ```
- **Response**:
  ```json
  {
    "upsell": [
      {
        "product_id": "UUID",
        "name": "Enterprise Support Plan 24/7",
        "additional_price": 1200.00,
        "projected_margin_percent": 34.2,
        "priority_score": 95,
        "is_promoted": true
      }
    ],
    "cross_sell": [
      {
        "product_id": "UUID",
        "name": "Redundant Power Supply Unit",
        "unit_price": 350.00,
        "projected_margin_percent": 29.8,
        "co_purchase_frequency": 0.82
      }
    ]
  }
  ```

---

### 3. Customer Negotiation -> Approval Re-evaluation (Neeraj -> Atharva/Neeraj)
When a customer submits a counter-proposal:
- **Endpoint**: `POST /api/v1/negotiations/:quote_id/counter`
- **Request Body**:
  ```json
  {
    "counter_discount_percent": 22.0,
    "requested_changes": "Requesting 22% overall discount based on annual commitment.",
    "line_modifications": [ ... ]
  }
  ```
- **Behavior**:
  1. Creates a new `quotation_revision` record.
  2. Automatically invokes the Blended Risk Engine.
  3. If risk threshold is crossed, revokes prior approvals and queues new approval steps.

---

### 4. Approved Quotation -> Fulfillment Allocation (Atharva/Neeraj -> Vignesh)
When quotation status transitions to `CONFIRMED`:
- **Endpoint**: `POST /api/v1/fulfillment/allocate`
- **Request Body**:
  ```json
  {
    "order_id": "UUID",
    "quotation_id": "UUID",
    "customer_shipping_address": { ... },
    "items": [
      { "product_id": "UUID", "quantity": 100, "is_subscription": false },
      { "product_id": "UUID", "quantity": 1, "is_subscription": true, "billing_period": "MONTHLY" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "fulfillment_plan": {
      "strategy": "SPLIT_WAREHOUSE",
      "shipments": [
        { "warehouse_id": "WH_EAST", "items": [{ "product_id": "P1", "quantity": 70 }] },
        { "warehouse_id": "WH_WEST", "items": [{ "product_id": "P1", "quantity": 30 }] }
      ],
      "backorders": []
    }
  }
  ```

---

### 5. Confirmed Order -> Hybrid Billing (Vignesh)
- **Endpoint**: `POST /api/v1/billing/generate-schedules`
- **Behavior**: Separates one-time physical fulfillment invoice from recurring subscription billing schedules.
