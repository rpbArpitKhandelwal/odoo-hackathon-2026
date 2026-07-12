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