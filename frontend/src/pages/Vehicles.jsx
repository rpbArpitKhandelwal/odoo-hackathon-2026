import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import { usePager, Pager } from '../components/Pagination';
import { IconTruck, IconRoute, IconWrench, IconMoon, IconPlus, IconSearch } from '../components/icons';

const EMPTY = { regNo: '', name: '', type: 'Van', maxLoadKg: '', odometerKm: '', acquisitionCost: '', region: 'West' };

export default function Vehicles() {
  const { user } = useAuth();
  const canWrite = user.role === 'FLEET_MANAGER';
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  // topbar global search lands here as ?q=
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearch(q);
  }, [searchParams]);
  const [form, setForm] = useState(null);

  async function load() {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    try {
      setVehicles(await api.get(`/vehicles?${params}`));
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter, search]);

  const pager = usePager(vehicles, 8);

  async function save(e) {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/vehicles/${form.id}`, form);
        toast.success(`Vehicle ${form.regNo} updated.`);
      } else {
        await api.post('/vehicles', form);
        toast.success(`Vehicle ${form.regNo} registered.`);
      }
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message); // e.g. "A record with this reg_no already exists."
    }
  }

  async function remove(v) {
    if (!confirm(`Delete/retire ${v.name} (${v.regNo})?`)) return;
    try {
      const res = await api.del(`/vehicles/${v.id}`);
      toast.success(res.retired ? `${v.name} has trip history — marked as Retired.` : `${v.name} deleted.`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const count = (s) => vehicles.filter((v) => v.status === s).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Vehicle Management</h1>
          <p className="page-sub">Monitor, track, and manage your active fleet resources.</p>
        </div>
        <div className="filters">
          {canWrite && (
            <button className="btn btn-dark" onClick={() => setForm({ ...EMPTY })}>
              <IconPlus size={15} /> Add New Vehicle
            </button>
          )}
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon={<IconTruck />} tone="blue" label="Total Fleet" value={vehicles.length} />
        <KpiCard icon={<IconRoute />} tone="green" label="Active Units (On Trip)" value={count('ON_TRIP')} />
        <KpiCard icon={<IconWrench />} tone="red" label="Units in Maintenance" value={count('IN_SHOP')} />
        <KpiCard icon={<IconMoon />} tone="amber" label="Idle Units (Available)" value={count('AVAILABLE')} />
      </div>