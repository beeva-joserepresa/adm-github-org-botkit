require('debug')('botkit:intent_dispatcher');
const luis = require('botkit-middleware-luis');
const listIssues = require('../lib/list_issues');
const handleMenu = require('../lib/handle_menu');
const {
  intents
} = require('../lib/constants');


module.exports = function(controller) {
  controller.hears(['.*'], 'direct_message,direct_mention', luis.middleware.hereIntent, (bot, message) => {
    if (!message.topIntent || !message.topIntent.intent) {
      return true;
    }

    switch (message.topIntent.intent) {
    case intents.listIssues:
      listIssues(controller, bot, message);
      break;
    case intents.menu:
      handleMenu(controller, bot, message);
      break;
    default:
      bot.reply(message, 'Sorry, I don\'t know what it means :(');
    }
  });
};
