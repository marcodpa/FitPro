import {
  MOCK_USERS,
  MOCK_ROUTINES,
  MOCK_SESSIONS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_POSTS,
  MOCK_PAYMENTS,
  MOCK_PLANS,
  MOCK_EXERCISES,
  MOCK_CALENDAR,
} from './mockData';
import type {
  User,
  UserRole,
  Routine,
  WorkoutSession,
  Conversation,
  ChatMessage,
  Post,
  Comment,
  Payment,
  Plan,
  Exercise,
  CalendarDay,
} from './types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
export const FakeAuthService = {
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(600);
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) throw new Error('Credenciales incorrectas');
    return { user, token: `fake-jwt-${user.id}-${Date.now()}` };
  },
  async register(data: Partial<User> & { password: string }): Promise<{ user: User; token: string }> {
    await delay(800);
    const user: User = {
      id: `u${Date.now()}`,
      name: data.name ?? 'Nuevo Usuario',
      email: data.email ?? '',
      role: (data.role as UserRole) ?? 'user',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      bio: '',
      weight: 70,
      height: 170,
      goal: 'Mejorar mi físico',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    return { user, token: `fake-jwt-${user.id}-${Date.now()}` };
  },
  async forgotPassword(_email: string): Promise<void> {
    await delay(500);
  },
  async logout(): Promise<void> {
    await delay(200);
  },
};

// ─── USER SERVICE ─────────────────────────────────────────────────────────────
export const FakeUserService = {
  async getById(id: string): Promise<User> {
    await delay();
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },
  async getAll(): Promise<User[]> {
    await delay();
    return MOCK_USERS;
  },
  async getTrainerClients(trainerId: string): Promise<User[]> {
    await delay();
    return MOCK_USERS.filter((u) => u.trainerId === trainerId);
  },
  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    await delay(600);
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new Error('Usuario no encontrado');
    return { ...user, ...data };
  },
};

// ─── ROUTINE SERVICE ──────────────────────────────────────────────────────────
export const FakeRoutineService = {
  async getAll(): Promise<Routine[]> {
    await delay();
    return MOCK_ROUTINES;
  },
  async getById(id: string): Promise<Routine> {
    await delay();
    const routine = MOCK_ROUTINES.find((r) => r.id === id);
    if (!routine) throw new Error('Rutina no encontrada');
    return routine;
  },
  async getByUserId(userId: string): Promise<Routine[]> {
    await delay();
    return MOCK_ROUTINES.filter((r) => r.userId === userId);
  },
  async getByTrainerId(trainerId: string): Promise<Routine[]> {
    await delay();
    return MOCK_ROUTINES.filter((r) => r.trainerId === trainerId);
  },
  async create(data: Partial<Routine>): Promise<Routine> {
    await delay(700);
    return {
      id: `r${Date.now()}`,
      name: data.name ?? 'Nueva Rutina',
      description: data.description ?? '',
      trainerId: data.trainerId ?? 't1',
      exercises: data.exercises ?? [],
      duration: data.duration ?? 45,
      difficulty: data.difficulty ?? 'intermediate',
      category: data.category ?? 'Fuerza',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      createdAt: new Date().toISOString().split('T')[0],
    };
  },
};

