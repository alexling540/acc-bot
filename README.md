# acc-bot
- [Setup](#setup)
  * [What You Will Need](#what-you-will-need)
  * [Installing Dependencies](#installing-dependencies)
  * [Environment Variables](#environment-variables)
  * [Setting Up the Discord Bot in the Discord Developers Portal](#setting-up-the-discord-bot-in-the-discord-developers-portal)
    + [Making a New Application](#making-a-new-application)
    + [Creating a New Bot](#creating-a-new-bot)
    + [Grabbing the Discord Bot Client ID](#grabbing-the-discord-bot-client-id)
  * [Setting up Firebase](#setting-up-firebase)
    + [Creating a Firebase project](#creating-a-firebase-project)
    + [Adding our Discord app](#adding-our-discord-app)
    + [Grabbing the Firebase Configuration via New App](#grabbing-the-firebase-configuration-via-new-app)
    + [Grabbing the Firebase Configuration otherwise](#grabbing-the-firebase-configuration-otherwise)
    + [Creating the Firestore database](#creating-the-firestore-database)
    + [Creating the Realtime Database](#creating-the-realtime-database)
- [Running the app](#running-the-app)

## Setup

### What You Will Need
- Node.js (minimum Nodev12)
- Yarn

### Installing Dependencies
1. `yarn install`

### Environment Variables
1. Create `.env` file in the project root with the following starter code:
```
BOT_TOKEN = 

FIREBASE_API_KEY             = 
FIREBASE_PROJECT_ID          = 
FIREBASE_MESSAGING_SENDER_ID = 
FIREBASE_APP_ID              = 
```
This file will be filled in with secret keys later.

### Setting Up the Discord Bot in the Discord Developers Portal
https://anidiots.guide/getting-started/getting-started-long-version

#### Making a New Application
1. Navigate to https://discord.com/developers/applications and log in if necessary.
1. In the top right corner, click the `New Application` button. This will bring up a popup with a textinput asking for an application name and a dropdown to select the team.
1. Enter a friendly name for your application† (note this will also be the bot name on creation) and select a team (I selected "Personal").
1. After clicking create, you'll be greeted with a screen saing the general information about your app. Onto the next step!

†If you set a too generic of a name Discord won't let you create a bot! We can remedy this by going to the `General Information` tab and changing the name.

#### Creating a New Bot
1. Navigate to your desired application.
1. On the left side, click the `Bot` tab.
1. You should see a `Add Bot` button on the right side. Click it and confirm by clicking `Yes, do it!`.
1. You should be now greeted with many more options.

#### Grabbing the Discord Bot Client ID
1. Navigate to your desired application and click the `Bot` tab.
1. Let's grab the bot token by clicking the `Copy` button under the Token section (near the middle).
1. Paste this into the `.env` file we created earlier.


### Setting Up Firebase
https://firebase.google.com/docs/web/setup

#### Creating a Firebase Project
1. Navigate to https://firebase.google.com/. You will need a Google Account for this section.
1. In the top right corner, click on the `Go to console` link.
1. Near the middle, click the big button with `Create a project` in it.
1. Follow the prompts to create your project.
1. You should now be in the Firebase dashboard.

#### Adding our Discord app
1. While in the `Project Overview` tab, click the `Add app` button (below the project's name).
1. Select the button with the `</>` icon, as this is the web app option.
1. In the App nickname inputfield, add a friendly name for our web app.
1. Do not check Firebase Hosting as we won't need to host anything on Firebase.
1. Click the `Register app` button.

#### Grabbing the Firebase Configuration via New App
1. After clicking the `Register app` button, you should be greeted with a config.
1. Copy each entry's key (on the right side of the colon) into the `.env` file we created earlier, with each entry paired the same name (except the name is in all caps).

#### Grabbing the Firebase Configuration otherwise
1. In the Firebase console, click the gear icon and then the "Project settings" link.
1. Scroll until you see the Your apps section.
1. Select the desired app.
1. Copy each entry's key (on the right side of the colon) into the `.env` file we created earlier, with each entry paired the same name (except the name is in all caps).

#### Creating the Firestore database
1. In the Firebase console, click the "Cloud Firestore" link.
1. Click the `Create database` button.
1. Choose start in testing mode or in production mode with the following rules:
```
TBD
```

#### Creating the Realtime Database
1. In the Firebase console, click the "Realtime database" link.
1. Click the `Create database` button.
1. Choose start in testing mode or in production mode with the following rules:
```
TBD
```

## Running the app
```
node bot.js
```
