// Run once to seed initial data: bun run src/data/seed.ts
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

mkdirSync(join(process.cwd(), 'src/data'), { recursive: true });

const exercises = [
  { id: 'e1', name: 'Press de banca', category: 'Fuerza', muscle: 'Pecho', difficulty: 'intermediate', description: 'Ejercicio clásico de pecho con barra', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', instructions: ['Acuéstate en el banco', 'Agarra la barra con agarre medio', 'Baja la barra al pecho', 'Empuja hacia arriba'] },
  { id: 'e2', name: 'Sentadilla', category: 'Fuerza', muscle: 'Cuádriceps', difficulty: 'intermediate', description: 'El rey de los ejercicios de piernas', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', instructions: ['Coloca la barra en los trapecios', 'Baja controlando la espalda', 'Mantén las rodillas alineadas', 'Sube explosivamente'] },
  { id: 'e3', name: 'Peso muerto', category: 'Fuerza', muscle: 'Espalda baja', difficulty: 'advanced', description: 'Ejercicio compuesto para espalda y piernas', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', instructions: ['Pies a ancho de caderas', 'Agarra la barra', 'Espalda recta, levanta', 'Baja controlado'] },
  { id: 'e4', name: 'Dominadas', category: 'Fuerza', muscle: 'Espalda', difficulty: 'intermediate', description: 'Ejercicio de tracción con peso corporal', image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400', instructions: ['Agarre supino o prono', 'Cuelga con brazos extendidos', 'Sube hasta la barbilla sobre la barra', 'Baja controlado'] },
  { id: 'e5', name: 'Press militar', category: 'Fuerza', muscle: 'Hombros', difficulty: 'intermediate', description: 'Press de hombros con barra', image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400', instructions: ['De pie, barra a nivel de hombros', 'Empuja hacia arriba', 'Extiende completamente', 'Baja controlado'] },
  { id: 'e6', name: 'Curl de bíceps', category: 'Fuerza', muscle: 'Bíceps', difficulty: 'beginner', description: 'Flexión de codo con mancuernas', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', instructions: ['De pie, mancuernas a los lados', 'Flexiona los codos', 'Sube hasta contraer', 'Baja lentamente'] },
  { id: 'e7', name: 'Plancha', category: 'Cardio', muscle: 'Core', difficulty: 'beginner', description: 'Ejercicio isométrico de core', image_url: 'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400', instructions: ['Apóyate en antebrazos y puntas', 'Cuerpo recto', 'Contrae el abdomen', 'Mantén la posición'] },
  { id: 'e8', name: 'Burpees', category: 'Cardio', muscle: 'Full body', difficulty: 'intermediate', description: 'Ejercicio cardiovascular total', image_url: 'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=400', instructions: ['De pie', 'Salta al suelo', 'Haz una flexión', 'Salta hacia arriba'] },
  { id: 'e9', name: 'Zancadas', category: 'Fuerza', muscle: 'Glúteos', difficulty: 'beginner', description: 'Ejercicio de piernas unilateral', image_url: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400', instructions: ['De pie, paso adelante', 'Baja la rodilla trasera', 'Empuja para volver', 'Alterna piernas'] },
  { id: 'e10', name: 'Remo con barra', category: 'Fuerza', muscle: 'Espalda', difficulty: 'intermediate', description: 'Ejercicio de jalón horizontal', image_url: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=400', instructions: ['Inclinado hacia adelante', 'Agarra la barra', 'Tira hacia el abdomen', 'Baja lentamente'] },
];

writeFileSync(join(process.cwd(), 'src/data/exercises.json'), JSON.stringify(exercises, null, 2));
writeFileSync(join(process.cwd(), 'src/data/routines.json'), JSON.stringify([], null, 2));
writeFileSync(join(process.cwd(), 'src/data/workouts.json'), JSON.stringify([], null, 2));
writeFileSync(join(process.cwd(), 'src/data/payments.json'), JSON.stringify([], null, 2));
writeFileSync(join(process.cwd(), 'src/data/plans.json'), JSON.stringify([
  { id: 'p1', name: 'Básico', price: 29.99, currency: 'USD', period: 'monthly', features: ['Acceso a rutinas básicas', 'Seguimiento de progreso', 'Soporte por email'], is_active: true },
  { id: 'p2', name: 'Pro', price: 59.99, currency: 'USD', period: 'monthly', features: ['Todo lo del plan básico', 'Entrenador personal', 'Nutrición personalizada', 'Chat con entrenador'], is_active: true },
  { id: 'p3', name: 'Elite', price: 99.99, currency: 'USD', period: 'monthly', features: ['Todo lo del plan Pro', 'Sesiones 1-a-1', 'Plan de comidas semanal', 'Soporte 24/7', 'Análisis de composición corporal'], is_active: true },
], null, 2));
writeFileSync(join(process.cwd(), 'src/data/posts.json'), JSON.stringify([], null, 2));
writeFileSync(join(process.cwd(), 'src/data/conversations.json'), JSON.stringify([], null, 2));

console.log('Seeded!');
