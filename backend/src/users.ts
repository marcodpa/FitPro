import { Hono } from 'hono';
import { authMiddleware } from './auth';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const DB_PATH = join(process.cwd(), 'src/data/users.json');

type UserRecord = {
  id: string; name: string; email: string; password: string; role: string;
  avatar: string; bio: string; weight: number | null; height: number | null;
  goal: string; trainerId: string | null; isActive: boolean; joinedAt: string;
  following?: string[];
};

function loadUsers(): UserRecord[] {
  if (!existsSync(DB_PATH)) return [];
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')); } catch { return []; }
}
function saveUsers(u: UserRecord[]) { writeFileSync(DB_PATH, JSON.stringify(u, null, 2)); }

function toPublic(u: UserRecord) {
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    avatar: u.avatar, bio: u.bio, weight: u.weight, height: u.height,
    goal: u.goal, trainer_id: u.trainerId, is_active: u.isActive, joined_at: u.joinedAt,
  };
}

const users = new Hono();
users.use('*', authMiddleware);

// GET /api/v1/users/me/  PATCH /api/v1/users/me/
users.get('/me/', (c) => {
  return c.json(toPublic(c.get('user') as UserRecord));
});

users.patch('/me/', async (c) => {
  const me   = c.get('user') as UserRecord;
  const body = await c.req.json().catch(() => ({})) as any;
  const all  = loadUsers();
  const idx  = all.findIndex(u => u.id === me.id);
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  const allowed = ['name','bio','weight','height','goal','avatar'];
  allowed.forEach(k => { if (body[k] !== undefined) (all[idx] as any)[k] = body[k]; });
  saveUsers(all);
  return c.json(toPublic(all[idx]));
});

// GET /api/v1/users/  (list — admin/trainer)
users.get('/', (c) => {
  const me = c.get('user') as UserRecord;
  if (!['admin','trainer'].includes(me.role)) return c.json({ detail: 'Sin permiso.' }, 403);
  return c.json(loadUsers().map(toPublic));
});

// GET /api/v1/users/:id/
users.get('/:id/', (c) => {
  const all  = loadUsers();
  const user = all.find(u => u.id === c.req.param('id'));
  if (!user) return c.json({ detail: 'No encontrado.' }, 404);
  return c.json(toPublic(user));
});

// GET /api/v1/users/my-clients/
users.get('/my-clients/', (c) => {
  const me  = c.get('user') as UserRecord;
  const all = loadUsers();
  return c.json(all.filter(u => u.trainerId === me.id).map(toPublic));
});

// POST /api/v1/users/:id/follow/
users.post('/:id/follow/', (c) => {
  const me    = c.get('user') as UserRecord;
  const all   = loadUsers();
  const meIdx = all.findIndex(u => u.id === me.id);
  const target= all.find(u => u.id === c.req.param('id'));
  if (!target) return c.json({ detail: 'No encontrado.' }, 404);
  if (!all[meIdx].following) all[meIdx].following = [];
  const fi = all[meIdx].following!.indexOf(target.id);
  let following: boolean;
  if (fi >= 0) { all[meIdx].following!.splice(fi, 1); following = false; }
  else         { all[meIdx].following!.push(target.id); following = true; }
  saveUsers(all);
  const followers_count = all.filter(u => u.following?.includes(target.id)).length;
  return c.json({ following, followers_count });
});

// GET /api/v1/users/following/
users.get('/following/', (c) => {
  const me  = c.get('user') as UserRecord;
  const all = loadUsers();
  return c.json((me.following ?? []).map(id => toPublic(all.find(u => u.id === id)!)).filter(Boolean));
});

// POST /api/v1/users/:id/approve-trainer/
users.post('/:id/approve-trainer/', (c) => {
  const me  = c.get('user') as UserRecord;
  if (me.role !== 'admin') return c.json({ detail: 'Solo admins.' }, 403);
  const all = loadUsers();
  const idx = all.findIndex(u => u.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  all[idx].role = 'trainer';
  saveUsers(all);
  return c.json(toPublic(all[idx]));
});

// POST /api/v1/users/:id/reject-trainer/
users.post('/:id/reject-trainer/', (c) => {
  const me = c.get('user') as UserRecord;
  if (me.role !== 'admin') return c.json({ detail: 'Solo admins.' }, 403);
  return c.json({ detail: 'Solicitud rechazada.' });
});

// POST /api/v1/users/change-password/
users.post('/change-password/', async (c) => {
  const me   = c.get('user') as UserRecord;
  const body = await c.req.json().catch(() => ({})) as any;
  const { old_password, new_password } = body;
  const hash = (p: string) => createHash('sha256').update(p + 'fitpro-salt').digest('hex');
  if (me.password !== hash(old_password ?? ''))
    return c.json({ old_password: 'Incorrecta.' }, 400);
  const all = loadUsers();
  const idx = all.findIndex(u => u.id === me.id);
  all[idx].password = hash(new_password);
  saveUsers(all);
  return c.json({ detail: 'Contraseña actualizada.' });
});

export default users;
