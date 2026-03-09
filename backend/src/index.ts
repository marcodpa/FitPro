import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = new Hono();


// Enable CORS for all routes
app.use(
  '*',
  cors({
    credentials: true,
    origin: (origin) => origin || '*',
  })
);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

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

export default {
  fetch: app.fetch,
  port: 3002,
};
