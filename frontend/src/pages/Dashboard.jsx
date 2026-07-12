import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import { IconRoute, IconUser, IconWrench, IconWallet, IconAlert, IconTruck, IconCalendar } from '../components/icons';

const fmtMoney = (n) => `₹${Math.round(n).toLocaleString()}`;
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

export default function Dashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [openMaint, setOpenMaint] = useState([]);
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (region) params.set('region', region);
    Promise.all([
      api.get(`/dashboard?${params}`),
      api.get('/trips'),
      api.get('/drivers'),
      api.get('/maintenance?status=OPEN'),
    ])
      .then(([k, t, d, m]) => {
        setKpis(k);
        setTrips(t);
        setDrivers(d);
        setOpenMaint(m);
      })
      .catch((err) => toast.error(err.message));
  }, [type, region]);

  if (!kpis) return <p className="muted">Loading dashboard…</p>;

  // Revenue MTD from completed trips this month (real data)
  const now = new Date();
  const revenueMtd = trips
    .filter((t) => t.status === 'COMPLETED' && t.completedAt && new Date(t.completedAt).getMonth() === now.getMonth() && new Date(t.completedAt).getFullYear() === now.getFullYear())
    .reduce((s, t) => s + Number(t.revenue), 0);

  // Critical alerts built from live data
  const alerts = [
    ...drivers
      .filter((d) => new Date(d.licenseExpiry) < now)
      .map((d) => ({ tone: 'red', icon: <IconAlert size={17} />, title: 'License Expired', desc: `${d.name}'s license (${d.licenseNo}) expired on ${new Date(d.licenseExpiry).toLocaleDateString()}.`, tag: 'Blocked from dispatch' })),
    ...drivers
      .filter((d) => { const dd = daysUntil(d.licenseExpiry); return dd >= 0 && dd <= 30; })
      .map((d) => ({ tone: 'amber', icon: <IconCalendar size={17} />, title: 'License Expiring Soon', desc: `${d.name}'s license expires in ${daysUntil(d.licenseExpiry)} days.`, tag: 'Renewal required' })),
    ...drivers
      .filter((d) => d.status === 'SUSPENDED')
      .map((d) => ({ tone: 'red', icon: <IconUser size={17} />, title: 'Driver Suspended', desc: `${d.name} is suspended (safety score ${d.safetyScore}).`, tag: 'Safety review' })),
    ...openMaint.map((m) => ({ tone: 'amber', icon: <IconWrench size={17} />, title: 'Vehicle In Shop', desc: `${m.vehicle.name} (${m.vehicle.regNo}) — ${m.title}.`, tag: 'Hidden from dispatch' })),
    ...trips
      .filter((t) => t.status === 'DRAFT')
      .map((t) => ({ tone: 'blue', icon: <IconRoute size={17} />, title: 'Trip Awaiting Dispatch', desc: `#${t.id} ${t.source} → ${t.destination} (${Number(t.cargoWeightKg).toLocaleString()} kg).`, tag: 'Draft' })),
  ];

  const active = trips.filter((t) => t.status === 'DISPATCHED');
  const statusRows = [
    { label: 'Available', value: kpis.availableVehicles, cls: 'score-green' },
    { label: 'On Trip', value: kpis.activeVehicles, cls: 'score-green' },
    { label: 'In Shop', value: kpis.inMaintenance, cls: 'score-amber' },
    { label: 'Retired', value: kpis.retiredVehicles, cls: 'score-red' },
  ];
  const maxStatus = Math.max(...statusRows.map((r) => r.value), 1);
  const dutyPct = kpis.totalDrivers ? Math.round((kpis.driversOnDuty / kpis.totalDrivers) * 100) : 0;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p className="page-sub">Real-time operational metrics for the fleet ecosystem.</p>
        </div>
        <div className="filters">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option>Truck</option><option>Mini Truck</option><option>Van</option><option>Bike</option>
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>
            <option>North</option><option>South</option><option>East</option><option>West</option><option>Central</option>
          </select>
        </div>
      </div>

      <div className="kpi-grid">
        {(() => {
          // RBAC matrix: each role leads with its own KPI lens
          // FM = fleet, DRIVER = trips, SO = compliance (drivers), FA = financial
          const CARDS = {
            trips: (
              <KpiCard key="trips"
                icon={<IconRoute />} tone="blue" label="Active Trips" value={kpis.activeTrips}
                trend={{ dir: 'up', text: `${kpis.pendingTrips} pending`, good: true }}
                sub={`${kpis.pendingTrips} draft trip${kpis.pendingTrips === 1 ? '' : 's'} awaiting dispatch`}
              />
            ),
            drivers: (
              <KpiCard key="drivers"
                icon={<IconUser />} tone="green" label="Drivers On Duty"
                value={<>{kpis.driversOnDuty}<small> / {kpis.totalDrivers}</small></>}
                trend={{ dir: dutyPct >= 50 ? 'up' : 'down', text: `${dutyPct}% duty`, good: dutyPct >= 50 }}
                sub="Available + currently on trip"
              />
            ),