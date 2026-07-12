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