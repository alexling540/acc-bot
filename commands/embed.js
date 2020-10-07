const { firestore, database } = require('../firestore.js');
const Discord = require('discord.js');

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
        name: 'add',
        value: 'Adds a field to the currently edited embed, if it exists.',
        inline: false
      },
      {
        name: 'update',
        value: 'Updates a field in the currently edited embed, if it exists.',
        inline: false
      },
      {
        name: 'remove',
        value: 'Removes a field from the currently edited embed, if it exists.',
        inline: false
      }
    );

  message.channel.send(embed);
}

// work on making a better list
async function list(message) {
  const embedCollection = await firestore.collection(`/servers/${message.guild.id}/announcements`).get();

  let msg = '';
  embedCollection.forEach((doc, index) => {
    console.log(index);
    msg += `${index+1}.\t${doc.id}\n`;
  });

  message.channel.send(msg);
}

// work on this queue
async function queue(message, args) {

}

async function show(message, args) {
  const embedId = args[0];

  if (typeof embedId === 'undefined') {
    message.channel.send('No ``embed_id`` was given.');
    return;
  }

  const embedDoc = await firestore.doc(`/servers/${message.guild.id}/announcements/${embedId}`).get();
  if (!embedDoc.exists) {
    message.channel.send(`No such embed with id ${embedId}.`);
  } else {
    const embedDocData = embedDoc.data();
    const embedData = embedDocData.data;
    message.channel.send({ embed : embedData });
  }
}

async function edit(message, args) {
  const snapshot = await database.ref(message.guild.id).once('value');
  if (snapshot.exists()) {
    message.channel.send('There is already an embed being edited, save that embed before editing another.');
    return;
  }

  const embedId = args[0];
  if (typeof embedId === 'undefined') {
    message.channel.send('No ``embed_id`` was given.');
    return;
  }

  const embedDoc = await firestore.doc(`/servers/${message.guild.id}/announcements/${embedId}`).get();
  if (!embedDoc.exists) {
    message.channel.send(`No such embed with id ${embedId}.`);
  } else {
    const embedDocData = embedDoc.data();

    database.ref(message.guild.id).set({
      id: embedId,
      ...embedDocData
    }).then(() => {
      message.channel.send(`Now editing embed with id ${embedId}.`);
    }).catch((err) => {
      message.channel.send(JSON.stringify(err));
    });
  }
}

async function save(message) {
  const ref = database.ref(message.guild.id);

  const snapshot = await ref.once('value');
  if (!snapshot.exists()) {
    message.channel.send('There is no embed being edited, try editing an embed before trying to save.');
    return;
  }

  const edit = snapshot.val();
  
  // TODO: make this not promise hell
  firestore.doc(`servers/${message.guild.id}/announcements/${edit.id}`).update({
    data: edit.data,
    metadata: edit.metadata
  }).then(() => {
    ref.remove();
    message.channel.send(`Successfully saved ${edit.id}`);
  }).catch((err) => {
    message.channel.send(JSON.stringify(err));
  });
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
        break;
      case 'edit':
        edit(message, args);
        break;
      case 'save':
        save(message);
        break;
      case 'delete':
        break;
      case 'add':
        break;
      case 'update':
        break;
      case 'delete':
        break;
      default:
        message.channel.send('Hmm, that\'s not a command, try $embed help.');
    }
  }
}