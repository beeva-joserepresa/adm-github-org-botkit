module.exports = {
  repo: {
    owner: 'BEEVA-bots-poc',
    name: 'access'
  },
  commands: {
    notifications: '/notifications'
  },
  callbacks: {
    mainMenu: '000',
    enableNotifications: '123',
    disableNotifications: '321',
    showIssue: '999'
  },
  actions: {
    yes: 'yes',
    no: 'no',
    accept: 'accept',
    reject: 'reject',
    ask: 'ask',
    listIssues: 'listIssues'
  },
  intents: {
    listIssues: 'listIssues',
    menu: 'hello',
    help: 'help',
    accept: 'accept',
    reject: 'reject',
    ask: 'ask'
  }
};
