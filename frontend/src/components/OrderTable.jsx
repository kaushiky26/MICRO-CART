export default function OrderTable({ orders, format }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Product</th>
            <th className="num">Qty</th>
            <th className="num">Total</th>
            <th>Status</th>
            <th>Placed at</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td data-label="Order">
                <strong>#{o.id}</strong>
              </td>
              <td data-label="Product">
                {o.productName}
                <small className="muted"> (product {o.productId})</small>
              </td>
              <td data-label="Qty" className="num">{o.quantity}</td>
              <td data-label="Total" className="num">{format(o.totalPrice)}</td>
              <td data-label="Status">
                <span className={`status status--${o.status.toLowerCase()}`}>{o.status}</span>
              </td>
              <td data-label="Placed at">
                {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
