const debug = require('debug')('botkit:channel_join');
const schedule = require('node-schedule');

function sendDailyResume(controller, id, token) {
  const text = 'Hola k ase, aquí hay que mostrar el número de issues abiertas';

  controller.spawn({ token }).startRTM((err, bot) => {
    if (err) {
      return;
    }

    console.log({ text, id })
    bot.say({
      text,
      channel: id
    });
  });
}

module.exports = function(controller) {

  // Wake up timers
  // controller.on('create_bot', (bot/* , config */) => {
  controller.storage.teams.all((err, teams) => {
    if (err || !teams) {
      return;
    }

    const subscriptions = teams.reduce((acc, team) => {
      if (team.subscriptions) {
        team.subscriptions = team.subscriptions.map((id) => ({
          id,
          token: team.bot.token
        }));

        return acc.concat(...team.subscriptions);
      }

      return acc;
    }, []);

    subscriptions.forEach(({ id, token }) => {
      sendDailyResume(controller, id, token);
    });
  });
  // });

  controller.on('bot_channel_join', function(bot, message) {
    // Notify studio
    controller.studio.run(bot, 'channel_join', message.user, message.channel).catch((err) => {
      debug('Error: encountered an error loading onboarding script from Botkit Studio:', err);
    });

    controller.storage.teams.get(message.team, (err, team) => {
      if (!team) {
        debug(`No team was found: ${err}`);
        return;
      }

      team.subscriptions = team.subscriptions || [];
      team.subscriptions.push(message.channel);

      controller.storage.teams.save(team, (err2/* , saved */) => {
        if (err2) {
          bot.reply(message, 'Some error has ocurred, the channels will not receive any report :(');
          debug(`I experienced an error adding your task: ${err}`);
        } else {
          bot.reply(message, 'Channel is ready to receive reports :)');
          bot.api.reactions.add({
            name: 'thumbsup',
            channel: message.channel,
            timestamp: message.ts
          });
        }
      });
    });

  });
};
