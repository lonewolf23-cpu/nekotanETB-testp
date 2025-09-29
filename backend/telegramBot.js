const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

function initBot(token) {
  if (!token) {
    console.warn('TELEGRAM_TOKEN not provided. Telegram bot will not run.');
    return null;
  }

  // Use polling (simple). For production you may prefer webhooks.
  const bot = new TelegramBot(token, { polling: true });

  // Helper prepared statements
  const insertMessage = db.prepare(`INSERT INTO messages (tg_id, from_user, chat_id, text, raw_json) VALUES (?, ?, ?, ?, ?)`); 
  const upsertUser = db.prepare(`
    INSERT INTO users (tg_id, username, first_name, last_name, last_seen)
    VALUES (@tg_id, @username, @first_name, @last_name, @last_seen)
    ON CONFLICT(tg_id) DO UPDATE SET
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      last_seen = excluded.last_seen;
  `);

  bot.on('message', (msg) => {
    try {
      const tgId = String(msg.message_id || '');
      const fromUser = msg.from ? (msg.from.username || `${msg.from.first_name || ''} ${msg.from.last_name || ''}`) : 'unknown';
      const chatId = String(msg.chat && msg.chat.id || '');
      const text = msg.text || JSON.stringify(msg);

      // store message
      insertMessage.run(tgId, fromUser, chatId, text, JSON.stringify(msg));

      // upsert user
      if (msg.from) {
        upsertUser.run({
          tg_id: String(msg.from.id),
          username: msg.from.username || null,
          first_name: msg.from.first_name || null,
          last_name: msg.from.last_name || null,
          last_seen: new Date().toISOString()
        });
      }

      // basic auto-reply for demo: check commands table
      const cmd = db.prepare("SELECT * FROM commands WHERE name = ? LIMIT 1").get(text && text.split(' ')[0]);
      if (cmd) {
        bot.sendMessage(chatId, cmd.response || 'Command received.');
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('Polling error', err);
  });

  console.log('Telegram bot initialized.');
  return bot;
}

module.exports = { initBot };
