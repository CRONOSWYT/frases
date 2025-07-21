const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const API_URL = process.env.API_URL; // Aquí tu web con las frases

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  enviarFraseDelDia(); // Enviar apenas inicie
  setInterval(enviarFraseDelDia, 24 * 60 * 60 * 1000); // Cada 24 horas
});

async function enviarFraseDelDia() {
  try {
    const canalId = process.env.CANAL_ID;
    const canal = await client.channels.fetch(canalId);

    const res = await fetch(`${API_URL}/frase-del-dia`);
    const data = await res.json();

    if (data.frase) {
      await canal.send(`📜 **Frase del día:**\n${data.frase}`);
    } else {
      await canal.send("⚠️ No hay frase para hoy.");
    }
  } catch (err) {
    console.error("❌ Error al enviar la frase:", err);
  }
}

client.login(DISCORD_TOKEN);
