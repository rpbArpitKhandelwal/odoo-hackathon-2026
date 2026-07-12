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
