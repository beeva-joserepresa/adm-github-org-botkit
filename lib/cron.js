const schedule = require('node-schedule');
const { promisify } = require('util');
const github = require('./github');
const { repo } = require('./constants');

const getForRepo = promisify(github.issues.getForRepo);

function isToday(inputDate) {
  const today = new Date();

  return today.setHours(0, 0, 0, 0) === inputDate.setHours(0, 0, 0, 0);
}

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

  _getReport() {
    return Promise.all([
      getForRepo({
        state: 'open',
        sort: 'updated',
        owner: repo.owner,
        repo: repo.name
      })
    ]).then(([{ data: issues }]) => ({
      total: issues.length,
      createdYesterday: issues.filter((issue) => isToday(new Date(issue.created_at))).length
    }));
  }

  sendReport() {
    Promise.all([
      this._getTeams(),
      this._getUsers(),
      this._getReport()
    ]).then(([teams, users, report]) => {
      users = users.filter((user) => user.notifications);

      teams.forEach(({ bot: { token } }) => {
        this._getBot(token).then((bot) => {
          users.forEach(({ id: user }) => {
            bot.startPrivateConversation({ user }, (err3, convo) => {
              if (err3 || !convo) {
                return;
              }

              convo.say(`Hi! There are ${report.total} opened issues and ${report.createdYesterday} of them were opened today`);
            });
          });
        });
      });
    });
  }
};
