require('dotenv').config();
const fs = require('fs');
const { firestore } = require('./firestore.js');
const Discord = require('discord.js');

global.client = new Discord.Client();
client.commands = new Discord.Collection();

// Dynamically add commands
// https://github.com/discordjs/guide/tree/master/code-samples/command-handling/dynamic-commands
const prefix = '$';
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildCreate', async (guild) => {
  const serverRef = firestore.doc(`/servers/${guild.id}`);
  const snapshot = await serverRef.get();
  if (!snapshot.exists) {
    await serverRef.set({
      queuedEmbeds: []
    });
  }
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  try {
    await client.commands.get(command).execute(message, args);
  } catch (err) {
    console.error(`[${message.guild.id}] ${err}`);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(process.env.BOT_TOKEN);