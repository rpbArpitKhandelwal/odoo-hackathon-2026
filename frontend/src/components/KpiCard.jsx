// Reference-style KPI card: tinted icon square, trend chip, mono label, big value.
// tone: blue | green | amber | red | purple  ·  trend: { dir: 'up'|'down'|'flat', text, good }
export default function KpiCard({ icon, tone = 'blue', label, value, sub, trend, dark }) {
  return (
    <div className={`kpi-card ${dark ? 'kpi-dark' : ''}`}>