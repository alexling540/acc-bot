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
- [Running the App](#running-the-app)
- [Deploying to Heroku](#deploying-to-heroku)
  * [Creating a new App](#creating-a-new-app)
  * [Via GitHub](#via-github)
  * [Via Heroku CLI](#via-heroku-cli)
  * [Setting Configuration Vars](#setting-configuration-vars)
  * [Configuring Workers](#configuring-workers)

## Setup

### What You Will Need
- Node.js (minimum Nodev12)
- Yarn / npm
- Discord account
- Google account
- Heroku account (if deploying to Heroku)
- Heroku CLI (if deploying via cli)

### Clone This Repository
1. `git clone https://github.com/alexling540/acc-bot.git`

### Installing Dependencies
1. `yarn install` or with npm `npm install`

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

In this section, you will need a Discord account. If you don't have one, you can create one [here](https://discord.com/register).

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

In this section, you will need a Google account. If you don't have one, you can create one [here](https://accounts.google.com/signup/v2/webcreateaccount?continue=https%3A%2F%2Fwww.google.com%2F&hl=en&gmb=exp&biz=false&flowName=GlifWebSignIn&flowEntry=SignUp).

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

## Deploying to Heroku
In this section, you will need a Heroku account. If you don't have one, you can create one [here](https://signup.heroku.com/).

### Creating a new App
1. Log into your Heroku account.
1. In the top right, click `New App` and selected `Create New App`
1. Give your app a name and select a region.
1. You should now be in the "Deploy" tab.

### Via GitHub
This section requires that you have your own repository on GitHub. If you don't have a repository on GitHub (i.e. locally), consider using the Heroku CLI instead.

1. Log into your Heroku account.
1. Click on your app from the listed apps.
1. Click on the "Deploy" tab.
1. In the "Deployment method" section, select the GitHub icon.
1. In the "Connect to GitHub" section, select the user or organization, then search for your repo.
1. When your repo shows up, click `Connect`.

### Via Heroku CLI
This section requires that you have Heroku CLI installed. If you don't, you can follow the steps [here](https://devcenter.heroku.com/articles/heroku-cli).

1. Log into your Heroku account.
1. Click on your app from the listed apps.
1. Click on the "Deploy" tab.
1. In the "Deployment method" section, the selected icon should be Heroku Git. If not, select it.
1. In the terminal, log into your Heroku account using `heroku login`.
1. Then in the terminal, type `heroku git:remote -a <your app name>`, where `<your app name>` is the currently selected app.

### Setting Configuration Vars
1. In your app, click on the "Settings" tab.
1. In the "Config Vars" section, click `Reveal Config Vars`.
1. From the `.env` file, copy paste and add every key value pair into the inputs.

### Configuring Workers
1. In your app, click on the "Resources" tab.
1. You should see a "web" and "worker" Dyno.
1. If the "worker" dyno isn't on, click the pencil and click the switch to turn on the dyno.
1. Click ``Confirm`` to save.