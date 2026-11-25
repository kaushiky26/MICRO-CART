export const PRODUCT_API = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:5001';
export const ORDER_API = import.meta.env.VITE_ORDER_API_URL || 'http://localhost:5002';

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new Error(`Cannot reach ${url}. Is the service running?`);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }
  return body;
}

export const getProducts = (q = '') =>
  request(`${PRODUCT_API}/products${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const getProduct = (id) => request(`${PRODUCT_API}/products/${id}`);

export const productHealth = () => request(`${PRODUCT_API}/health`);

export const getOrders = () => request(`${ORDER_API}/orders`);

export const createOrder = (productId, quantity = 1) =>
  request(`${ORDER_API}/orders`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });

export const orderHealth = () => request(`${ORDER_API}/health`);
