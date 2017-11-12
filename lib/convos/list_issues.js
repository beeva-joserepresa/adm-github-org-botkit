const debug = require('debug')('botkit:list_issues');
const github = require('../github');
const selectIssue = require('./select_issue');
const { repo } = require('../constants');

function getIssues() {
  return new Promise((resolve, reject) => {
    github.issues.getForRepo({
      state: 'open',
      sort: 'updated',
      owner: repo.owner,
      repo: repo.name
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    });
  });
}

function listIssues(convo) {
  return getIssues().then(({ data: issues }) => {
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

      convo.setVar('issues', issues);
      selectIssue(convo);
      convo.addMessage(response, 'default');
    } else {
      convo.addMessage({
        text: 'Sorry but there are not any issues'
      }, 'default');
    }

    return issues;
  });
}

module.exports = listIssues;