// ─── WORKOUT SERVICE ──────────────────────────────────────────────────────────
export const FakeWorkoutService = {
  async getTodayWorkout(userId: string): Promise<WorkoutSession | null> {
    await delay();
    const today = new Date().toISOString().split('T')[0];
    return MOCK_SESSIONS.find((s) => s.userId === userId && s.date === today) ?? null;
  },
  async getHistory(userId: string): Promise<WorkoutSession[]> {
    await delay();
    return MOCK_SESSIONS.filter((s) => s.userId === userId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  async complete(sessionId: string): Promise<WorkoutSession> {
    await delay(500);
    const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
    if (!session) throw new Error('Sesión no encontrada');
    return {
      ...session,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
  },
};

// ─── EXERCISE SERVICE ─────────────────────────────────────────────────────────
export const FakeExerciseService = {
  async getAll(): Promise<Exercise[]> {
    await delay();
    return MOCK_EXERCISES;
  },
  async getById(id: string): Promise<Exercise> {
    await delay();
    const ex = MOCK_EXERCISES.find((e) => e.id === id);
    if (!ex) throw new Error('Ejercicio no encontrado');
    return ex;
  },
  async getByCategory(category: string): Promise<Exercise[]> {
    await delay();
    if (category === 'Todos') return MOCK_EXERCISES;
    return MOCK_EXERCISES.filter((e) => e.category === category);
  },
};

// ─── CHAT SERVICE ─────────────────────────────────────────────────────────────
export const FakeChatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await delay();
    return MOCK_CONVERSATIONS.filter((c) =>
      c.participants.some((p) => p.id === userId)
    );
  },
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    await delay();
    return MOCK_MESSAGES.filter((m) => m.conversationId === conversationId).sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  },
  async sendMessage(data: Omit<ChatMessage, 'id' | 'sentAt'>): Promise<ChatMessage> {
    await delay(300);
    return {
      ...data,
      id: `m${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
  },
};

// ─── SOCIAL SERVICE ───────────────────────────────────────────────────────────
export const FakeSocialService = {
  async getFeed(): Promise<Post[]> {
    await delay();
    return MOCK_POSTS.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  async getById(id: string): Promise<Post> {
    await delay();
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (!post) throw new Error('Post no encontrado');
    return post;
  },
  async create(data: Partial<Post>): Promise<Post> {
    await delay(600);
    return {
      id: `p${Date.now()}`,
      authorId: data.authorId ?? 'u1',
      author: MOCK_USERS.find((u) => u.id === data.authorId) ?? MOCK_USERS[0],
      text: data.text ?? '',
      imageUrl: data.imageUrl,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
  },
  async toggleLike(postId: string, userId: string): Promise<Post> {
    await delay(200);
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (!post) throw new Error('Post no encontrado');
    const hasLiked = post.likes.includes(userId);
    return {
      ...post,
      likes: hasLiked ? post.likes.filter((id) => id !== userId) : [...post.likes, userId],
    };
  },
  async addComment(postId: string, data: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    await delay(400);
    return {
      ...data,
      id: `co${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  },
};

// ─── PAYMENT SERVICE ──────────────────────────────────────────────────────────
export const FakePaymentService = {
  async getByUserId(userId: string): Promise<Payment[]> {
    await delay();
    return MOCK_PAYMENTS.filter((p) => p.userId === userId);
  },
  async getAll(): Promise<Payment[]> {
    await delay();
    return MOCK_PAYMENTS;
  },
  async getPlans(): Promise<Plan[]> {
    await delay();
    return MOCK_PLANS;
  },
  async submitPayment(data: Partial<Payment>): Promise<Payment> {
    await delay(800);
    return {
      id: `pay${Date.now()}`,
      userId: data.userId ?? 'u1',
      amount: data.amount ?? 50,
      currency: 'USD',
      status: 'pending',
      plan: data.plan ?? 'Plan Premium - Mensual',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
  },
  async validatePayment(id: string): Promise<Payment> {
    await delay(500);
    const payment = MOCK_PAYMENTS.find((p) => p.id === id);
    if (!payment) throw new Error('Pago no encontrado');
    return { ...payment, status: 'validated' };
  },
};

// ─── CALENDAR SERVICE ─────────────────────────────────────────────────────────
export const FakeCalendarService = {
  async getCalendar(_userId: string): Promise<CalendarDay[]> {
    await delay();
    return MOCK_CALENDAR;
  },
};

// ─── REAL SERVICE ALIASES ─────────────────────────────────────────────────────
export const AuthService     = FakeAuthService;
export const UserService     = FakeUserService;
export const RoutineService  = FakeRoutineService;
export const WorkoutService  = FakeWorkoutService;
export const ExerciseService = FakeExerciseService;
export const ChatService     = FakeChatService;
export const SocialService   = FakeSocialService;
export const PaymentService  = FakePaymentService;
export const CalendarService = FakeCalendarService;
