// End-to-end test of every mandatory business rule + the RBAC matrix, against the live API.
// Run with the backend up:  npm run test:e2e
const BASE = 'http://localhost:5000/api';
let token = '';
const req = async (method, path, body) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
};
const login = async (email) => {
  const r = await req('POST', '/auth/login', { email, password: 'Password@123' });
  token = r.data.token;
  return r;
};
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

// ---------- 1. Auth validation ----------
let r = await req('POST', '/auth/login', { email: 'manager@transitops.com', password: 'wrong' });
check('Wrong password rejected (401)', r.status === 401);
r = await req('POST', '/auth/login', { email: 'not-an-email', password: 'x' });
check('Invalid email format rejected (400)', r.status === 400, r.data.error);
r = await req('POST', '/auth/register', { name: 'X', email: 'bad-email', password: 'Password@123', role: 'DRIVER' });
check('Signup: invalid email rejected (400)', r.status === 400, r.data.error);
r = await req('POST', '/auth/register', { name: 'X', email: 'x@y.com', password: 'short', role: 'DRIVER' });
check('Signup: short password rejected (400)', r.status === 400, r.data.error);
r = await req('POST', '/auth/register', { name: 'X', email: 'manager@transitops.com', password: 'Password@123', role: 'DRIVER' });
check('Signup: duplicate email rejected (409)', r.status === 409, r.data.error);
r = await login('manager@transitops.com');
check('Manager login works', r.status === 200 && !!r.data.token);

// ---------- 2. Seeded lookups ----------
const vehicles = (await req('GET', '/vehicles')).data;
const drivers = (await req('GET', '/drivers')).data;
const van = vehicles.find((v) => v.regNo === 'GJ01AB1234');
const alex = drivers.find((d) => d.name === 'Alex Kumar');
const expired = drivers.find((d) => d.name === 'Ravi Expired');
const suspended = drivers.find((d) => d.name === 'Sunil Suspended');
const retired = vehicles.find((v) => v.status === 'RETIRED');

// ---------- 3. Vehicle rules (as Fleet Manager) ----------
r = await req('POST', '/vehicles', { regNo: 'GJ01AB1234', name: 'Dup', type: 'Van', maxLoadKg: 100, acquisitionCost: 1 });
check('Duplicate reg no rejected (409)', r.status === 409, r.data.error);
