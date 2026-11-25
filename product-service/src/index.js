require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { products } = require('./products');

const app = express();
const PORT = process.env.PORT || 5001;
const SERVICE_NAME = process.env.SERVICE_NAME || 'product-service';

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${SERVICE_NAME}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ service: SERVICE_NAME, status: 'up', port: PORT, products: products.length });
});

app.get('/products', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const list = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    : products;

  res.json({ service: SERVICE_NAME, count: list.length, data: list });
});

app.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Product id must be an integer.' });
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: `Product ${id} not found.` });
  }

  res.json({ service: SERVICE_NAME, data: product });
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((err, _req, res, _next) => {
  console.error(`[${SERVICE_NAME}]`, err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ${SERVICE_NAME} listening on http://localhost:${PORT}`);
});
