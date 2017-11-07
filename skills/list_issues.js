const debug = require('debug')('botkit:channel_join');
const {
  commands,
  callbacks,
  actions
} = require('../lib/constants');

module.exports = function(controller) {
  controller.hears(['hello'], 'direct_message,direct_mention', (bot, message) => {
    bot.startConversationInThread(message, (err, convo) => {
      convo.say('Hello!');

      convo.ask({
        attachments:[{
          title: 'What can I do for you? Answer me in this thread to start a conversation or use the buttons below this message...',
          callback_id: callbacks.mainMenu,
          attachment_type: 'default',
          actions: [{
            name: actions.listIssues,
            text: 'List opened access requests',
            value: actions.listIssues,
            type: 'button'
          }]
        }]
      }, (response, conversation) => {
        switch (response.text) {
        case actions.listIssues:
          break;
        default:
          conversation.repeat();
          conversation.next();
        }
      });
    });
  });
};
