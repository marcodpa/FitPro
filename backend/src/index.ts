import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import auth from './auth';
import users from './users';
import routes from './routes';

// Ensure data directory exists
try { mkdirSync(join(process.cwd(), 'src/data'), { recursive: true }); } catch {}

const app = new Hono();

// Enable CORS for all routes
app.use(
  '*',
  cors({
    credentials: true,
    origin: (origin) => origin || '*',
  })
);

app.get('/', (c) => c.text('FitPro API v1'));

app.get('/descargar-manual', (c) => {
  try {
    const file = readFileSync(join(process.cwd(), '../manual-interfaces-fitpro.docx'));
    return new Response(file, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Manual-Interfaces-FitPro.docx"',
      },
    });
  } catch {
    return c.text('Archivo no encontrado', 404);
  }
});

// ─── API v1 routes ─────────────────────────────────────────────────────────────
app.route('/api/v1/auth',  auth);
app.route('/api/v1/users', users);
app.route('/api/v1',       routes);

// Catch-all for unmapped routes — return 404 JSON
app.all('/api/*', (c) => c.json({ detail: 'Endpoint no encontrado.' }, 404));

const port = Number(process.env.PORT) || 3002;

export default {
  fetch: app.fetch,
  port,
};
