import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import { usePager, Pager } from '../components/Pagination';
import { IconWrench, IconTruck, IconWallet, IconPlus } from '../components/icons';

const EMPTY = { vehicleId: '', title: '', description: '', cost: '' };

export default function Maintenance() {
  const { user } = useAuth();
  const canWrite = user.role === 'FLEET_MANAGER';
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('OPEN');
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(null);
  const [closing, setClosing] = useState(null);

  async function load() {
    try {
      setLogs(await api.get('/maintenance'));
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = logs.filter((m) => m.status === tab);
  const pager = usePager(filtered, 8);

  async function openCreate() {
    try {
      const all = await api.get('/vehicles');
      setVehicles(all.filter((v) => !['RETIRED', 'ON_TRIP', 'IN_SHOP'].includes(v.status)));
      setForm({ ...EMPTY });
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function save(e) {
    e.preventDefault();
    try {
      const log = await api.post('/maintenance', form);
      setForm(null);
      toast.success(`Maintenance opened — ${log.vehicle.name} is now In Shop and hidden from dispatch.`);
      load();
    } catch (err) {
      toast.error(err.message); // e.g. "vehicle is on a trip — complete or cancel the trip first"
    }
  }

  async function close(e) {
    e.preventDefault();
    try {
      const cost = Number(new FormData(e.target).get('cost'));
      const log = await api.post(`/maintenance/${closing.id}/close`, { cost });
      setClosing(null);
      toast.success(`Maintenance closed — ${log.vehicle.name} is Available again.`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // MTD service costs (real data)
  const now = new Date();
  const mtdCost = logs
    .filter((m) => new Date(m.openedAt).getMonth() === now.getMonth() && new Date(m.openedAt).getFullYear() === now.getFullYear())
    .reduce((s, m) => s + Number(m.cost), 0);
  const openCount = logs.filter((m) => m.status === 'OPEN').length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Maintenance Overview</h1>
          <p className="page-sub">Monitor fleet health, track repairs, and manage service costs.</p>
        </div>
        {canWrite && (
          <button className="btn btn-dark" onClick={openCreate}>
            <IconPlus size={15} /> Log New Maintenance
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<IconTruck />} tone="red" label="Vehicles In Shop" value={openCount}
          trend={{ dir: openCount > 0 ? 'up' : 'flat', text: `${openCount} open`, good: openCount === 0 }}
          sub="Automatically hidden from dispatch"
        />
        <KpiCard icon={<IconWrench />} tone="blue" label="Total Service Records" value={logs.length} sub={`${logs.length - openCount} closed`} />
        <KpiCard icon={<IconWallet />} tone="green" label="MTD Service Costs" value={`₹${mtdCost.toLocaleString()}`} sub="Logs opened this month" />
      </div>

      <div className="panel">
        <div className="tabs">