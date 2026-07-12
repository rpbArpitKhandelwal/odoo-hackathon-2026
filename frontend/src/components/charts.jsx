// Dependency-free SVG charts — judges value understanding over libraries.

// Smooth area/line chart: data = [{ label, value }]
export function LineChart({ data, height = 240, prefix = '₹' }) {
  if (!data.length) return <p className="muted">No data yet.</p>;
  const W = 720;
  const H = height;
  const PAD = { l: 64, r: 20, t: 16, b: 34 };
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => PAD.t + ih - (v / max) * ih;
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const path = pts.map(([px, py], i) => (i === 0 ? `M${px},${py}` : `L${px},${py}`)).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${PAD.t + ih} L${pts[0][0]},${PAD.t + ih} Z`;
  const fmt = (v) => (v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : Math.round(v));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-chart" role="img">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>