// index.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const Database = require('better-sqlite3');
const path = require('path');

// Inicializa el cliente de Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Carga la base de datos (frases.db en la raíz o carpeta db)
const db = new Database(path.join(__dirname, 'frases.db'));

// Verifica que la tabla exista, si no la crea
db.prepare(`
  CREATE TABLE IF NOT EXISTS frases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenido TEXT NOT NULL,
    fecha TEXT NOT NULL,   -- formato: AAAA-MM-DD
    hora TEXT NOT NULL,    -- formato: HH:mm
    canal_id TEXT NOT NULL -- canal donde se enviará
  )
`).run();

// Función para enviar frases si coinciden con la fecha y hora actual
function verificarYEnviarFrases() {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0, 10); // yyyy-mm-dd
  const hora = ahora.toTimeString().slice(0, 5);  // HH:mm

  const frases = db.prepare('SELECT * FROM frases WHERE fecha = ? AND hora = ?').all(fecha, hora);

  frases.forEach(frase => {
    const canal = client.channels.cache.get(frase.canal_id);
    if (canal) {
      canal.send(frase.contenido).catch(console.error);
    } else {
      console.warn(`Canal no encontrado: ${frase.canal_id}`);
    }
  });
}

// Cron para verificar frases cada minuto
cron.schedule('* * * * *', verificarYEnviarFrases);

// Cuando el bot esté listo
client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// Inicia sesión con el token de Discord
client.login(process.env.DISCORD_TOKEN);
