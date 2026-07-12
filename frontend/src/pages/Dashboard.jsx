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