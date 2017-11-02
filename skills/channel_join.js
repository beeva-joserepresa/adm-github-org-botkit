const debug = require('debug')('botkit:channel_join');
const schedule = require('node-schedule');

function dailyResume(controller, bot, message) {
  const text = 'Hola k ase, aquí hay que mostrar el número de issues abiertas';

  bot.reply(message, text);
  debug(text)
}

module.exports = function(controller) {
  controller.on('bot_channel_join', function(bot, message) {

    // Notify studio
    controller.studio.run(bot, 'channel_join', message.user, message.channel).catch((err) => {
      debug('Error: encountered an error loading onboarding script from Botkit Studio:', err);
    });

    controller.storage.channel.get('schedule', (err, list) => {
      if (!list || !list.length) {
        list = [];
      }

      if (list.contains(message.channel)) {
        return;
      }

      list.push(message.channel);

      controller.storage.channel.save(list, (err2/* , saved */) => {
        if (err2) {
          bot.reply(message, 'Some error has ocurred, the channel will not receive any report :(');
          debug(`I experienced an error adding your task: ${err}`);
        } else {
          bot.reply(message, 'Channel is ready to receive reports');
          bot.api.reactions.add({
            name: 'thumbsup',
            channel: message.channel,
            timestamp: message.ts
          });
        }
      });
    });

    // schedule.scheduleJob('*/10 * * * * *', dailyResume.bind(this, controller, bot, message));
  });
};
