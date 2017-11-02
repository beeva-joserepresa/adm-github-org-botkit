var debug = require('debug')('botkit:channel_join');
const schedule = require('node-schedule');
const { promisify } = require('util');

async function dailyResume(controller, bot, message) {
  const text = 'Hola k ase, aquí hay que mostrar el número de issues abiertas';

  bot.reply(message, text);
}

module.exports = function(controller) {
  controller.on('bot_channel_join', async function(bot, message) {
    const dailyReportSchedule = schedule.scheduleJob('*/10 * * * * *', dailyResume.bind(this, controller));

    // Notify studio
    try {
      await controller.studio.run(bot, 'channel_join', message.user, message.channel);
    } catch (err) {
      debug('Error: encountered an error loading onboarding script from Botkit Studio:', err);
    }
  });
};
