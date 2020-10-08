const firebase = require('firebase/app');
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
    message.channel.send(`No such embed with id \`\`${embedId}\`\`.`);
    return null;
  }
  return embedDoc.data();
}

async function setLastModified(guildId) {
  return databaseEmbedRef(guildId).child('metadata').child('lastModified').set(firebase.database.ServerValue.TIMESTAMP);
}

function help(message, args) {
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
async function listEmbeds(message) {
  const embedCollection = await firestoreEmbedsRef(message.guild.id).get();

  let msg = '';
  let x = 0;
  embedCollection.forEach((doc) => {
    x += 1;
    msg += `${x}.\t${doc.id}\n`;
  });

  message.channel.send(msg);
}

// TODO: work on this queue, use chron?
async function queueEmbed(message, args) {

}

async function showEmbed(message, args) {
  const embedId = args[0];
  const embedDocData = await getEmbedData(message, embedId);

  if (embedDocData !== null) {
    message.channel.send({ embed : embedDocData.data })
      .catch(err => logError(message.guild.id, err));
  }
}

async function newEmbed(message, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const embedId = args.shift();
  if (typeof embedId !== 'undefined') {

    const embedExists = (await firestoreEmbedsRef(message.guild.id).doc(embedId).get()).exists;
    if (embedExists) {
      message.channel.send(`Embed with id \`\`${embedId}\`\` already exists.`)
        .catch(err => logError(guildId, err));
      return;
    }
  }

  const newId = embedId || (await ref.push()).key.substring(1);
  try {
    await ref.update({
      id: newId,
      metadata: {
        lastModified: firebase.database.ServerValue.TIMESTAMP
      }
    });
    message.channel.send(`Embed with id \`\`${newId}\`\` created.`)
      .catch(err => logError(guildId, err));
  } catch(err) {
    message.channel.send('There was an issue creating a new embed.')
      .catch(err => logError(guildId, err));
    logError(guildId, err);
  }
}

async function editEmbed(message, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const snapshot = await ref.once('value');
  if (snapshot.exists()) {
    message.channel.send('There is already an embed being edited, save that embed before editing another.')
      .catch(err => logError(guildId, err));
    return;
  }

  const embedId = args[0];
  const embedDocData = await getEmbedData(message, embedId);

  if (embedDocData !== null) {
    try {
      await ref.set({
        id: embedId,
        ...embedDocData
      });
      await message.channel.send(`Now editing embed with id \`\`${embedId}\`\`.`)
        .catch(err => logError(guildId, err));
      message.channel.send({ embed: embedDocData.data })
        .catch(err => logError(guildId, err));
    } catch(err) {
      logError(guildId, err);
    };
  }
}

async function saveEmbed(message) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const snapshot = await ref.once('value');
  if (!snapshot.exists()) {
    message.channel.send('There is no embed being edited, try editing an embed before trying to save.')
      .catch(err => logError(guildId, err));
    return;
  }

  const edit = snapshot.val();
  
  try {
    let newData = {};
    if (typeof edit.data !== 'undefined') {
      newData = edit.data;
    }
    await firestoreEmbedsRef(guildId).doc(edit.id).set({
      data: newData,
      metadata: edit.metadata
    });
  } catch(err) {
    logError(guildId, err);
    message.channel.send('There was an error saving the document');
    return;
  }
  await ref.remove()
    .catch(err => logError(guildId, err));
  message.channel.send(`Successfully saved embed with id \`\`${edit.id}\`\`.`)
    .catch(err => logError(guildId, err));
}

async function deleteEmbed(message, args) {
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

async function setFieldMap(message, field, subcommands, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);
  const fieldRef = ref.child('data').child(field);

  const subcommand = args.shift();

  if (!subcommands.includes(subcommand)) {
    message.channel.send(`Invalid subcommand for setField ${field}`)
      .catch(err => logError(guildId, err));
  } else {
    try {
      await fieldRef.child(subcommand).set(args.join(' '));
      await setLastModified(guildId);
      return true;
    } catch(err) {
      message.channel.send('Error updating field.')
        .catch(err => logError(guildId, err));
      logError(guildId, err);
    }
  } 
  return false;
}

