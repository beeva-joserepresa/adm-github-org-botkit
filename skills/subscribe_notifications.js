const debug = require('debug')('botkit:channel_join');
const schedule = require('node-schedule');
const {
  commands,
  callbacks,
  actions
} = require('../lib/constants');

const crons = {};

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

function _subscribe(controller, message, reply, enable = true) {
  controller.storage.users.get(message.user, (err, user) => {
    if (err) {
      debug(`No user was found: ${err}`);
    }

    user = user || { id: message.user };
    user.notifications = enable;

    controller.storage.users.save(user, (err2/* , saved */) => {
      if (err2) {
        debug(`Something bad happened: ${err2}`);
      }

      let text = 'You have been successfully subscribed to the notifications system :+1:';

      if (!enable) {
        text = 'You have been successfully removed from the notifications system :disappointed:';
      }

      // Respond and start the scheduler
      reply(message, text);
      // bot.api.reactions.add({
      //   name: 'thumbsup',
      //   channel: message.channel,
      //   timestamp: message.ts
      // });
      // startCron(controller, message.channel, team.bot.token);
    });
  });
}

function unsubscribe(controller, message, reply) {
  _subscribe(controller, message, reply, false);
}

function subscribe(controller, message, reply) {
  _subscribe(controller, message, reply, true);
}

function promptNotifications(controller, userId) {
  return new Promise((resolve, reject) => {
    controller.storage.users.get(userId, (err, user) => {
      if (err) {
        reject('Sorry but I can\'t enable the notifications right now :(');
      }

      let title;
      let callback_id;
      let confirm;

      if (!user || !user.notifications) {
        title = '¿Do you wanna enable the notifications?';
        callback_id = callbacks.enableNotifications;
      } else {
        title = 'You already have enabled chat notifications, ¿do you wanna disable it?';
        callback_id = callbacks.disableNotifications;
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
            name: actions.yes,
            text: 'Yes',
            value: actions.yes,
            type: 'button',
            confirm
          }, {
            name: actions.no,
            text: 'No',
            value: actions.no,
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

  // controller.hears(['notifications'], 'direct_message,direct_mention', (bot, message) => {
  //   // load user from storage...
  //   promptNotifications(controller, bot).then(
  //     (prompt) => bot.reply(message, prompt),
  //     (prompt) => bot.reply(message, prompt)
  //   );
  // });

  controller.on('slash_command', (bot, message) => {
    if (message.command === commands.notifications) {
      if (message.text === 'enable') {
        // bot.replyPrivate(message, 'Enable notifications');
        subscribe(controller, message, bot.replyPrivate.bind(bot));
      } else if (message.text === 'disable') {
        // bot.replyPrivate(message, 'Disable notifications');
        unsubscribe(controller, message, bot.replyPrivate.bind(bot));
      } else {
        promptNotifications(controller, message.user).then(
          (prompt) => bot.replyPrivate(message, prompt),
          (prompt) => bot.replyPrivate(message, prompt)
        );
      }
    }
  });

  controller.on('interactive_message_callback', (bot, message) => {
    if (message.callback_id !== callbacks.disableNotifications) {
      return true;
    }

    switch (message.actions[0].name) {
    case actions.no:
      // bot.replyInteractive(message, {
      //   response_type: 'ephemeral',
      //   text: 'Disable notifications'
      // });
      unsubscribe(controller, message, bot.replyInteractive.bind(bot));
      break;
    default:
      bot.replyInteractive(message, {
        response_type: 'ephemeral',
        text: 'I\'ll keep notifiying you :+1:'
      });
    }
  });

  controller.on('interactive_message_callback', (bot, message) => {
    if (message.callback_id !== callbacks.enableNotifications) {
      return true;
    }

    switch (message.actions[0].name) {
    case actions.yes:
      // bot.replyInteractive(message, {
      //   response_type: 'ephemeral',
      //   text: 'Enable notifications'
      // });
      subscribe(controller, message, bot.replyInteractive.bind(bot));
      break;
    default:
      bot.replyInteractive(message, {
        response_type: 'ephemeral',
        text: 'Maybe next time?'
      });
    }
  });

};
