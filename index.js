const fs = require('fs');
const { botConfig } = require('./config.js');
const { firestore } = require('./firestore.js');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Dynamically add commands
// https://github.com/discordjs/guide/tree/master/code-samples/command-handling/dynamic-commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const prefix = botConfig.prefix;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildCreate', async (guild) => {
  await firestore.doc(`/servers/${guild.id}`).set();
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  try {
    await client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(botConfig.clientId);