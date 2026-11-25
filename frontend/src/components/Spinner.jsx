export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="state state--loading">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
