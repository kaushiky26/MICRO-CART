import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PRODUCT_API,
  ORDER_API,
  getProducts,
  getOrders,
  createOrder,
  productHealth,
  orderHealth
} from './api.js';
import ProductCard from './components/ProductCard.jsx';
import OrderTable from './components/OrderTable.jsx';
import Toast from './components/Toast.jsx';
import Spinner from './components/Spinner.jsx';

const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function App() {
  const [view, setView] = useState('products');

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const [buyingId, setBuyingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [health, setHealth] = useState({ product: 'checking', order: 'checking' });

  const notify = (type, message) => setToast({ type, message, key: Date.now() });

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await getOrders();
      setOrders(res.data || []);
      setRevenue(res.revenue || 0);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    const [p, o] = await Promise.allSettled([productHealth(), orderHealth()]);
    setHealth({
      product: p.status === 'fulfilled' ? 'up' : 'down',
      order: o.status === 'fulfilled' ? 'up' : 'down'
    });
  }, []);

  const prevHealth = useRef({ product: 'checking', order: 'checking' });

  useEffect(() => {
    checkHealth();
    loadProducts();
    loadOrders();
    const timer = setInterval(checkHealth, 3000);
    return () => clearInterval(timer);
  }, [checkHealth, loadProducts, loadOrders]);

  useEffect(() => {
    const prev = prevHealth.current;
    if (health.product === 'up' && prev.product !== 'up') loadProducts();
    if (health.order === 'up' && prev.order !== 'up') loadOrders();
    prevHealth.current = health;
  }, [health, loadProducts, loadOrders]);

  const handleBuy = async (product, quantity) => {
    setBuyingId(product.id);
    try {
      const res = await createOrder(product.id, quantity);
      const o = res.data;
      notify(
        'success',
        `Order #${o.id} placed — ${o.quantity} × ${o.productName} for ${inr(o.totalPrice)} (status: ${o.status})`
      );
      await loadOrders();
    } catch (err) {
      notify('error', err.message);
    } finally {
      setBuyingId(null);
    }
  };

  const showProducts = () => {
    setView('products');
    loadProducts();
  };

  const showOrders = () => {
    setView('orders');
    loadOrders();
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__inner">
          <div className="brand">
            <span className="brand__mark">MC</span>
            <div>
              <h1>MicroCart</h1>
              <p>A tiny storefront powered by two independent Express microservices.</p>
            </div>
          </div>

          <div className="services">
            <ServiceChip
              label="Product Service"
              port="5001"
              base={PRODUCT_API}
              status={health.product}
            />
            <ServiceChip
              label="Order Service"
              port="5002"
              base={ORDER_API}
              status={health.order}
            />
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${view === 'products' ? 'tab--active' : ''}`}
          onClick={showProducts}
        >
          View Products
        </button>
        <button
          className={`tab ${view === 'orders' ? 'tab--active' : ''}`}
          onClick={showOrders}
        >
          View Orders
          <span className="tab__badge">{orders.length}</span>
        </button>
      </nav>

      <main className="content">
        {view === 'products' ? (
          <section>
            <div className="section-head">
              <div>
                <h2>Products</h2>
                <p className="muted">
                  GET <code>/products</code> → Product Service :5001
                </p>
              </div>
              <button className="btn btn--ghost" onClick={loadProducts} disabled={productsLoading}>
                ⟳ Refresh
              </button>
            </div>

            {productsLoading && <Spinner label="Loading products from Product Service…" />}

            {!productsLoading && productsError && (
              <ErrorBox message={productsError} onRetry={loadProducts} />
            )}

            {!productsLoading && !productsError && products.length === 0 && (
              <EmptyBox text="No products returned by the Product Service." />
            )}

            {!productsLoading && !productsError && products.length > 0 && (
              <div className="grid">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    busy={buyingId === p.id}
                    disabled={buyingId !== null}
                    onBuy={handleBuy}
                    format={inr}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="section-head">
              <div>
                <h2>Orders</h2>
                <p className="muted">
                  GET <code>/orders</code> → Order Service :5002
                </p>
              </div>
              <div className="section-head__right">
                <span className="pill">Revenue: {inr(revenue)}</span>
                <button className="btn btn--ghost" onClick={loadOrders} disabled={ordersLoading}>
                  ⟳ Refresh
                </button>
              </div>
            </div>

            {ordersLoading && <Spinner label="Loading orders from Order Service…" />}

            {!ordersLoading && ordersError && <ErrorBox message={ordersError} onRetry={loadOrders} />}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <EmptyBox text="No orders yet. Go to Products and hit Buy Now." />
            )}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <OrderTable orders={orders} format={inr} />
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <span>
          React + Vite · Product Service <code>:5001</code> · Order Service <code>:5002</code> · in-memory
          storage
        </span>
      </footer>

      {toast && <Toast key={toast.key} {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function ServiceChip({ label, port, base, status }) {
  return (
    <div className={`chip chip--${status}`}>
      <span className="chip__dot" />
      <div className="chip__text">
        <strong>
          {label} <span className="chip__port">:{port}</span>
        </strong>
        <small>
          {base} · {status === 'checking' ? 'checking…' : status === 'up' ? 'online' : 'offline'}
        </small>
      </div>
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="state state--error">
      <strong>Something went wrong</strong>
      <p>{message}</p>
      <button className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="state state--empty">
      <p>{text}</p>
    </div>
  );
}
