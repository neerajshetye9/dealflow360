// Central API Client for DealFlow360 Frontend
const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const activeUser = localStorage.getItem('df360_active_user');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (activeUser) {
    try {
      const u = JSON.parse(activeUser);
      // Pass user ID/role token header if needed
      headers['Authorization'] = `Bearer token-${u.id}-${u.role}`;
    } catch (e) {}
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) errorMsg = body.error;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // ── Products Catalog ──────────────────────────────────────────────────
  async getProducts(category?: string) {
    const url = category ? `${API_BASE}/products?category=${encodeURIComponent(category)}` : `${API_BASE}/products`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  // ── Quotations APIs ───────────────────────────────────────────────────
  async listQuotations(salesRepId?: string, stageId?: string) {
    let url = `${API_BASE}/quotations`;
    const params = new URLSearchParams();
    if (salesRepId) params.append('salesRepId', salesRepId);
    if (stageId) params.append('stageId', stageId);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async getQuotation(id: string) {
    const res = await fetch(`${API_BASE}/quotations/${id}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async createQuotation(customerId: string, priceListId?: string) {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ customerId, priceListId }),
    });
    return handleResponse<any>(res);
  },

  async addLineItem(quotationId: string, productId: string, quantity = 1, discountPercent = 0, variantId?: string, isUpsell = false) {
    const res = await fetch(`${API_BASE}/quotations/${quotationId}/lines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity, discountPercent, variantId, isUpsell }),
    });
    return handleResponse<any>(res);
  },

  async updateLineItem(lineId: string, quantity?: number, discountPercent?: number) {
    const res = await fetch(`${API_BASE}/quotations/lines/${lineId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity, discountPercent }),
    });
    return handleResponse<any>(res);
  },

  async deleteLineItem(lineId: string) {
    const res = await fetch(`${API_BASE}/quotations/lines/${lineId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async submitQuotation(quotationId: string) {
    const res = await fetch(`${API_BASE}/quotations/${quotationId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async createRevision(quotationId: string, reason?: string) {
    const res = await fetch(`${API_BASE}/quotations/${quotationId}/revision`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse<any>(res);
  },

  // ── Upsell & Cross-Sell Recommendations ──────────────────────────────
  async getRecommendations(quotationId: string) {
    const res = await fetch(`${API_BASE}/quotations/${quotationId}/recommendations`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async acceptRecommendation(quotationId: string, productId: string) {
    const res = await fetch(`${API_BASE}/quotations/${quotationId}/recommendations/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    return handleResponse<any>(res);
  },

  // ── Deal Health APIs ─────────────────────────────────────────────────
  async getDealHealthSummary() {
    const res = await fetch(`${API_BASE}/deal-health`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async evaluateDealHealth() {
    const res = await fetch(`${API_BASE}/deal-health/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  async nudgeSalesRep(alertId: string) {
    const res = await fetch(`${API_BASE}/deal-health/${alertId}/nudge`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // ── Customer Portal APIs ─────────────────────────────────────────────
  async getPortalQuote(token: string) {
    const res = await fetch(`${API_BASE}/portal/${token}`);
    return handleResponse<any>(res);
  },

  async submitCounterProposal(token: string, proposedDiscountPercent: number, comments?: string) {
    const res = await fetch(`${API_BASE}/portal/${token}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedDiscountPercent, comments }),
    });
    return handleResponse<any>(res);
  },

  async confirmPortalQuote(token: string) {
    const res = await fetch(`${API_BASE}/portal/${token}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<any>(res);
  },

  // ── Approvals APIs ───────────────────────────────────────────────────
  async listApprovals() {
    const res = await fetch(`${API_BASE}/approvals`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(res);
  },

  async actOnApproval(approvalStepId: string, action: 'APPROVE' | 'REJECT' | 'RETURN_FOR_REVISION', comments?: string) {
    const res = await fetch(`${API_BASE}/approvals/${approvalStepId}/action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, comments }),
    });
    return handleResponse<any>(res);
  },
};
