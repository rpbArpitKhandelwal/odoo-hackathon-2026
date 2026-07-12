import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import { usePager, Pager } from '../components/Pagination';
import { IconFuel, IconWallet, IconTrend, IconPlus, IconTruck } from '../components/icons';

const FUEL_EMPTY = { vehicleId: '', liters: '', cost: '', filledAt: '' };
const EXP_EMPTY = { vehicleId: '', category: 'TOLL', amount: '', note: '' };

export default function Expenses() {
  const { user } = useAuth();
  // RBAC: Financial Analyst owns fuel & expenses; Fleet Manager has full access (Driver: no access)
  const canWrite = ['FINANCIAL_ANALYST', 'FLEET_MANAGER'].includes(user.role);
  const [tab, setTab] = useState('fuel');
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [form, setForm] = useState(null);

  async function load() {
    const q = vehicleFilter ? `?vehicleId=${vehicleFilter}` : '';
    try {
      const [f, e, v] = await Promise.all([api.get(`/fuel-logs${q}`), api.get(`/expenses${q}`), api.get('/vehicles')]);
      setFuelLogs(f);
      setExpenses(e);
      setVehicles(v);
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [vehicleFilter]);

  const fuelPager = usePager(fuelLogs, 8);
  const expPager = usePager(expenses, 8);
  const pager = tab === 'fuel' ? fuelPager : expPager;

  async function save(e) {
    e.preventDefault();
    try {
      if (form.kind === 'fuel') await api.post('/fuel-logs', form);
      else await api.post('/expenses', form);
      toast.success(form.kind === 'fuel' ? 'Fuel log recorded.' : 'Expense recorded.');
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const totalFuel = fuelLogs.reduce((s, f) => s + Number(f.cost), 0);
  const totalLiters = fuelLogs.reduce((s, f) => s + Number(f.liters), 0);
  const totalExpenses = expenses.reduce((s, x) => s + Number(x.amount), 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Fuel &amp; Expenses</h1>
          <p className="page-sub">Record fuel fills, tolls, and other operating costs per vehicle.</p>
        </div>
        {canWrite && (
          <div className="filters">
            <button className="btn btn-ghost" onClick={() => setForm({ kind: 'expense', ...EXP_EMPTY, vehicleId: vehicleFilter })}>
              <IconPlus size={15} /> Add Expense
            </button>
            <button className="btn btn-dark" onClick={() => setForm({ kind: 'fuel', ...FUEL_EMPTY, vehicleId: vehicleFilter })}>
              <IconPlus size={15} /> Add Fuel Log
            </button>
          </div>
        )}
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<IconFuel />} tone="amber" label="Fuel Cost" value={`₹${totalFuel.toLocaleString()}`}
          sub={`${totalLiters.toLocaleString()} liters ${vehicleFilter ? '(this vehicle)' : '(all vehicles)'}`}
        />
        <KpiCard icon={<IconWallet />} tone="blue" label="Other Expenses" value={`₹${totalExpenses.toLocaleString()}`} sub="Tolls, parking, fines, misc" />
        <KpiCard icon={<IconTrend />} tone="purple" label="Total Spend Shown" value={`₹${(totalFuel + totalExpenses).toLocaleString()}`} sub="See Reports for operational cost (fuel + maintenance)" />
      </div>

      <div className="panel">
        <div className="panel-head" style={{ paddingBottom: 0, borderBottom: 'none' }}>
          <div className="filters">
            <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
              <option value="">All vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.regNo})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'fuel' ? 'active' : ''}`} onClick={() => setTab('fuel')}>
            Fuel Logs ({fuelLogs.length})
          </button>
          <button className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
            Other Expenses ({expenses.length})
          </button>
        </div>
