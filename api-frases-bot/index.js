import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Obtener todas las frases
app.get('/frases', (req, res) => {
  const frases = db.prepare('SELECT * FROM frases ORDER BY fecha_programada, hora_programada').all();
  res.json(frases);
});

// Obtener la próxima frase programada y no enviada
app.get('/frasedeldia', (req, res) => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split('T')[0];
  const hora = ahora.toTimeString().split(':').slice(0, 2).join(':');
  const frase = db.prepare(`
    SELECT * FROM frases 
    WHERE enviada = 0 AND fecha_programada <= ? AND hora_programada <= ?
    ORDER BY fecha_programada ASC, hora_programada ASC
    LIMIT 1
  `).get(fecha, hora);
  res.json({ frase: frase?.texto || null });
});

// Agregar una nueva frase
app.post('/frases', (req, res) => {
  const { texto, autor, fecha_programada, hora_programada } = req.body;
  const stmt = db.prepare('INSERT INTO frases (texto, autor, fecha_programada, hora_programada) VALUES (?, ?, ?, ?)');
  stmt.run(texto, autor, fecha_programada, hora_programada);
  res.status(201).json({ ok: true });
});

// Eliminar una frase
app.delete('/frases/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM frases WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ ok: true });
});

// Marcar frase como enviada
app.put('/frases/:id/enviar', (req, res) => {
  const stmt = db.prepare('UPDATE frases SET enviada = 1 WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ API corriendo en el puerto ${PORT}`);
});