async function setFieldSingleWord(message, field, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);
  const fieldRef = ref.child('data').child(field);

  try {
    await fieldRef.set(args[0]);
    await setLastModified(guildId);
    return true;
  } catch(err) {
    message.channel.send('Error updating field.')
      .catch(err => logError(guildId, err));
    logError(guildId, err);
  }
  return false;
}

async function setFieldMultiWord(message, field, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);
  const fieldRef = ref.child('data').child(field);

  try {
    await fieldRef.set(args.join(' '));
    await setLastModified(guildId);
    return true;
  } catch (err) {
    message.channel.send('Error updating field.')
      .catch(err => logError(guildId, err));
    logError(guildId, err);
  }
  return false;
}

const validFields = ['author', 'color', 'description', 'footer', 'image', 'thumbnail', 'title', 'url'];

async function setField(message, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const snapshot = await ref.once('value');
  if (!snapshot.exists()) {
    message.channel.send('There is no embed being edited, try editing an embed before trying to add a field.')
      .catch(err => logError(guildId, err));
    return;
  }

  const field = args.shift();
  if (typeof field === 'undefined' || !validFields.includes(field)) {
    message.channel.send('There is no such field.')
      .catch(err => logError(guildId, err));
    return;
  }

  if (args.length === 0) {
    message.channel.send('No arguments given for field.')
      .catch(err => logError(guildId, err));
    return;
  }

  let shouldShow = false;

  switch (field) {
    case 'author':
      shouldShow = await setFieldMap(message, field, ['name', 'icon_url', 'url'], args);
      break;
    case 'footer':
      shouldShow = await setFieldMap(message, field, ['text', 'icon_url'], args);
      break;
    case 'image':
    case 'thumbnail':
      shouldShow = await setFieldMap(message, field, ['url'], args);
      break;
    case 'color':
    case 'url':
      shouldShow = await setFieldSingleWord(message, field, args);
      break;
    case 'description':
    case 'title':
      shouldShow = await setFieldMultiWord(message, field, args);
      break;
  }

  if (shouldShow) {
    const newSnapshot = await ref.once('value');
    const edit = newSnapshot.val();
    message.channel.send({ embed: edit.data })
      .catch(err => logError(guildId, err));
  }
}

async function addField(message, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const snapshot = await ref.once('value');
  if (!snapshot.exists()) {
    message.channel.send('There is no embed being edited, try editing an embed before trying to add a field.')
      .catch(err => logError(guildId, err));
    return;
  }

  if (args.length === 0) {
    message.channel.send('No arguments given for field.')
      .catch(err => logError(guildId, err));
    return;
  }

  const fieldsRef = ref.child('data').child('fields');
  const fieldsSnapshot = await fieldsRef.once('value');
  const fieldsVal = fieldsSnapshot.val();

  let fieldsArray = [];
  if (fieldsVal !== null && typeof fieldsVal !== 'undefined') {
    fieldsArray = Object.values(fieldsSnapshot.val());
  }

  let args_ = args.join(' ').split('|');
  let newField = {};
  if (args_.length > 1) {
    newField.name = args_[0].trim();
    newField.value = args_[1].trim();
  } else {
    message.channel.send('Not enough arguments')
      .catch(err => logError(guildId, err));
    return;
  }
  if (args_.length > 2) {
    newField.inline = args_[2].trim() === 'inline';
  }

  fieldsArray.push(newField);

  try {
    await fieldsRef.set(fieldsArray);
    await setLastModified(guildId);
  } catch (err) {
    message.channel.send('Error updating field.')
      .catch(err => logError(guildId, err));
    logError(guildId, err);
    return;
  }

  const newSnapshot = await ref.once('value');
  const edit = newSnapshot.val();
  message.channel.send({ embed: edit.data })
    .catch(err => logError(guildId, err));
}

async function removeFieldSimple(message, field) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);
  const fieldRef = ref.child('data').child(field);

  try {
    await fieldRef.remove();
    await setLastModified(guildId);
    return true;
  } catch(err) {
    message.channel.send('Error removing field.')
    .catch(err => logError(guildId, err));
    logError(guildId, err);
  }
  return false;
}

