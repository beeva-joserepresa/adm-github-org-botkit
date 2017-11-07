const schedule = require('node-schedule');

const DAILY_CRON = 1;
const TEST_CRON = 2;
const crons = {};

module.exports = class Cron {
  constructor(controller) {
    this._controller = controller;

    // crons[TEST_CRON] = schedule.scheduleJob('*/20 * * * * *', this.sendReport.bind(this));
    crons[DAILY_CRON] = schedule.scheduleJob('0 8 * * *', this.sendReport.bind(this));
  }

  _getTeams() {
    return new Promise((resolve, reject) => {
      this._controller.storage.teams.all((err, teams) => {
        if (err) {
          reject(err);
        }

        resolve(teams);
      });
    });
  }

  _getUsers() {
    return new Promise((resolve, reject) => {
      this._controller.storage.users.all((err, users) => {
        if (err) {
          reject(err);
        }

        resolve(users);
      });
    });
  }

  _getBot(token) {
    return new Promise((resolve, reject) => {
      this._controller.spawn({ token }).startRTM((err, bot) => {
        if (err || !bot) {
          reject(err);
        }

        resolve(bot);
      });
    });
  }

  sendReport() {
    Promise.all([
      this._getTeams(),
      this._getUsers()
    ]).then(([teams, users]) => {
      users = users.filter((user) => user.notifications);

      teams.forEach(({ bot: { token } }) => {
        this._getBot(token).then((bot) => {
          users.forEach(({ id: user }) => {
            bot.startPrivateConversation({ user }, (err3, convo) => {
              if (err3 || !convo) {
                return;
              }

              convo.say('Hola k ase, aquí hay que mostrar el número de issues abiertas');
            });
          });
        });
      });
    });
  }
};
