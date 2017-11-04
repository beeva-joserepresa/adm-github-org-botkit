const debug = require('debug')('botkit:channel_join');
const schedule = require('node-schedule');

const crons = {};
const CALLBACK_ENABLE = '123';
const CALLBACK_DISABLE = '321';
const ACTION_YES = 'yes';
const ACTION_NO = 'no';

// function sendDailyResume(controller, user) {
//   const text = 'Hola k ase, aquí hay que mostrar el número de issues abiertas';

//   controller.spawn({ token }).startRTM((err, bot) => {
//     if (err) {
//       return;
//     }

//     bot.startPrivateConversation({
//       user: user.id
//     }, function (err, convo) {
//       if (!err && convo) {
//         convo.say('Hello there! I messaged you because you where in the channel #general');
//       }
//     });
//   });
// }


// function startCron(controller, user) {
//   if (crons[id]) {
//     // sendDailyResume(controller, id, token);
//   } else {
//     crons[id] = schedule.scheduleJob('*/5 * * * *', sendDailyResume.bind(this, controller, id, token));
//   }
//   sendDailyResume(controller, id, token);
// }

function promptNotifications(controller, message) {
  return new Promise((resolve, reject) => {
    controller.storage.users.get(message.user, (err, user) => {
      if (err) {
        reject('Sorry but I can\'t enable the notifications right now :(');
      }

      let title;
      let callback_id;
      let confirm;

      if (!user || !user.notifications) {
        title = '¿Do you wanna enable the notifications?';
        callback_id = CALLBACK_ENABLE;
      } else {
        title = 'You already have enabled chat notifications, ¿do you wanna disable it?';
        callback_id = CALLBACK_DISABLE;
        confirm = {
          title: 'Are you sure?',
          text: 'I\'m not as heavy as you can imagine :(',
          ok_text: 'Yes',
          dismiss_text: 'No'
        };
      }

      resolve({
        response_type: 'ephemeral',
        attachments:[{
          title,
          callback_id,
          attachment_type: 'default',
          actions: [{
            name: ACTION_YES,
            text: 'Yes',
            value: ACTION_YES,
            type: 'button',
            confirm
          }, {
            name: ACTION_NO,
            text: 'No',
            value: ACTION_NO,
            type: 'button'
          }]
        }]
      });
    });
  });
}

module.exports = function(controller) {
  // Wake up timers
  // controller.storage.users.all((err, users) => {
  //   if (err || !users) {
  //     return;
  //   }

  //   const subscriptions = users.filter((acc, user) => user.notifications);

  //   subscriptions.forEach((user) => startCron(controller, user));
  // });

  controller.hears(['notificaciones', 'notifications'], 'direct_message,direct_mention', (bot, message) => {
    // load user from storage...
    promptNotifications(controller, bot).then(
      (prompt) => bot.reply(message, prompt),
      (prompt) => bot.reply(message, prompt)
    );
  });

  controller.on('slash_command', (bot, message) => {
    switch (message.command) {
      case '/notifications':
      case '/notificaciones':
        promptNotifications(controller, bot).then(
          (prompt) => bot.replyPrivate(message, prompt),
          (prompt) => bot.replyPrivate(message, prompt)
        );
        break;
      default:
        bot.replyPrivate(message, `I'm afraid I don't know how to ${message.command} yet.`);
    }
  });

  controller.on('interactive_message_callback', (bot, message) => {
    if (message.callback_id !== CALLBACK_DISABLE) {
      console.log('interactive_message_callback', 'CALLBACK_DISABLE')
      console.log(message.callback_id, message.actions)
      // keep bubbling the event
      return true;
    }

    switch (message.actions[0].name) {
      case ACTION_YES:
        bot.replyInteractive(message, {
          response_type: 'ephemeral',
          text: 'Disable notifications'
        });
        return false;
      default:
        // keep bubbling the event
        return true;
    }
  });

  controller.on('interactive_message_callback', (bot, message) => {
    if (message.callback_id !== CALLBACK_ENABLE) {
      console.log('interactive_message_callback', 'CALLBACK_ENABLE')
      console.log(message.callback_id, message.actions)
      // keep bubbling the event
      return true;
    }

    switch (message.actions[0].name) {
      case ACTION_YES:
        bot.replyInteractive(message, {
          response_type: 'ephemeral',
          text: 'Enable notifications'
        });
        return false;
      default:
        // keep bubbling the event
        return true;
    }
  });

  // controller.on('bot_channel_join', function(bot, message) {
  //   // find all teams
  //   controller.storage.teams.get(message.team, (err, team) => {
  //     if (!team) {
  //       debug(`No team was found: ${err}`);
  //       return;
  //     }

  //     // Initialize the subscriptions array if not exist
  //     team.subscriptions = team.subscriptions || [];
      
  //     // Check if channel is already added
  //     if (team.subscriptions.includes(message.channel)) {
  //       debug('Channel already subscribed');
  //       return;
  //     }

  //     team.subscriptions.push(message.channel);

  //     // Save the team
  //     controller.storage.teams.save(team, (err2/* , saved */) => {
  //       if (err2) {
  //         bot.reply(message, 'Some error has ocurred, the channels will not receive any report :(');
  //         debug(`I experienced an error adding your task: ${err}`);
  //         return;
  //       }

  //       // Respond and starrt the scheduler
  //       bot.reply(message, 'Channel is ready to receive reports :)');
  //       bot.api.reactions.add({
  //         name: 'thumbsup',
  //         channel: message.channel,
  //         timestamp: message.ts
  //       });
  //       startCron(controller, message.channel, team.bot.token);
  //     });
  //   });
  // });
};
