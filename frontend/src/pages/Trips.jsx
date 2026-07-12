import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import { usePager, Pager } from '../components/Pagination';
import { IconRoute, IconTruck, IconTrend, IconAlert, IconPlus } from '../components/icons';

const EMPTY = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' };

export default function Trips() {
  const { user } = useAuth();
  // RBAC: Driver owns the trip lifecycle; Fleet Manager has full access
  const canManage = ['DRIVER', 'FLEET_MANAGER'].includes(user.role);
  const [trips, setTrips] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(null);
  const [completing, setCompleting] = useState(null);

  async function load() {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    try {
      setTrips(await api.get(`/trips${params}`));
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  const pager = usePager(trips, 8);

  async function openCreate() {
    try {
      const [v, d] = await Promise.all([api.get('/vehicles?available=true'), api.get('/drivers?assignable=true')]);
      setVehicles(v);
      setDrivers(d);
      setForm({ ...EMPTY });
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function createTrip(e) {
    e.preventDefault();
    try {
      await api.post('/trips', form);
      setForm(null);
      toast.success('Trip created as Draft. Dispatch it when ready.');
      load();
    } catch (err) {
      toast.error(err.message); // e.g. "Cargo 550 kg exceeds Van-05's capacity of 500 kg"
    }
  }

  async function act(trip, action, body = {}) {
    try {
      await api.post(`/trips/${trip.id}/${action}`, body);
      const messages = {
        dispatch: `Trip #${trip.id} dispatched — ${trip.vehicle.name} and ${trip.driver.name} are now On Trip.`,
        complete: `Trip #${trip.id} completed — vehicle and driver are Available again.`,
        cancel: `Trip #${trip.id} cancelled${trip.status === 'DISPATCHED' ? ' — vehicle and driver restored to Available.' : '.'}`,
      };
      toast.success(messages[action]);
      setCompleting(null);
      load();
    } catch (err) {
      toast.error(err.message); // e.g. "Ravi Expired's license expired on 2026-06-12"
    }
  }

  function completeSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    act(completing, 'complete', {
      endOdometerKm: Number(f.get('endOdometerKm')),
      fuelLiters: Number(f.get('fuelLiters')) || 0,
      fuelCost: Number(f.get('fuelCost')) || 0,
      revenue: Number(f.get('revenue')) || 0,
    });
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const selectedVehicle = vehicles.find((v) => v.id === Number(form?.vehicleId));
  const count = (s) => trips.filter((t) => t.status === s).length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Trip Management</h1>
          <p className="page-sub">Create, dispatch, and track deliveries with automated validation.</p>
        </div>
        {canManage && (
          <button className="btn btn-dark" onClick={openCreate}>
            <IconPlus size={15} /> New Trip
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <KpiCard icon={<IconRoute />} tone="blue" label="On Route" value={count('DISPATCHED')} sub="Currently dispatched" />
        <KpiCard icon={<IconAlert />} tone="amber" label="Pending (Draft)" value={count('DRAFT')} sub="Awaiting dispatch" />
        <KpiCard icon={<IconTrend />} tone="green" label="Completed" value={count('COMPLETED')} sub="Successfully delivered" />
        <KpiCard icon={<IconTruck />} tone="red" label="Cancelled" value={count('CANCELLED')} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Trip Ledger</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>