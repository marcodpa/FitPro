/**
 * routes.ts — All non-auth API routes (exercises, routines, workouts, payments, social, chat, calendar)
 */
import { Hono } from 'hono';
import { authMiddleware } from './auth';
import { load, save, makeId } from './db';

const api = new Hono();
api.use('*', authMiddleware);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMe(c: any) { return c.get('user') as any; }

// ─── EXERCISES ────────────────────────────────────────────────────────────────
api.get('/exercises/', (c) => {
  const cat = c.req.query('category');
  let data = load<any>('exercises.json');
  if (cat && cat !== 'Todos') data = data.filter((e: any) => e.category === cat);
  return c.json(data);
});

api.get('/exercises/:id/', (c) => {
  const data = load<any>('exercises.json');
  const item = data.find((e: any) => e.id === c.req.param('id'));
  if (!item) return c.json({ detail: 'No encontrado.' }, 404);
  return c.json(item);
});

api.post('/exercises/', async (c) => {
  const me = getMe(c);
  if (me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('exercises.json');
  const item = { id: makeId(), ...body };
  data.push(item);
  save('exercises.json', data);
  return c.json(item, 201);
});

api.patch('/exercises/:id/', async (c) => {
  const me = getMe(c);
  if (me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('exercises.json');
  const idx = data.findIndex((e: any) => e.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  data[idx] = { ...data[idx], ...body };
  save('exercises.json', data);
  return c.json(data[idx]);
});

api.delete('/exercises/:id/', (c) => {
  const me = getMe(c);
  if (me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  const data = load<any>('exercises.json');
  const filtered = data.filter((e: any) => e.id !== c.req.param('id'));
  save('exercises.json', filtered);
  return new Response(null, { status: 204 });
});

// ─── ROUTINES ─────────────────────────────────────────────────────────────────
api.get('/routines/', (c) => {
  const me = getMe(c);
  const trainerId = c.req.query('trainer');
  let data = load<any>('routines.json');
  if (trainerId) {
    data = data.filter((r: any) => r.trainer === trainerId);
  } else if (me.role === 'client') {
    data = data.filter((r: any) => r.assigned_to === me.id || r.trainer === me.trainerId);
  } else if (me.role === 'trainer') {
    data = data.filter((r: any) => r.trainer === me.id);
  }
  return c.json(data);
});

api.get('/routines/:id/', (c) => {
  const data = load<any>('routines.json');
  const item = data.find((r: any) => r.id === c.req.param('id'));
  if (!item) return c.json({ detail: 'No encontrado.' }, 404);
  return c.json(item);
});

api.post('/routines/', async (c) => {
  const me = getMe(c);
  if (me.role === 'client') return c.json({ detail: 'Sin permisos.' }, 403);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('routines.json');
  const item = {
    id: makeId(),
    trainer: me.id,
    exercises: [],
    created_at: new Date().toISOString(),
    ...body,
  };
  data.push(item);
  save('routines.json', data);
  return c.json(item, 201);
});

api.patch('/routines/:id/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('routines.json');
  const idx = data.findIndex((r: any) => r.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  if (me.role === 'client') return c.json({ detail: 'Sin permisos.' }, 403);
  data[idx] = { ...data[idx], ...body };
  save('routines.json', data);
  return c.json(data[idx]);
});

api.delete('/routines/:id/', (c) => {
  const me = getMe(c);
  const data = load<any>('routines.json');
  const item = data.find((r: any) => r.id === c.req.param('id'));
  if (!item) return c.json({ detail: 'No encontrado.' }, 404);
  if (me.role === 'client') return c.json({ detail: 'Sin permisos.' }, 403);
  save('routines.json', data.filter((r: any) => r.id !== c.req.param('id')));
  return new Response(null, { status: 204 });
});

api.post('/routines/:id/assign/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('routines.json');
  const idx = data.findIndex((r: any) => r.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  data[idx].assigned_to = (body as any).client_id;
  save('routines.json', data);
  return c.json(data[idx]);
});

// ─── WORKOUTS ─────────────────────────────────────────────────────────────────
api.get('/workouts/today/', (c) => {
  const me = getMe(c);
  const today = new Date().toISOString().slice(0, 10);
  const data = load<any>('workouts.json');
  const session = data.find((w: any) => w.user === me.id && w.date === today && w.status !== 'completed');
  if (!session) return c.json({ detail: 'No hay sesión hoy.' }, 404);
  // Attach routine detail
  const routines = load<any>('routines.json');
  session.routine_detail = routines.find((r: any) => r.id === session.routine) ?? null;
  return c.json(session);
});

api.get('/workouts/history/', (c) => {
  const me = getMe(c);
  const data = load<any>('workouts.json');
  const sessions = data.filter((w: any) => w.user === me.id);
  const routines = load<any>('routines.json');
  return c.json(sessions.map((s: any) => ({
    ...s,
    routine_detail: routines.find((r: any) => r.id === s.routine) ?? null,
  })));
});

api.post('/workouts/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const { routine, date } = body as any;
  const data = load<any>('workouts.json');
  const item = {
    id: makeId(),
    user: me.id,
    routine,
    date: date ?? new Date().toISOString().slice(0, 10),
    status: 'pending',
    duration: null,
    completed_at: null,
    notes: '',
  };
  data.push(item);
  save('workouts.json', data);
  const routines = load<any>('routines.json');
  return c.json({ ...item, routine_detail: routines.find((r: any) => r.id === routine) ?? null }, 201);
});

api.post('/workouts/:id/complete/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('workouts.json');
  const idx = data.findIndex((w: any) => w.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  data[idx].status = 'completed';
  data[idx].completed_at = new Date().toISOString();
  data[idx].duration = (body as any).duration ?? data[idx].duration;
  save('workouts.json', data);
  const routines = load<any>('routines.json');
  return c.json({ ...data[idx], routine_detail: routines.find((r: any) => r.id === data[idx].routine) ?? null });
});

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
api.get('/calendar/', (c) => {
  const me = getMe(c);
  const year = parseInt(c.req.query('year') ?? String(new Date().getFullYear()));
  const month = parseInt(c.req.query('month') ?? String(new Date().getMonth() + 1));
  const data = load<any>('workouts.json');
  const routines = load<any>('routines.json');
  const userSessions = data.filter((w: any) => w.user === me.id);
  const days: any[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const session = userSessions.find((s: any) => s.date === dateStr);
    const routine = session ? routines.find((r: any) => r.id === session.routine) : null;
    days.push({
      date: dateStr,
      session: session?.id ?? null,
      routine_name: routine?.name ?? null,
      status: session?.status ?? null,
    });
  }
  return c.json(days);
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
api.get('/payments/plans/', (c) => {
  return c.json(load<any>('plans.json'));
});

api.get('/payments/payments/', (c) => {
  const me = getMe(c);
  const data = load<any>('payments.json');
  if (me.role === 'admin') return c.json(data);
  return c.json(data.filter((p: any) => p.user === me.id));
});

api.post('/payments/payments/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('payments.json');
  const plans = load<any>('plans.json');
  const plan = plans.find((p: any) => p.id === (body as any).plan || p.name === (body as any).plan);
  const item = {
    id: makeId(),
    user: me.id,
    plan: plan?.id ?? (body as any).plan,
    plan_name: plan?.name ?? (body as any).plan,
    amount: (body as any).amount ?? plan?.price ?? 0,
    currency: (body as any).currency ?? 'USD',
    status: 'pending',
    date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    receipt: null,
  };
  data.push(item);
  save('payments.json', data);
  return c.json(item, 201);
});

api.post('/payments/payments/:id/validate/', (c) => {
  const me = getMe(c);
  if (me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  const data = load<any>('payments.json');
  const idx = data.findIndex((p: any) => p.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  data[idx].status = 'paid';
  save('payments.json', data);
  return c.json(data[idx]);
});

api.post('/payments/payments/:id/reject/', async (c) => {
  const me = getMe(c);
  if (me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('payments.json');
  const idx = data.findIndex((p: any) => p.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  data[idx].status = 'rejected';
  data[idx].notes = (body as any).notes ?? '';
  save('payments.json', data);
  return c.json(data[idx]);
});

api.post('/payments/payments/:id/upload-receipt/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('payments.json');
  const idx = data.findIndex((p: any) => p.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  data[idx].receipt = (body as any).receipt_url;
  save('payments.json', data);
  return c.json(data[idx]);
});

// ─── SOCIAL ───────────────────────────────────────────────────────────────────
function enrichPost(post: any, users: any[]) {
  const author = users.find((u: any) => u.id === post.author);
  return {
    ...post,
    author: author ? toPublicUser(author) : null,
    comments: (post.comments ?? []).map((cm: any) => {
      const cAuthor = users.find((u: any) => u.id === cm.author);
      return { ...cm, author: cAuthor ? toPublicUser(cAuthor) : null };
    }),
  };
}

function toPublicUser(u: any) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, bio: u.bio, weight: u.weight, height: u.height, goal: u.goal, trainer_id: u.trainerId, is_active: u.isActive, joined_at: u.joinedAt };
}

api.get('/social/', (c) => {
  const posts = load<any>('posts.json');
  const users = load<any>('users.json');
  return c.json(posts.map((p: any) => enrichPost(p, users)).reverse());
});

api.get('/social/:id/', (c) => {
  const posts = load<any>('posts.json');
  const users = load<any>('users.json');
  const post = posts.find((p: any) => p.id === c.req.param('id'));
  if (!post) return c.json({ detail: 'No encontrado.' }, 404);
  return c.json(enrichPost(post, users));
});

api.post('/social/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('posts.json');
  const item = {
    id: makeId(),
    author: me.id,
    text: (body as any).text ?? '',
    image_url: (body as any).image_url ?? null,
    likes: [],
    comments: [],
    created_at: new Date().toISOString(),
  };
  data.push(item);
  save('posts.json', data);
  const users = load<any>('users.json');
  return c.json(enrichPost(item, users), 201);
});

api.patch('/social/:id/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('posts.json');
  const idx = data.findIndex((p: any) => p.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  if (data[idx].author !== me.id && me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  data[idx].text = (body as any).text ?? data[idx].text;
  save('posts.json', data);
  const users = load<any>('users.json');
  return c.json(enrichPost(data[idx], users));
});

api.delete('/social/:id/', (c) => {
  const me = getMe(c);
  const data = load<any>('posts.json');
  const item = data.find((p: any) => p.id === c.req.param('id'));
  if (!item) return c.json({ detail: 'No encontrado.' }, 404);
  if (item.author !== me.id && me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  save('posts.json', data.filter((p: any) => p.id !== c.req.param('id')));
  return new Response(null, { status: 204 });
});

api.post('/social/:id/like/', (c) => {
  const me = getMe(c);
  const data = load<any>('posts.json');
  const idx = data.findIndex((p: any) => p.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  const likes = data[idx].likes ?? [];
  const hasLiked = likes.includes(me.id);
  data[idx].likes = hasLiked ? likes.filter((id: string) => id !== me.id) : [...likes, me.id];
  save('posts.json', data);
  const users = load<any>('users.json');
  return c.json(enrichPost(data[idx], users));
});

api.post('/social/:id/comment/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const data = load<any>('posts.json');
  const idx = data.findIndex((p: any) => p.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  const comment = {
    id: makeId(),
    author: me.id,
    text: (body as any).text ?? '',
    created_at: new Date().toISOString(),
  };
  data[idx].comments = [...(data[idx].comments ?? []), comment];
  save('posts.json', data);
  const users = load<any>('users.json');
  const cAuthor = users.find((u: any) => u.id === me.id);
  return c.json({ ...comment, author: cAuthor ? toPublicUser(cAuthor) : null }, 201);
});

api.post('/social/:id/report/', (c) => c.json({ detail: 'Reporte enviado.' }));

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function enrichConversation(conv: any, users: any[], currentUserId: string) {
  return {
    ...conv,
    participants: (conv.participants ?? []).map((uid: string) => {
      const u = users.find((u: any) => u.id === uid);
      return u ? toPublicUser(u) : { id: uid };
    }),
    last_message: conv.messages?.length
      ? enrichMessage(conv.messages[conv.messages.length - 1], users)
      : null,
    unread_count: (conv.messages ?? []).filter((m: any) => m.sender !== currentUserId && !m.read_at).length,
  };
}

function enrichMessage(msg: any, users: any[]) {
  const sender = users.find((u: any) => u.id === msg.sender);
  return {
    ...msg,
    sender: sender ? toPublicUser(sender) : { id: msg.sender },
    conversation: msg.conversationId,
  };
}

api.get('/chat/', (c) => {
  const me = getMe(c);
  const convs = load<any>('conversations.json');
  const users = load<any>('users.json');
  const mine = convs.filter((conv: any) => (conv.participants ?? []).includes(me.id));
  return c.json(mine.map((conv: any) => enrichConversation(conv, users, me.id)));
});

api.post('/chat/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const participantId = (body as any).participants?.[0] ?? (body as any).participant;
  const convs = load<any>('conversations.json');
  const users = load<any>('users.json');
  // Check if conversation already exists
  const existing = convs.find((conv: any) =>
    conv.participants?.includes(me.id) && conv.participants?.includes(participantId)
  );
  if (existing) return c.json(enrichConversation(existing, users, me.id));
  const item = {
    id: makeId(),
    participants: [me.id, participantId],
    messages: [],
    updated_at: new Date().toISOString(),
  };
  convs.push(item);
  save('conversations.json', convs);
  return c.json(enrichConversation(item, users, me.id), 201);
});

api.get('/chat/:id/messages/', (c) => {
  const convs = load<any>('conversations.json');
  const users = load<any>('users.json');
  const conv = convs.find((cv: any) => cv.id === c.req.param('id'));
  if (!conv) return c.json({ detail: 'No encontrado.' }, 404);
  return c.json((conv.messages ?? []).map((m: any) => enrichMessage(m, users)));
});

api.post('/chat/:id/messages/', async (c) => {
  const me = getMe(c);
  const body = await c.req.json().catch(() => ({}));
  const convs = load<any>('conversations.json');
  const users = load<any>('users.json');
  const idx = convs.findIndex((cv: any) => cv.id === c.req.param('id'));
  if (idx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  const msg = {
    id: makeId(),
    conversationId: c.req.param('id'),
    sender: me.id,
    text: (body as any).text ?? '',
    msg_type: (body as any).msg_type ?? 'text',
    sent_at: new Date().toISOString(),
    read_at: null,
  };
  convs[idx].messages = [...(convs[idx].messages ?? []), msg];
  convs[idx].updated_at = new Date().toISOString();
  save('conversations.json', convs);
  return c.json(enrichMessage(msg, users), 201);
});

api.patch('/chat/:id/messages/:msgId/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const me = getMe(c);
  const convs = load<any>('conversations.json');
  const users = load<any>('users.json');
  const cIdx = convs.findIndex((cv: any) => cv.id === c.req.param('id'));
  if (cIdx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  const mIdx = convs[cIdx].messages.findIndex((m: any) => m.id === c.req.param('msgId'));
  if (mIdx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  if (convs[cIdx].messages[mIdx].sender !== me.id) return c.json({ detail: 'Sin permisos.' }, 403);
  convs[cIdx].messages[mIdx].text = (body as any).text ?? convs[cIdx].messages[mIdx].text;
  save('conversations.json', convs);
  return c.json(enrichMessage(convs[cIdx].messages[mIdx], users));
});

api.delete('/chat/:id/messages/:msgId/', (c) => {
  const me = getMe(c);
  const convs = load<any>('conversations.json');
  const cIdx = convs.findIndex((cv: any) => cv.id === c.req.param('id'));
  if (cIdx < 0) return c.json({ detail: 'No encontrado.' }, 404);
  const msg = convs[cIdx].messages?.find((m: any) => m.id === c.req.param('msgId'));
  if (!msg) return c.json({ detail: 'No encontrado.' }, 404);
  if (msg.sender !== me.id && me.role !== 'admin') return c.json({ detail: 'Sin permisos.' }, 403);
  convs[cIdx].messages = convs[cIdx].messages.filter((m: any) => m.id !== c.req.param('msgId'));
  save('conversations.json', convs);
  return new Response(null, { status: 204 });
});

export default api;
