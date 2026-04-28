// Mock data and types for the fitness app

export type UserRole = 'user' | 'client' | 'trainer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  weight: number;
  height: number;
  goal: string;
  trainerId?: string;
  joinedAt: string;
  followersCount?: number;
  followingCount?: number;
  clientsCount?: number;
  trainerRequestPending?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  imageUrl: string;
  videoUrl?: string;
  instructions: string[];
}

export interface WorkoutSet {
  reps: number;
  weight?: number;
  duration?: number;
  rest: number;
  completed?: boolean;
}

export interface RoutineExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  userId?: string;
  assignedTo?: string[];   // client user IDs this routine is assigned to
  exercises: RoutineExercise[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routine: Routine;
  userId: string;
  date: string;
  completedAt?: string;
  duration: number;
  notes?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  readAt?: string;
  type: 'text' | 'routine' | 'image';
  routineId?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  updatedAt: string;
  unreadCount?: number;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  text: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  routineId?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'validated' | 'rejected' | 'expired';
  plan: string;
  date: string;
  dueDate: string;
  receipt?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  isActive: boolean;
}

export interface CalendarDay {
  date: string;
  hasWorkout: boolean;
  workoutId?: string;
  workoutName?: string;
  status?: 'planned' | 'completed' | 'skipped';
}
