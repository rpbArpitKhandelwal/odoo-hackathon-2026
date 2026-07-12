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
