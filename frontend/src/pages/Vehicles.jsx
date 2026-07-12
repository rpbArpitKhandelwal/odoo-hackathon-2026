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