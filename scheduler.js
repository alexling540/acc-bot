const firebase = require('firebase/app');
const { firestore } = require('./firestore.js');
const schedule = require('node-schedule');

let scheduledEmbeds = {};

function scheduleEmbed(embedRef, time, channelId, guildId, embedId) {
  const channel = client.channels.cache.get(channelId);

  let j = schedule.scheduleJob(time, async function() {
    try {
      const data = (await embedRef.get()).data();
      channel.send({ embed: data.data });
      delete scheduledEmbeds[guildId][embedId];
    } catch(err) {
      channel.send('Failed to send scheduled embed');
      console.error(`[${guildId}] ${err}`);
      return;
    }
    try {
      firestore.doc(`servers/${guildId}`).update({
        queuedEmbeds: firebase.firestore.FieldValue.arrayRemove(embedRef)
      });
    } catch(err) {
      console.error(`[${guildId}] ${err}`);
    }
  });
  if (!(guildId in scheduledEmbeds)) {
    scheduledEmbeds[guildId] = {};
  }
  scheduledEmbeds[guildId][embedId] = j;
}

function cancelEmbed(guildId, embedId) {
  scheduledEmbeds[guildId][embedId].cancel();
}

module.exports = {
  scheduleEmbed,
  cancelEmbed
};