async function removeFieldMap(message, field, subcommands, args) {
  const guildId = message.guild.id;

  if (args.length === 0) {
    return await removeFieldSimple(message, field);
  }

  const subcommand = args.shift();
  if (!subcommands.includes(subcommand)) {
    message.channel.send(`Invalid subcommand for removeField ${field}`)
      .catch(err => logError(guildId, err));
  } else {
    return await removeFieldSimple(message, `${field}/${subcommand}`);
  }
  return false;
}

async function removeField(message, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const fieldIndex = args.shift();
  if (typeof fieldIndex === 'undefined' || fieldIndex === null) {
    message.channel.send('Not enough arguments')
      .catch(err => logError(guildId, err));
    return false;
  }

  const fieldsRef = ref.child('data').child('fields');
  const fieldsSnapshot = await fieldsRef.once('value');
  const fieldsVal = fieldsSnapshot.val();

  let fieldsArray = [];
  if (fieldsVal === null || typeof fieldsVal === 'undefined') {
    message.channel.send('No fields to remove.')
      .catch(err => logError(guildId, err));
    return false;
  }
  fieldsArray = Object.values(fieldsSnapshot.val());
  if (fieldIndex >= fieldsArray.length) {
    message.channel.send('Index out of range.')
      .catch(err => logError(guildId, err));
    return false;
  }
  fieldsArray.splice(fieldIndex, 1);

  try {
    await fieldsRef.set(fieldsArray);
    await setLastModified(guildId);
    return true;
  } catch (err) {
    message.channel.send('Error updating field.')
      .catch(err => logError(guildId, err));
    logError(guildId, err);
  }
  return false;
}

async function deleteField(message, args) {
  const guildId = message.guild.id;
  const ref = databaseEmbedRef(guildId);

  const snapshot = await ref.once('value');
  if (!snapshot.exists()) {
    message.channel.send('There is no embed being edited, try editing an embed before trying to remove a field.')
      .catch(err => logError(guildId, err));
    return;
  }

  const field = args.shift();
  if (typeof field === 'undefined' || ![...validFields,'field'].includes(field)) {
    message.channel.send('There is no such field.')
      .catch(err => logError(guildId, err));
    return;
  }

  let shouldShow = false;

  switch (field) {
    case 'author':
      shouldShow = await removeFieldMap(message, field, ['name', 'icon_url', 'url'], args);
      break;
    case 'footer':
      shouldShow = await removeFieldMap(message, field, ['text', 'icon_url'], args);
      break;
    case 'image':
    case 'thumbnail':
      shouldShow = await removeFieldMap(message, field, ['url'], args);
      break;
    case 'color':
    case 'url':
    case 'description':
    case 'title':
      shouldShow = await removeFieldSimple(message, field);
      break;
    case 'field':
      shouldShow = await removeField(message, args);
      break;
  }

  if (shouldShow) {
    const newSnapshot = await ref.once('value');
    const edit = newSnapshot.val();
    message.channel.send({ embed: edit.data })
      .catch(err => logError(guildId, err));
  }
}

module.exports = {
  name: 'embed',
  execute(message, args) {
    const subcommand = args.shift();

    switch (subcommand) {
      case 'help':
        help(message, args);
        break;
      case 'list':
        listEmbeds(message);
        break;
      case 'queue':
        queueEmbed(message, args);
        break;
      case 'show':
        showEmbed(message, args);
        break;
      case 'new':
        newEmbed(message, args);
        break;
      case 'edit':
        editEmbed(message, args);
        break;
      case 'save':
        saveEmbed(message);
        break;
      case 'delete':
        deleteEmbed(message, args);
        break;
      case 'setField':
        setField(message, args);
        break;
      case 'addField':
        addField(message, args);
        break;
      case 'deleteField':
        deleteField(message, args);
        break;
      default:
        message.channel.send('Hmm, that\'s not a command, try $embed help.')
          .catch(err => logError(guildId, err));
    }
  }
}