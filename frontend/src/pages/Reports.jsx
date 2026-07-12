import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/client';
import KpiCard from '../components/KpiCard';
import { LineChart, Donut, BarList } from '../components/charts';
import { IconFuel, IconTrend, IconWallet, IconDownload } from '../components/icons';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Reports() {
  const [report, setReport] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/reports/vehicles'), api.get('/trips?status=COMPLETED')])
      .then(([r, t]) => {
        setReport(r);
        setTrips(t);
      })
      .catch((err) => toast.error(err.message));
  }, []);

  async function downloadCsv() {
    const token = localStorage.getItem('transitops_token');
    const res = await fetch('/api/reports/vehicles?format=csv', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'transitops-vehicle-report.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Fleet-level aggregates (real data)
  const totDistance = report.reduce((s, r) => s + r.distanceKm, 0);
  const totLiters = report.reduce((s, r) => s + r.fuelLiters, 0);
  const totFuelCost = report.reduce((s, r) => s + r.fuelCost, 0);
  const totMaint = report.reduce((s, r) => s + r.maintenanceCost, 0);
  const totOther = report.reduce((s, r) => s + r.otherExpenses, 0);
  const totRevenue = report.reduce((s, r) => s + r.revenue, 0);
  const avgEff = totLiters > 0 ? (totDistance / totLiters).toFixed(1) : '—';
  const costPerKm = totDistance > 0 ? ((totFuelCost + totMaint) / totDistance).toFixed(2) : '—';

  // Revenue by month (last 6 months) from completed trips