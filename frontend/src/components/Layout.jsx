import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  IconGrid, IconRoute, IconTruck, IconUser, IconWrench, IconWallet,
  IconChart, IconBell, IconSearch, IconPlus, IconLogout, IconMoon, IconSun,
  IconAlert, IconCalendar,
} from './icons';

// hideFor: RBAC — Drivers have no access to Fuel Logs / Expenses
const NAV = [
  { to: '/', label: 'Dashboard', icon: <IconGrid /> },
  { to: '/trips', label: 'Trips', icon: <IconRoute /> },
  { to: '/vehicles', label: 'Vehicles', icon: <IconTruck /> },
  { to: '/drivers', label: 'Drivers', icon: <IconUser /> },
  { to: '/maintenance', label: 'Maintenance', icon: <IconWrench /> },
  { to: '/expenses', label: 'Expenses', icon: <IconWallet />, hideFor: ['DRIVER'] },
  { to: '/reports', label: 'Reports', icon: <IconChart /> },
];

// Role-specific quick action in the sidebar
const CTA = {
  FLEET_MANAGER: { label: 'Log New Maintenance', to: '/maintenance' },
  DRIVER: { label: 'New Trip', to: '/trips' },
  SAFETY_OFFICER: { label: 'Add Driver', to: '/drivers' },
  FINANCIAL_ANALYST: { label: 'View Reports', to: '/reports' },
};

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('transitops_theme') || 'light');
  const [menu, setMenu] = useState(null); // null | 'bell' | 'profile'
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const topRightRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('transitops_theme', theme);
  }, [theme]);

  // Live notifications from real data — refreshed on route change
  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/drivers'), api.get('/maintenance?status=OPEN'), api.get('/trips?status=DRAFT')])
      .then(([drivers, maint, drafts]) => {
        if (!alive) return;
        const now = new Date();
        setAlerts([
          ...drivers
            .filter((d) => new Date(d.licenseExpiry) < now)
            .map((d) => ({ tone: 'red', icon: <IconAlert size={16} />, title: 'License expired', desc: `${d.name} is blocked from dispatch.` })),
          ...drivers
            .filter((d) => { const dd = daysUntil(d.licenseExpiry); return dd >= 0 && dd <= 30; })
            .map((d) => ({ tone: 'amber', icon: <IconCalendar size={16} />, title: 'License expiring soon', desc: `${d.name} — ${daysUntil(d.licenseExpiry)} days left.` })),
          ...drivers
            .filter((d) => d.status === 'SUSPENDED')
            .map((d) => ({ tone: 'red', icon: <IconUser size={16} />, title: 'Driver suspended', desc: `${d.name} (safety score ${d.safetyScore}).` })),
          ...maint.map((m) => ({ tone: 'amber', icon: <IconWrench size={16} />, title: 'Vehicle in shop', desc: `${m.vehicle.name} — ${m.title}.` })),
          ...drafts.map((t) => ({ tone: 'blue', icon: <IconRoute size={16} />, title: 'Trip awaiting dispatch', desc: `#${t.id} ${t.source} → ${t.destination}.` })),
        ]);
      })
      .catch(() => {}); // notifications are best-effort
    return () => { alive = false; };
  }, [menu === 'bell']);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e) {
      if (topRightRef.current && !topRightRef.current.contains(e.target)) setMenu(null);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
