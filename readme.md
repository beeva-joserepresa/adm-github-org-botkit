# adm-github-org-hubot-botkit

Manage the members of a Github organization talking to an Slack chatbot.

To test the chatbot use the **Slack Channel** [**adm-github-org.slack.com**](https://adm-github-org.slack.com/) or add the application using the **Slack integration button** of [adm-github-org-botkit.herokuapp.com](https://adm-github-org-botkit.herokuapp.com/).

> To request access to the organization open an issue in [this](https://github.com/BEEVA-bots-poc/access) repo.

## Requirements

- [Node.js](https://nodejs.org/es/)
- [Slack App](https://api.slack.com/apps)
- [Microsoft Luis](https://www.luis.ai/)
- [MongoDB](https://www.mongodb.com) 
- [Botkit Studio](https://studio.botkit.ai/login)
- [Github](https://github.com/)

## Installation

Just clone this repo and install the dependencies with `npm install`.

## Configuration

This bot uses some environment variables so don't forget to fill the [`.env`](https://github.com/BEEVA-bots-poc/adm-github-org-botkit/blob/master/.env) file.

  * `clientId`: Slack client ID
  * `clientSecret`: Slack client secret
  * `studio_token`: Botkit Studio token
  * `PORT`: Express WebHook port
  * `MONGO_URI`: The brain to store the data
  * `LUIS`: Microsoft Luis Token to process all messages writen by the people. The app must be trained to respond to the following intents:
    - *accept*
    - *reject*
    - *ask*
    - *help*
    - *listIssues*
    - *reject*
    - *stop*
  * `GITHUB`: Github API token, it must be generated with admin role.

## Sample Interactions

## Run

Run `npm start` in the root of the project.

### Help

Show the available commands writing `@botkit help`:

![help](https://i.imgur.com/3134FnB.png)

> Optionally you can see more info about a command writing the name after the phrase (`@botkit help notifications`).

### Promp notifications menu

Use the command `/notifications`:

![menu](https://i.imgur.com/4rKKzOU.png)

Optionally you can pass a param (*enable* or *disable*) as a shortcut for the action:

- `/notifications enable`

![enable](https://i.imgur.com/WcKPNs7.png)

- `/notifications disable`

![disable](https://i.imgur.com/aXiXvwr.png)

### Start a conversation

To start a conversation mention the bot asking for the list of issues in the repo [**access**](https://github.com/BEEVA-bots-poc/access) (the bot uses the [Microsoft Luis API](https://www.luis.ai/) to analyze the conversation so there is no exact phrase to start talking to it).
Once the conversation is stablished the bot will ask you for the ID of the issue that you want to manage:

![list](https://i.imgur.com/HO73qbG.png)

When an issue is selected the bot will show all the data from the user and then it will ask you want you wanna do, there are three possible options:

![options](https://i.imgur.com/RNh0UXu.png)

- To **accept** or **reject** the user in the organization just write it:

![options](https://i.imgur.com/Sb023p7.png)

![accepted](https://i.imgur.com/FZmzeRK.png)

- To respond with a new comment respond that you want to **request more data**:

![ask](https://i.imgur.com/rjmvLum.png)

![response](https://i.imgur.com/lUjKNAW.png)

