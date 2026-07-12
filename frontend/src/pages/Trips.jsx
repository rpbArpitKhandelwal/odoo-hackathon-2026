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