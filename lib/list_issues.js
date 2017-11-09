const debug = require('debug')('botkit:list_issues');
const luis = require('botkit-middleware-luis');
const github = require('../lib/github');
const {
  commands,
  callbacks,
  actions,
  intents
} = require('../lib/constants');

function getIssues() {
  return new Promise((resolve, reject) => {
    github.issues.getForRepo({
      state: 'open',
      sort: 'updated',
      owner: 'BEEVA-bots-poc',
      repo: 'access'
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    });
  });
}

function listIssuesConvo(bot, convo) {
  getIssues().then(({ data: issues }) => {
    if (issues.length) {
      const response = issues.reduce((acc, issue) => {
        acc.attachments.push({
          pretext: `${issue.id} - ${issue.title}`,
          footer: issue.user.name,
          ts: new Date(issue.created_at).getTime()
        });

        return acc;
      }, {
        attachments: [],
        action: 'select_issue'
      });

      convo.addQuestion('Tell me the ID of the issue that do you want to inspect', (res, convoAsk) => {
        const validIssues = issues.map(({ id }) => String(id));

        convo.setVar('issueId', res.text);
        if (validIssues.includes(res.text)) {
          convoAsk.gotoThread('valid_id');
        } else {
          convoAsk.gotoThread('no_valid_id');
        }
        convoAsk.next();
      }, {}, 'select_issue');

      convo.addMessage({
        text: 'Your selection is "{{vars.issueId}}"'
      }, 'valid_id');

      convo.addMessage({
        text: 'Sorry but this is not a valid ID :(',
        action: 'select_issue'
      }, 'no_valid_id');

      convo.addMessage(response, 'default');
    } else {
      convo.addMessage({
        text: 'Sorry but there are not any issues'
      }, 'default');
    }

    return issues;
  });
}

function selectIssueConvo(bot, convo, issues) {
}

module.exports = function(controller, bot, message) {
  bot.say('Let me search... :mag:');

  bot.createConversation(message, (err, convo) => {
    Promise.all([
      listIssuesConvo(bot, convo)
    ]).then(([issues]) => {
      // if (issues.length) {
      //   selectIssueConvo(bot,convo, issues);
      // }

      convo.activate();
    });
  });
};
