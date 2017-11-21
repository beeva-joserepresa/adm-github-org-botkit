# adm-github-org-hubot-botkit

Manage the contributors in a Github organization talking to an Slack chatbot.

To test the chatbot use this Slack channel: [adm-github-org.slack.com](https://adm-github-org.slack.com/)

## Requirements

- [Node.js](https://nodejs.org/es/)

## Installation

Just clone this repo, install the dependencies with `npm install` and run `npm start`.

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

### Help `@botkit help`

![help](https://i.imgur.com/3134FnB.png)

### Promp notifications menu `/notifications`

![menu](https://i.imgur.com/4rKKzOU.png)

Optionally you can pass a param (*enable* or *disable*) as a shortcut for the action:

- `/notifications enable`

![enable](https://i.imgur.com/WcKPNs7.png)

- `/notifications disable`

![disable](https://i.imgur.com/aXiXvwr.png)
