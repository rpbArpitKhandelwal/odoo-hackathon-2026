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