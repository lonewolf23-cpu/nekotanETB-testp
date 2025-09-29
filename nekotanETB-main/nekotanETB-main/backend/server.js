require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const { initBot } = require('./telegramBot');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(bodyParser.json());

// Initialize telegram bot
const bot = initBot(process.env.TELEGRAM_TOKEN);

// --- API: messages ---
app.get('/api/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY received_at DESC LIMIT 200').all();
  res.json(rows);
});

// optional: fetch a message by id
app.get('/api/messages/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// --- API: users ---
app.get('/api/users', (req, res) => {
  const rows = db.prepare('SELECT * FROM users ORDER BY last_seen DESC').all();
  res.json(rows);
});

// --- API: commands ---
app.get('/api/commands', (req, res) => {
  const rows = db.prepare('SELECT * FROM commands ORDER BY name').all();
  res.json(rows);
});

app.post('/api/commands', (req, res) => {
  const { name, description, response } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const stmt = db.prepare('INSERT INTO commands (name, description, response) VALUES (?, ?, ?)');
  const info = stmt.run(name, description || null, response || null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/commands/:id', (req, res) => {
  const { name, description, response } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE commands SET name = ?, description = ?, response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const info = stmt.run(name, description || null, response || null, id);
  res.json({ changes: info.changes });
});

app.delete('/api/commands/:id', (req, res) => {
  const info = db.prepare('DELETE FROM commands WHERE id = ?').run(req.params.id);
  res.json({ changes: info.changes });
});

// --- API: send message (from dashboard) ---
app.post('/api/send', async (req, res) => {
  const { chat_id, text } = req.body;
  if (!chat_id || !text) return res.status(400).json({ error: 'chat_id and text required' });
  if (!bot) return res.status(500).json({ error: 'Bot not initialized. Check TELEGRAM_TOKEN.' });

  try {
    const sent = await bot.sendMessage(String(chat_id), String(text));
    res.json({ ok: true, result: sent });
  } catch (err) {
    console.error('send message error', err);
    res.status(500).json({ error: err.message });
  }
});

// --- API: analytics (simple counts) ---
app.get('/api/analytics', (req, res) => {
  const totalMsgs = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  res.json({
    total_messages: totalMsgs,
    total_users: totalUsers
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
