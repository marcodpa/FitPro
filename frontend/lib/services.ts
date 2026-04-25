/**
 * services.ts — Todas las llamadas al backend Django real.
 * Mantiene las mismas firmas que antes para que el resto del código no cambie.
 */
import { api, apiGet, apiPost, apiPatch, apiDelete, TokenStorage } from './api';
import type {
  User, UserRole, Routine, WorkoutSession,
  Conversation, ChatMessage, Post, Comment,
  Payment, Plan, Exercise, CalendarDay,
} from './types';

// ─── Helpers de mapeo (snake_case → camelCase) ────────────────────────────────

function mapUser(d: any): User {
  return {
    id:        String(d.id),
    name:      d.name,
    email:     d.email,
    role:      d.role as UserRole,
    avatar:    d.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${d.name}`,
    bio:       d.bio ?? '',
    weight:    d.weight ?? null,
    height:    d.height ?? null,
    goal:      d.goal ?? '',
    trainerId: d.trainer ? String(d.trainer) : undefined,
    joinedAt:  d.joined_at ? d.joined_at.split('T')[0] : '',
  };
}

function mapRoutine(d: any): Routine {
  return {
    id:          String(d.id),
    name:        d.name,
    description: d.description,
    trainerId:   d.trainer ? String(d.trainer) : '',
    userId:      d.assigned_to ? String(d.assigned_to) : undefined,
    assignedTo:  d.assigned_to ? [String(d.assigned_to)] : [],
    exercises:   (d.exercises ?? []).map((e: any) => ({
      exerciseId: String(e.exercise?.id ?? e.exercise),
      exercise: e.exercise && typeof e.exercise === 'object' ? {
        id:          String(e.exercise.id),
        name:        e.exercise.name,
        category:    e.exercise.category,
        muscle:      e.exercise.muscle,
        difficulty:  e.exercise.difficulty,
        description: e.exercise.description ?? '',
        imageUrl:    e.exercise.image_url ?? '',
        instructions: e.exercise.instructions ?? [],
      } : { id: String(e.exercise), name: '', category: '', muscle: '', difficulty: 'beginner', description: '', imageUrl: '', instructions: [] },
      sets: (e.sets ?? []).map((s: any) => ({
        reps: s.reps, weight: s.weight, duration: s.duration, rest: s.rest ?? 60,
      })),
      notes: e.notes ?? '',
    })),
    duration:   d.duration,
    difficulty: d.difficulty,
    category:   d.category,
    imageUrl:   d.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    createdAt:  d.created_at ? d.created_at.split('T')[0] : '',
  };
}

function mapSession(d: any): WorkoutSession {
  return {
    id:          String(d.id),
    routineId:   d.routine ? String(d.routine) : '',
    routine:     d.routine_detail ? mapRoutine(d.routine_detail) : ({} as any),
    userId:      d.user ? String(d.user) : '',
    date:        d.date,
    completedAt: d.completed_at ?? undefined,
    duration:    d.duration,
    notes:       d.notes ?? '',
    status:      d.status === 'abandoned' ? 'skipped' : d.status,
  };
}

function mapConversation(d: any): Conversation {
  return {
    id:           String(d.id),
    participants: (d.participants ?? []).map(mapUser),
    lastMessage:  d.last_message ? mapMessage(d.last_message) : undefined,
    updatedAt:    d.updated_at,
    unreadCount:  d.unread_count ?? 0,
  };
}

function mapMessage(d: any): ChatMessage {
  return {
    id:             String(d.id),
    conversationId: String(d.conversation),
    senderId:       d.sender ? String(d.sender?.id ?? d.sender) : '',
    text:           d.text,
    sentAt:         d.sent_at,
    readAt:         d.read_at ?? undefined,
    type:           d.msg_type === 'routine' ? 'routine' : d.msg_type === 'image' ? 'image' : 'text',
    routineId:      d.routine ? String(d.routine) : undefined,
  };
}

function mapPost(d: any): Post {
  return {
    id:        String(d.id),
    authorId:  d.author ? String(d.author?.id ?? d.author) : '',
    author:    d.author && typeof d.author === 'object' ? mapUser(d.author) : ({} as any),
    text:      d.text,
    imageUrl:  d.image_url ?? undefined,
    likes:     (d.likes ?? []).map((u: any) => String(u?.id ?? u)),
    comments:  (d.comments ?? []).map((c: any) => ({
      id:        String(c.id),
      authorId:  c.author ? String(c.author?.id ?? c.author) : '',
      author:    c.author && typeof c.author === 'object' ? mapUser(c.author) : ({} as any),
      text:      c.text,
      createdAt: c.created_at,
    })),
    createdAt:  d.created_at,
    routineId:  d.routine ? String(d.routine) : undefined,
  };
}

function mapPayment(d: any): Payment {
  return {
    id:       String(d.id),
    userId:   d.user ? String(d.user) : '',
    amount:   d.amount,
    currency: d.currency ?? 'USD',
    status:   d.status === 'paid' ? 'validated' : d.status,
    plan:     d.plan_name ?? d.plan ?? '',
    date:     d.date,
    dueDate:  d.due_date ?? '',
    receipt:  d.receipt ?? undefined,
  };
}

function mapExercise(d: any): Exercise {
  return {
    id:           String(d.id),
    name:         d.name,
    category:     d.category,
    muscle:       d.muscle,
    difficulty:   d.difficulty,
    description:  d.description ?? '',
    imageUrl:     d.image_url ?? '',
    instructions: d.instructions ?? [],
  };
}

function mapCalendarDay(d: any): CalendarDay {
  return {
    date:        d.date,
    hasWorkout:  !!d.session,
    workoutId:   d.session ? String(d.session) : undefined,
    workoutName: d.routine_name ?? undefined,
    status:      d.status ?? undefined,
  };
}

// ─── Paginación helper ────────────────────────────────────────────────────────
function results<T>(data: any, mapper: (d: any) => T): T[] {
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list.map(mapper);
}

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
export const FakeAuthService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await apiPost<any>('/auth/login/', { email, password });
    await TokenStorage.set(data.access, data.refresh);
    return { user: mapUser(data.user), token: data.access };
  },
  async register(
    nameOrPayload: string | (Partial<User> & { password: string }),
    email?: string,
    password?: string,
    role?: string,
  ): Promise<{ user: User; token: string }> {
    let body: any;
    if (typeof nameOrPayload === 'string') {
      body = { name: nameOrPayload, email, password, password2: password, role: role ?? 'client' };
    } else {
      body = {
        name: nameOrPayload.name,
        email: nameOrPayload.email,
        password: nameOrPayload.password,
        password2: nameOrPayload.password,
        role: nameOrPayload.role ?? 'client',
      };
    }
    const data = await api<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    });
    await TokenStorage.set(data.access, data.refresh);
    return { user: mapUser(data.user), token: data.access };
  },
  async forgotPassword(email: string): Promise<void> {
    await api('/auth/forgot-password/', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true });
  },
  async logout(): Promise<void> {
    try {
      const refresh = await TokenStorage.getRefresh();
      if (refresh) await apiPost('/auth/logout/', { refresh });
    } catch {}
    await TokenStorage.clear();
  },
};

// ─── USER SERVICE ─────────────────────────────────────────────────────────────
export const FakeUserService = {
  async getMe(): Promise<User> {
    const d = await apiGet<any>('/users/me/');
    return mapUser(d);
  },
  async getById(id: string): Promise<User> {
    const d = await apiGet<any>(`/users/${id}/`);
    return mapUser(d);
  },
  async getAll(): Promise<User[]> {
    const d = await apiGet<any>('/users/');
    return results(d, mapUser);
  },
  async getTrainerClients(_trainerId: string): Promise<User[]> {
    const d = await apiGet<any>('/users/my-clients/');
    return results(d, mapUser);
  },
  async updateProfile(_id: string, data: Partial<User>): Promise<User> {
    const body: any = {};
    if (data.name)   body.name   = data.name;
    if (data.bio)    body.bio    = data.bio;
    if (data.weight) body.weight = data.weight;
    if (data.height) body.height = data.height;
    if (data.goal)   body.goal   = data.goal;
    if (data.avatar) body.avatar = data.avatar;
    const d = await apiPatch<any>('/users/me/', body);
    return mapUser(d);
  },
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiPost('/users/change-password/', { old_password: oldPassword, new_password: newPassword });
  },
  async changeTrainer(action: 'change' | 'cancel', trainerId?: string): Promise<void> {
    await apiPost('/auth/change-trainer/', { action, trainer_id: trainerId });
  },
  async blockUser(userId: string): Promise<{ is_active: boolean }> {
    return api<any>(`/auth/block-user/${userId}/`, { method: 'POST' });
  },
  async searchUsers(query: string): Promise<User[]> {
    const d = await apiGet<any>(`/users/?search=${encodeURIComponent(query)}`);
    return results(d, mapUser);
  },
};

// ─── ROUTINE SERVICE ──────────────────────────────────────────────────────────
export const FakeRoutineService = {
  async getAll(): Promise<Routine[]> {
    const d = await apiGet<any>('/routines/');
    return results(d, mapRoutine);
  },
  async getById(id: string): Promise<Routine> {
    const d = await apiGet<any>(`/routines/${id}/`);
    return mapRoutine(d);
  },
  async getByUserId(_userId: string): Promise<Routine[]> {
    // El backend filtra automáticamente por el usuario autenticado
    const d = await apiGet<any>('/routines/');
    return results(d, mapRoutine);
  },
  async getByTrainerId(_trainerId: string): Promise<Routine[]> {
    const d = await apiGet<any>('/routines/mis-rutinas/');
    return results(d, mapRoutine);
  },
  async create(data: Partial<Routine>): Promise<Routine> {
    const body: any = {
      name:        data.name,
      description: data.description ?? '',
      duration:    data.duration ?? 45,
      difficulty:  data.difficulty ?? 'intermediate',
      category:    data.category ?? 'strength',
      image_url:   data.imageUrl ?? '',
    };
    const d = await apiPost<any>('/routines/', body);
    const routine = mapRoutine(d);
    // Asignar a clientes si se seleccionaron
    if (data.assignedTo && data.assignedTo.length > 0) {
      for (const clientId of data.assignedTo) {
        try { await apiPost(`/routines/${routine.id}/assign/`, { client_id: clientId }); } catch {}
      }
    }
    return routine;
  },
  async assignToClients(routineId: string, clientIds: string[]): Promise<void> {
    for (const clientId of clientIds) {
      await apiPost(`/routines/${routineId}/assign/`, { client_id: clientId });
    }
  },
};

// ─── WORKOUT SERVICE ──────────────────────────────────────────────────────────
export const FakeWorkoutService = {
  async getTodayWorkout(_userId: string): Promise<WorkoutSession | null> {
    try {
      const d = await apiGet<any>('/workouts/today/');
      return mapSession(d);
    } catch { return null; }
  },
  async getHistory(_userId: string): Promise<WorkoutSession[]> {
    const d = await apiGet<any>('/workouts/history/');
    return results(d, mapSession);
  },
  async complete(sessionId: string, duration?: number): Promise<WorkoutSession> {
    const d = await apiPost<any>(`/workouts/${sessionId}/complete/`, { duration });
    return mapSession(d);
  },
  async create(routineId: string): Promise<WorkoutSession> {
    const d = await apiPost<any>('/workouts/', { routine: routineId });
    return mapSession(d);
  },
};

// ─── EXERCISE SERVICE ─────────────────────────────────────────────────────────
export const FakeExerciseService = {
  async getAll(): Promise<Exercise[]> {
    const d = await apiGet<any>('/exercises/');
    return results(d, mapExercise);
  },
  async getById(id: string): Promise<Exercise> {
    const d = await apiGet<any>(`/exercises/${id}/`);
    return mapExercise(d);
  },
  async getByCategory(category: string): Promise<Exercise[]> {
    const url = category === 'Todos' ? '/exercises/' : `/exercises/?category=${category}`;
    const d = await apiGet<any>(url);
    return results(d, mapExercise);
  },
  async create(data: Partial<Exercise>): Promise<Exercise> {
    const body: any = {
      name:         data.name,
      description:  data.description ?? '',
      category:     data.category ?? 'Fuerza',
      muscle:       data.muscle ?? '',
      difficulty:   data.difficulty ?? 'beginner',
      image_url:    data.imageUrl ?? '',
      instructions: data.instructions ?? [],
    };
    const d = await apiPost<any>('/exercises/', body);
    return mapExercise(d);
  },
  async delete(id: string): Promise<void> {
    await apiDelete(`/exercises/${id}/`);
  },
};

// ─── CHAT SERVICE ─────────────────────────────────────────────────────────────
export const FakeChatService = {
  async getConversations(_userId: string): Promise<Conversation[]> {
    const d = await apiGet<any>('/chat/');
    return results(d, mapConversation);
  },
  async getConversationWith(_userId: string, otherUserId: string): Promise<Conversation | null> {
    try {
      const all = await FakeChatService.getConversations('');
      return all.find((c) => c.participants.some((p) => p.id === otherUserId)) ?? null;
    } catch { return null; }
  },
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const d = await apiGet<any>(`/chat/${conversationId}/messages/`);
    return results(d, mapMessage);
  },
  async sendMessage(data: Omit<ChatMessage, 'id' | 'sentAt'>): Promise<ChatMessage> {
    const d = await apiPost<any>(`/chat/${data.conversationId}/messages/`, {
      text: data.text, msg_type: data.type ?? 'text',
    });
    return mapMessage(d);
  },
  async editMessage(conversationId: string, messageId: string, text: string): Promise<ChatMessage> {
    const d = await apiPatch<any>(`/chat/${conversationId}/messages/${messageId}/`, { text });
    return mapMessage(d);
  },
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiDelete(`/chat/${conversationId}/messages/${messageId}/`);
  },
  async createConversation(participantId: string): Promise<Conversation> {
    const d = await apiPost<any>('/chat/', { participants: [participantId] });
    return mapConversation(d);
  },
};

// ─── SOCIAL SERVICE ───────────────────────────────────────────────────────────
export const FakeSocialService = {
  async getFeed(): Promise<Post[]> {
    const d = await apiGet<any>('/social/');
    return results(d, mapPost);
  },
  async getById(id: string): Promise<Post> {
    const d = await apiGet<any>(`/social/${id}/`);
    return mapPost(d);
  },
  async create(data: Partial<Post>): Promise<Post> {
    const d = await apiPost<any>('/social/', { text: data.text, image_url: data.imageUrl });
    return mapPost(d);
  },
  async toggleLike(postId: string, _userId: string): Promise<Post> {
    const d = await apiPost<any>(`/social/${postId}/like/`);
    return mapPost(d);
  },
  async updatePost(postId: string, data: { text: string }): Promise<Post> {
    const d = await apiPatch<any>(`/social/${postId}/`, { text: data.text });
    return mapPost(d);
  },
  async deletePost(postId: string): Promise<void> {
    await apiDelete(`/social/${postId}/`);
  },
  async addComment(postId: string, data: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const d = await apiPost<any>(`/social/${postId}/comment/`, { text: data.text });
    return {
      id:        String(d.id),
      authorId:  d.author ? String(d.author?.id ?? d.author) : '',
      author:    d.author && typeof d.author === 'object' ? mapUser(d.author) : data.author,
      text:      d.text,
      createdAt: d.created_at,
    };
  },
};

// ─── PAYMENT SERVICE ──────────────────────────────────────────────────────────
export const FakePaymentService = {
  async getByUserId(_userId: string): Promise<Payment[]> {
    const d = await apiGet<any>('/payments/payments/');
    return results(d, mapPayment);
  },
  async getAll(): Promise<Payment[]> {
    const d = await apiGet<any>('/payments/payments/');
    return results(d, mapPayment);
  },
  async getPlans(): Promise<Plan[]> {
    const d = await apiGet<any>('/payments/plans/');
    return results(d, (p: any) => ({
      id:       String(p.id),
      name:     p.name,
      price:    p.price,
      currency: p.currency ?? 'USD',
      period:   p.period,
      features: p.features ?? [],
      isActive: p.is_active,
    }));
  },
  async submitPayment(data: Partial<Payment>): Promise<Payment> {
    const d = await apiPost<any>('/payments/payments/', {
      plan: data.plan, amount: data.amount, currency: data.currency ?? 'USD',
    });
    return mapPayment(d);
  },
  async validatePayment(id: string): Promise<Payment> {
    const d = await apiPost<any>(`/payments/payments/${id}/validate/`);
    return mapPayment(d);
  },
};

// ─── CALENDAR SERVICE ─────────────────────────────────────────────────────────
export const FakeCalendarService = {
  async getCalendar(_userId: string): Promise<CalendarDay[]> {
    const now = new Date();
    const d = await apiGet<any>(`/calendar/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
    return results(d, mapCalendarDay);
  },
};

// ─── Aliases (compatibilidad con el resto del código) ─────────────────────────
export const AuthService     = FakeAuthService;
export const UserService     = FakeUserService;
export const RoutineService  = FakeRoutineService;
export const WorkoutService  = FakeWorkoutService;
export const ExerciseService = FakeExerciseService;
export const ChatService     = FakeChatService;
export const SocialService   = FakeSocialService;
export const PaymentService  = FakePaymentService;
export const CalendarService = FakeCalendarService;
