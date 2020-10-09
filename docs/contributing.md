[← Home](../)

# Contributing

Before contributing, make sure you read the README.md in the main repository to set up your environment properly. As a reminder you will need Node.js (minimum version 12), a Node package manager (Yarn is preferred, but npm is ok), an a Google account at minimum. If deploying to Heroku, you will also need a Heroku account and optionally, the Heroku CLI.

## Project Structure

After cloning the repository, the root folder contains:
```
commands/
docs/
.gitignore
Procfile
README.md
bot.js
firestore.js
package.json
scheduler.js
yarn.lock
```
Our entry point is `bot.js`, this is where our Discord client starts and lives. The client is globally exported and is accessable anywhere as `client`. Since we are using Google's Firebase as our databases (technically, our backend-as-a-service), `firebase.js` contains our Firebase configuration. This file also it creates the Firebase app and exports both `firestore` and `database` for Firestore and Realtime database, respectively, to be used anywhere. `Procfile` contains our Heroku config; this doesn't need to be changed. The two folders `commands` and `docs` contain bot commands and project documentation, respectively.

## bot.js
What's the special sauce inside `bot.js` to make this bot work? Inside this file, we dynamically import every single JavaScript file inside the `commands` folder and adds them to a collection, where we can access them later. Once the client has logged in, it'll notify us in the console it's user tag. Every time the bot joins a new server, it'll create a new document for the server in the database automatically, pretty neat! Then, when it recieves a message, it'll look if it's a command and try to execute it if it is. Lastly, don't forget to log on with our credentials.

## Adding Commands
Looking inside the `commands` folder we have:
```
../
ping.js
...
```
Let's take a look inside `ping.js`.
```javascript
module.exports = {
  name: 'ping',
  execute(message, args) {
    message.reply('Pong!');
  }
}
```
At the very minimum, every command (and its corresponding javascript file) must export a name, which is the command name, and an execute function that accepts the message, and the arguments associated with the message. The command name for ping is `ping` as we call ping with `$ping`. The name of the file doesn't have to correspond to the name, but for best practice it should. Command names should not have spaces, as the client `bot.js` breaks down a message into chunks with space as the delimiter. This means that `args` contains the rest of the chunks; we need these args to make responive commands! It would suck to have commands with no subcommands or arguments :(. It is recommended to use `if...else` or `switch...case` statements to make subcommands.

### Why do we need message as a parameter?
We need message as a parameter so we can access the message contents, the channel the message was sent in, the message author among other things. To see what kinds of cool things we can access with just a message object, see the [official Discord.js documentation](https://discord.js.org/#/docs/main/stable/class/Message).