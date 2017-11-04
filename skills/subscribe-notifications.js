const debug = require('debug')('botkit:channel_join');
const schedule = require('node-schedule');

const crons = {};
const CALLBACK_ENABLE = 123;
const CALLBACK_DISABLE = 321;

function sendDailyResume(controller, id, token) {
  const text = 'Hola k ase, aquí hay que mostrar el número de issues abiertas';

  controller.spawn({ token }).startRTM((err, bot) => {
    if (err) {
      return;
    }

    bot.say({
      text,
      channel: id
    });
  });
}


function startCron(controller, id, token) {
  if (crons[id]) {
    // sendDailyResume(controller, id, token);
  } else {
    crons[id] = schedule.scheduleJob('*/5 * * * *', sendDailyResume.bind(this, controller, id, token));
  }
  sendDailyResume(controller, id, token);
}

module.exports = function(controller) {
  // Wake up timers
  controller.on('create_bot', (bot/* , config */) => {
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

      subscriptions.forEach(({ id, token }) => startCron(controller, id, token));
    });
  });

  controller.hears(['notificaciones', 'notifications'], 'direct_message', (bot, message) => {
    // load user from storage...
    controller.storage.users.get(message.user, (err, user) => {
      if (err) {
        bot.reply('Sorry but I can\'t enable the notifications right now :(');
      }

      let title;
      let callback_id;

      if (!user || !user.notifications) {
        title = '¿Do you wanna enable the notifications?';
        callback_id = CALLBACK_ENABLE;
      } else {
        title = 'You have already enabled chat notifications, ¿do you wanna disable it?';
        callback_id = CALLBACK_DISABLE;
      }
      bot.reply(message, {
        attachments:[{
          title,
          callback_id,
          attachment_type: 'default',
          actions: [{
            name: 'yes',
            text: 'Yes',
            value: 'yes',
            type: 'button',
            confirm: {
              title: 'Are you sure?',
              text: 'I\'m not as heavy as you can imagine :(',
              ok_text: 'Yes',
              dismiss_text: 'No'
            }
          }, {
            name: 'no',
            text: 'No',
            value: 'no',
            type: 'button'
          }]
        }]
      });
    });
  });

  controller.on('bot_channel_join', function(bot, message) {
    // find all teams
    controller.storage.teams.get(message.team, (err, team) => {
      if (!team) {
        debug(`No team was found: ${err}`);
        return;
      }

      // Initialize the subscriptions array if not exist
      team.subscriptions = team.subscriptions || [];
      
      // Check if channel is already added
      if (team.subscriptions.includes(message.channel)) {
        debug('Channel already subscribed');
        return;
      }

      team.subscriptions.push(message.channel);

      // Save the team
      controller.storage.teams.save(team, (err2/* , saved */) => {
        if (err2) {
          bot.reply(message, 'Some error has ocurred, the channels will not receive any report :(');
          debug(`I experienced an error adding your task: ${err}`);
          return;
        }

        // Respond and starrt the scheduler
        bot.reply(message, 'Channel is ready to receive reports :)');
        bot.api.reactions.add({
          name: 'thumbsup',
          channel: message.channel,
          timestamp: message.ts
        });
        startCron(controller, message.channel, team.bot.token);
      });
    });
  });
};
