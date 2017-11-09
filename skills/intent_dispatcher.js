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

    console.log(message.topIntent)

    switch (message.topIntent.intent) {
    case intents.listIssues:
      listIssues(controller, bot, message);
      break;
    case intents.menu:
    case intents.hello:
      handleMenu(controller, bot, message);
      break;
    case intents.help:
      const cmd = message.text.replace(/help\s?/, '');

      if (cmd) {
        controller.studio.run(bot, `help_${cmd}`, message.user, message.channel);
      } else {
        controller.studio.run(bot, 'help', message.user, message.channel);
      }
      break;
    default:
      bot.reply(message, 'Sorry, I don\'t know what it means :(');
    }
  });
};
