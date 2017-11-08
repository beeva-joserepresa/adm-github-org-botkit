const debug = require('debug')('botkit:channel_join');
const luis = require('botkit-middleware-luis');
const {
  commands,
  callbacks,
  actions,
  intents
} = require('../lib/constants');

module.exports = function(controller) {
  controller.hears(['hello'], 'direct_message,direct_mention', luis.middleware.hereIntent, (bot, message) => {
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
        switch (response.topIntent && response.topIntent.intent) {
        case intents.listIssues:
          conversation.say('Listar issues... Oído cocina!');
          break;
        default:
          conversation.say('Sorry, I don\'t know what it means :(');
          conversation.repeat();
        }
        conversation.next();
      });
    });
  });

  controller.on('interactive_message_callback', (bot, message) => {
    if (message.callback_id !== callbacks.mainMenu) {
      return true;
    }

    switch (message.text) {
    case intents.listIssues:
      bot.reply('Listar issues... Oído cocina!');
      break;
    default:
      // Do nothing
    }
  });
};
