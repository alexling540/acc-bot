const { firestore, database } = require('../firestore.js');
const Discord = require('discord.js');

function logError(guildId, error) {
  console.error(`[${guildId}] ${error}`);
}

function firestoreEmbedsRef(guildId) {
  return firestore.collection(`/servers/${guildId}/richEmbeds`);
}

function databaseEmbedRef(guildId) {
  return database.ref(guildId);
}

async function getEmbedData(message, embedId) {
  if (typeof embedId === 'undefined') {
    message.channel.send('No ``embed_id`` was given.');
    return null;
  }

  const embedDoc = await firestoreEmbedsRef(message.guild.id).doc(embedId).get();
  if (!embedDoc.exists) {
    message.channel.send(`No such embed with id ${embedId}.`);
    return null;
  }
  return embedDoc.data();
}

function help(message) {
  const embed = new Discord.MessageEmbed()
    .setTitle('$embed Help')
    .setDescription('Documentation for subcommands related to embed. Callable using ``$embed [subcommand] [*args]``')
    .addFields(
      {
        name: 'list',
        value: 'Lists all embeds for this server.',
        inline: false
      },
      {
        name: 'queue [embed_id] [time]',
        value: 'Queues the embed with the given ``embed_id``, if it exists, to be automatically ' +
          'sent at the given ``time``.',
        inline: false
      },
      {
        name: 'show [embed_id]',
        value: 'Shows the embed with the given ``embed_id``, if it exists.',
        inline: false
      },
      {
        name: 'new',
        value: 'Creates a new embed, and immediately begin editing it.',
        inline: false
      },
      {
        name: 'edit [embed_id]',
        value: 'Begins editing the embed with the given ``embed_id``, if it exists.',
        inline: false
      },
      {
        name: 'save',
        value: 'Saves the currently edited embed, if it exists.',
        inline: false
      },
      {
        name: 'delete [embed_id]',
        value: 'Deletes the embed with the given ``embed_id``, if it exists. Provides ' +
          'a preview of the embed and a confirmation message before deletion. This action ' +
          'is **NOT** reversible!',
        inline: false
      },
      {
        name: 'add [field_name] [args]',
        value: 'Adds a field to the currently edited embed, if it exists.',
        inline: false
      },
      {
        name: 'update [field_name] [args]',
        value: 'Updates a field in the currently edited embed, if it exists.',
        inline: false
      },
      {
        name: 'remove [field_name]',
        value: 'Removes a field from the currently edited embed, if it exists.',
        inline: false
      }
    );

  message.channel.send(embed);
}

// work on making a better list
async function list(message) {
  const embedCollection = await firestoreEmbedsRef(message.guild.id).get();

  let msg = '';
  let x = 0;
  embedCollection.forEach((doc) => {
    x += 1;
    msg += `${x}.\t${doc.id}\n`;
  });

  message.channel.send(msg);
}

// work on this queue
async function queue(message, args) {

}

async function show(message, args) {
  const embedId = args[0];
  const embedDocData = await getEmbedData(message, embedId);

  if (embedDocData !== null) {
    message.channel.send({ embed : embedDocData.data })
      .catch(err => logError(message.guild.id, err));
  }
}

async function new_(message) {

}

async function edit(message, args) {
  const guildId = message.guild.id;

  const snapshot = await database.ref(guildId).once('value');
  if (snapshot.exists()) {
    message.channel.send('There is already an embed being edited, save that embed before editing another.')
      .catch(err => logError(guildId, err));
    return;
  }

  const embedId = args[0];
  const embedDocData = await getEmbedData(message, embedId);

  if (embedDocData !== null) {
    database.ref(guildId).set({
      id: embedId,
      ...embedDocData
    }).then(() => {
      message.channel.send(`Now editing embed with id ${embedId}.`)
        .catch(err => logError(guildId, err));
    }).catch((err) => {
      logError(guildId, err);
    });
  }
}

async function save(message) {
  const guildId = message.guild.id;
  const ref = database.ref(guildId);

  const snapshot = await ref.once('value');
  if (!snapshot.exists()) {
    message.channel.send('There is no embed being edited, try editing an embed before trying to save.')
      .catch(err => logError(guildId, err));
    return;
  }

  const edit = snapshot.val();
  
  try {
    await firestoreEmbedsRef(guildId).doc(edit.id).set({
      data: edit.data,
      metadata: edit.metadata
    }).catch(err => logError(guildId, err));
  } catch(err) {
    logError(guildId, err);
    return;
  }
  await ref.remove()
    .catch(err => logError(guildId, err));
  message.channel.send(`Successfully saved embed with id ${edit.id}.`)
    .catch(err => logError(guildId, err));
}

async function delete_(message, args) {
  const embedId = args[0];
  const guildId = message.guild.id;
  const userId = message.member.id;
  const embedDocData = await getEmbedData(message, embedId);

  if (embedDocData !== null) {
    await message.channel.send(JSON.stringify(embedDocData.metadata), { embed: embedDocData.data })
      .catch(err => logError(guildId, err));
    const msg = await message.channel.send('Are you sure you want to delete this embed?')
      .catch(err => logError(guildId, err));

    await msg.react('✔️').catch(err => logError(guildId, err));
    await msg.react('❌').catch(err => logError(guildId, err));

    const filter = (reaction, user) => ['✔️',  '❌'].includes(reaction.emoji.name) && user.id == userId;
    await msg.awaitReactions(filter, { max: 1, time: 15000 }).then(async (collection) => {
      const reaction = collection.first();

      if (reaction.emoji.name === '✔️') {
        await firestoreEmbedsRef(guildId).doc(embedId).delete()
          .catch(err => logError(guildId, err));
        await msg.channel.send('Embed deleted.')
          .catch(err => logError(guildId, err));
      } else {
        await msg.channel.send('Embed deletion cancelled.')
          .catch(err => logError(guildId, err));
      }
    }).catch(() => {
      msg.channel.send('No response. Embed deletion cancelled.')
        .catch(err => logError(guildId, err));
    });
    msg.reactions.removeAll()
      .catch(err => logError(guildId, err));
  }
}

module.exports = {
  name: 'embed',
  execute(message, args) {
    const subcommand = args.shift();

    switch (subcommand) {
      case 'help':
        help(message);
        break;
      case 'list':
        list(message);
        break;
      case 'queue':
        queue(message, args);
        break;
      case 'show':
        show(message, args);
        break;
      case 'new':
        new_(message);
        break;
      case 'edit':
        edit(message, args);
        break;
      case 'save':
        save(message);
        break;
      case 'delete':
        delete_(message, args);
        break;
      case 'add':
        break;
      case 'update':
        break;
      case 'delete':
        break;
      default:
        message.channel.send('Hmm, that\'s not a command, try $embed help.')
          .catch(err => logError(guildId, err));
    }
  }
}