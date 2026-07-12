import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import { usePager, Pager } from '../components/Pagination';
import { IconUser, IconRoute, IconCalendar, IconAlert, IconPlus, IconSearch } from '../components/icons';

const EMPTY = { name: '', licenseNo: '', licenseCategory: 'LMV', licenseExpiry: '', contact: '', safetyScore: 100 };

const scoreTone = (s) => (s >= 80 ? 'green' : s >= 50 ? 'amber' : 'red');
const isExpired = (d) => new Date(d) < new Date();
const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function Drivers() {
  const { user } = useAuth();
  // RBAC: Safety Officer manages drivers; Fleet Manager has full access
  const canWrite = ['SAFETY_OFFICER', 'FLEET_MANAGER'].includes(user.role);
  const [drivers, setDrivers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);

  async function load() {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    try {
      setDrivers(await api.get(`/drivers?${params}`));
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter, search]);

  const pager = usePager(drivers, 8);

  async function save(e) {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/drivers/${form.id}`, form);
        toast.success(`Driver ${form.name} updated.`);
      } else {
        await api.post('/drivers', form);
        toast.success(`Driver ${form.name} registered.`);
      }
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(d) {
    if (!confirm(`Delete driver ${d.name}?`)) return;
    try {
      await api.del(`/drivers/${d.id}`);
      toast.success(`Driver ${d.name} deleted.`);
      load();
    } catch (err) {
      toast.error(err.message); // e.g. "Driver has trip history — suspend instead"
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const expiredCount = drivers.filter((d) => isExpired(d.licenseExpiry)).length;
  const suspendedCount = drivers.filter((d) => d.status === 'SUSPENDED').length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Driver Management</h1>
          <p className="page-sub">Monitor roster status, credentials, and assignments.</p>
        </div>
        {canWrite && (
          <button className="btn btn-dark" onClick={() => setForm({ ...EMPTY })}>
            <IconPlus size={15} /> Add Driver
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <KpiCard icon={<IconUser />} tone="blue" label="Total Drivers" value={drivers.length} />
        <KpiCard icon={<IconRoute />} tone="green" label="On Trip" value={drivers.filter((d) => d.status === 'ON_TRIP').length} sub="Active deployments" />
        <KpiCard icon={<IconCalendar />} tone="green" label="Available" value={drivers.filter((d) => d.status === 'AVAILABLE' && !isExpired(d.licenseExpiry)).length} sub="Ready for dispatch" />
        <KpiCard
          icon={<IconAlert />} tone="red" label="Alerts" value={expiredCount + suspendedCount}
          sub={`Expired licenses (${expiredCount}), Suspended (${suspendedCount})`}
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Driver Roster</h2>
          <div className="filters">
            <div className="topbar-search" style={{ maxWidth: 240 }}>
              <IconSearch size={15} />
              <input placeholder="Search drivers…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>