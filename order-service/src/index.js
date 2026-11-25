require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;
const SERVICE_NAME = process.env.SERVICE_NAME || 'order-service';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5001';

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${SERVICE_NAME}] ${req.method} ${req.originalUrl}`);
  next();
});

const orders = [];
let nextOrderId = 1;

const STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

async function fetchProduct(productId) {
  try {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/products/${productId}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data || null;
  } catch (err) {
    console.warn(`[${SERVICE_NAME}] product-service unreachable: ${err.message}`);
    return undefined;
  }
}

app.get('/health', (_req, res) => {
  res.json({ service: SERVICE_NAME, status: 'up', port: PORT, orders: orders.length });
});

app.get('/orders', (_req, res) => {
  const list = [...orders].sort((a, b) => b.id - a.id);
  const revenue = list
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  res.json({ service: SERVICE_NAME, count: list.length, revenue, data: list });
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: `Order ${req.params.id} not found.` });
  res.json({ service: SERVICE_NAME, data: order });
});

app.post('/orders', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body || {};

    const pid = Number(productId);
    const qty = Number(quantity);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: '"productId" is required and must be a positive integer.' });
    }
    if (!Number.isInteger(qty) || qty <= 0 || qty > 99) {
      return res.status(400).json({ error: '"quantity" must be an integer between 1 and 99.' });
    }

    const product = await fetchProduct(pid);

    if (product === undefined) {
      return res.status(503).json({
        error: 'Product service is unavailable. Start product-service on port 5001 and retry.'
      });
    }
    if (product === null) {
      return res.status(404).json({ error: `Product ${pid} does not exist.` });
    }

    const order = {
      id: nextOrderId++,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      totalPrice: Number(product.price) * qty,
      status: 'PLACED',
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    console.log(`[${SERVICE_NAME}] order #${order.id} created for product ${order.productId}`);

    res.status(201).json({ service: SERVICE_NAME, message: 'Order created successfully.', data: order });
  } catch (err) {
    next(err);
  }
});

app.patch('/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: `Order ${req.params.id} not found.` });

  const status = String(req.body?.status || '').toUpperCase();
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `"status" must be one of: ${STATUSES.join(', ')}` });
  }

  order.status = status;
  res.json({ service: SERVICE_NAME, message: 'Order updated.', data: order });
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, _req, res, _next) => {
  console.error(`[${SERVICE_NAME}]`, err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ${SERVICE_NAME} listening on http://localhost:${PORT}`);
  console.log(`   talking to product-service at ${PRODUCT_SERVICE_URL}`);
});
