const debug = require('debug')('botkit:list_issues');
const luis = require('botkit-middleware-luis');
const github = require('../lib/github');
const {
  commands,
  callbacks,
  actions,
  intents
} = require('../lib/constants');

function getIssues() {
  return new Promise((resolve, reject) => {
    github.issues.getForRepo({
      state: 'open',
      sort: 'updated',
      owner: 'BEEVA-bots-poc',
      repo: 'access'
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    });
  });
}

module.exports = function(controller, bot, message) {
  bot.startConversationInThread(message, (err, convo) => {
    convo.say('Hello!');

    convo.ask({
      attachments:[{
        fallback: 'What can I do for you?',
        pretext: 'What can I do for you?',
        color: '#36a64f',
        text: 'Answer me in this thread to start a conversation or use the buttons below this message...',
        ts: new Date().getTime()
      }]
    }, (response, conversation) => {
      switch (response.topIntent && response.topIntent.intent) {
      case intents.listIssues:
        conversation.say('List issues?... Okie Dokie!');
         getIssues().then(({ data: issues }) => {
          const response = issues.reduce((acc, issue) => {
            acc.attachments.push({
              pretext: `${issue.id} - ${issue.title}`,
              footer: issue.user.name,
              ts: new Date(issue.created_at).getTime(),
              actions: [{
                name: actions.listIssues,
                text: 'Open Github',
                value: actions.listIssues,
                type: 'button'
              }, {
                name: actions.listIssues,
                text: 'Accept',
                value: actions.listIssues,
                style: 'good',
                type: 'button'
              }, {
                name: actions.listIssues,
                text: 'Reject',
                value: actions.listIssues,
                style: 'danger',
                type: 'button'
              }]
            });

            return acc;
          }, { attachments: [] });

          bot.replyInteractive(message, response);
        });
        break;
      default:
        conversation.say('Sorry, I don\'t know what it means :(');
        // conversation.repeat();
      }
      conversation.next();
    });
  });
};

  // controller.hears(['listIssues'], 'direct_message,direct_mention', luis.middleware.hereIntent, (bot, message) => {
  //   console.log(message.topIntent && message.topIntent.intent)
  //   if (message.topIntent && message.topIntent.intent !== intents.listIssues) {
  //     return true;
  //   }

  //   bot.ask({
  //     attachments:[{
  //       title: 'What can I do for you?',
  //       callback_id: callbacks.mainMenu,
  //       attachment_type: 'default',
  //       actions: [{
  //         name: actions.listIssues,
  //         text: 'List opened access requests',
  //         value: actions.listIssues,
  //         type: 'button'
  //       }]
  //     }]
  //   });
  // });
  
  // controller.on('interactive_message_callback', (bot, message) => {
  //   if (message.callback_id !== callbacks.mainMenu) {
  //     return true;
  //   }

  //   switch (message.text) {
  //   case intents.listIssues:
  //     getIssues().then(({ data: issues }) => {
  //       console.dir(issues);
  //       const response = issues.reduce((acc, issue) => {
  //         acc.attachments.push({
  //           pretext: `${issue.id} - ${issue.title}`,
  //           footer: issue.user.name,
  //           ts: new Date(issue.created_at).getTime(),
  //           actions: [{
  //             name: actions.listIssues,
  //             text: 'Open Github',
  //             value: actions.listIssues,
  //             type: 'button'
  //           }, {
  //             name: actions.listIssues,
  //             text: 'Accept',
  //             value: actions.listIssues,
  //             style: 'good',
  //             type: 'button'
  //           }, {
  //             name: actions.listIssues,
  //             text: 'Reject',
  //             value: actions.listIssues,
  //             style: 'danger',
  //             type: 'button'
  //           }] 
  //         });

  //         return acc;
  //       }, { attachments: [] });

  //       bot.replyInteractive(message, response);
  //     });
  //     break;
  //   default:
  //     // Do nothing
  //   }
