import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const JWT_SECRET = 'fitpro-secret-2024';
const DB_PATH    = join(process.cwd(), 'src/data/users.json');

// ─── Simple password hash ──────────────────────────────────────────────────────
function hashPassword(pwd: string): string {
  return createHash('sha256').update(pwd + 'fitpro-salt').digest('hex');
}

// ─── In-file user store ────────────────────────────────────────────────────────
type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
  bio: string;
  weight: number | null;
  height: number | null;
  goal: string;
  trainerId: string | null;
  isActive: boolean;
  joinedAt: string;
};

function loadUsers(): UserRecord[] {
  if (!existsSync(DB_PATH)) return [];
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')); } catch { return []; }
}

function saveUsers(users: UserRecord[]): void {
  writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

async function makeTokens(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const access = await sign(
    { sub: userId, exp: now + 60 * 60 * 24 },       // 24h
    JWT_SECRET
  );
  const refresh = await sign(
    { sub: userId, exp: now + 60 * 60 * 24 * 30 },  // 30d
    JWT_SECRET
  );
  return { access, refresh };
}

function toPublic(u: UserRecord) {
  return {
    id:        u.id,
    name:      u.name,
    email:     u.email,
    role:      u.role,
    avatar:    u.avatar,
    bio:       u.bio,
    weight:    u.weight,
    height:    u.height,
    goal:      u.goal,
    trainer_id: u.trainerId,
    is_active: u.isActive,
    joined_at: u.joinedAt,
  };
}

// ─── Auth middleware ───────────────────────────────────────────────────────────
export async function authMiddleware(c: any, next: any) {
  const header = c.req.header('Authorization') ?? '';
  if (!header.startsWith('Bearer ')) {
    return c.json({ detail: 'No autenticado.' }, 401);
  }
  try {
    const payload = await verify(header.slice(7), JWT_SECRET, 'HS256') as any;
    const users   = loadUsers();
    const user    = users.find(u => u.id === payload.sub);
    if (!user || !user.isActive) return c.json({ detail: 'No autenticado.' }, 401);
    c.set('user',  user);
    c.set('users', users);
    await next();
  } catch {
    return c.json({ detail: 'Token inválido.' }, 401);
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const auth = new Hono();

// POST /api/v1/auth/register/
auth.post('/register/', async (c) => {
  const body  = await c.req.json().catch(() => ({}));
  const { name, email, password, role } = body as any;

  if (!name || !email || !password)
    return c.json({ detail: 'Nombre, email y contraseña son requeridos.' }, 400);
  if (password.length < 6)
    return c.json({ detail: 'La contraseña debe tener al menos 6 caracteres.' }, 400);

  const users = loadUsers();
  if (users.find(u => u.email === email.toLowerCase()))
    return c.json({ detail: 'Ya existe una cuenta con ese email.' }, 400);

  const user: UserRecord = {
    id:        makeId(),
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    password:  hashPassword(password),
    role:      ['client','trainer','admin'].includes(role) ? role : 'client',
    avatar:    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    bio:       '',
    weight:    null,
    height:    null,
    goal:      '',
    trainerId: null,
    isActive:  true,
    joinedAt:  new Date().toISOString().slice(0, 10),
  };

  users.push(user);
  saveUsers(users);

  const tokens = await makeTokens(user.id);
  return c.json({ user: toPublic(user), ...tokens }, 201);
});

// POST /api/v1/auth/login/
auth.post('/login/', async (c) => {
  const body     = await c.req.json().catch(() => ({}));
  const { email, password } = body as any;

  const users = loadUsers();
  const user  = users.find(u => u.email === (email ?? '').toLowerCase());
  if (!user || user.password !== hashPassword(password ?? ''))
    return c.json({ detail: 'Credenciales incorrectas.' }, 401);
  if (!user.isActive)
    return c.json({ detail: 'Cuenta desactivada.' }, 403);

  const tokens = await makeTokens(user.id);
  return c.json({ user: toPublic(user), ...tokens });
});

// POST /api/v1/auth/refresh/
auth.post('/refresh/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  try {
    const payload = await verify((body as any).refresh ?? '', JWT_SECRET, 'HS256') as any;
    const users   = loadUsers();
    const user    = users.find(u => u.id === payload.sub);
    if (!user) return c.json({ detail: 'Token inválido.' }, 401);
    const tokens  = await makeTokens(user.id);
    return c.json(tokens);
  } catch {
    return c.json({ detail: 'Refresh token inválido.' }, 401);
  }
});

// POST /api/v1/auth/logout/
auth.post('/logout/', (c) => c.json({ detail: 'Sesión cerrada.' }));

// POST /api/v1/auth/forgot-password/
auth.post('/forgot-password/', async (c) => {
  return c.json({ detail: 'Si el email existe, recibirás un enlace de recuperación.' });
});

// POST /api/v1/auth/reset-password/
auth.post('/reset-password/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { uid, new_password } = body as any;
  if (!uid || !new_password)
    return c.json({ detail: 'Datos incompletos.' }, 400);

  const users = loadUsers();
  const idx   = users.findIndex(u => u.id === uid);
  if (idx < 0) return c.json({ detail: 'Usuario no encontrado.' }, 404);

  users[idx].password = hashPassword(new_password);
  saveUsers(users);
  return c.json({ detail: 'Contraseña actualizada exitosamente.' });
});

// POST /api/v1/auth/change-trainer/
auth.post('/change-trainer/', authMiddleware, async (c) => {
  const me    = c.get('user') as UserRecord;
  const users = c.get('users') as UserRecord[];
  const body  = await c.req.json().catch(() => ({}));
  const { action: act, trainer_id } = body as any;

  const idx = users.findIndex(u => u.id === me.id);
  if (act === 'cancel') {
    users[idx].trainerId = null;
  } else if (trainer_id) {
    const trainer = users.find(u => u.id === trainer_id && u.role === 'trainer');
    if (!trainer) return c.json({ detail: 'Entrenador no encontrado.' }, 404);
    users[idx].trainerId = trainer_id;
  }
  saveUsers(users);
  return c.json({ detail: 'Entrenador actualizado.' });
});

export default auth;
