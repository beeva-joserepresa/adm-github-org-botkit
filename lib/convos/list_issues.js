const debug = require('debug')('botkit:list_issues');
const github = require('../github');
const showIssue = require('./show_issue');
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

function selectIssue(convo) {
  const issues = convo.vars.issues;

  convo.addQuestion('Tell me the ID of the issue that do you want to inspect', (res, convoAsk) => {
    const issue = issues.find(({ id }) => String(id) === res.text);

    convo.setVar('issue', issue);
    if (issue) {
      showIssue(convo).then(() => {
        convoAsk.gotoThread('valid_id');
        convoAsk.next();
      });
    } else {
      convoAsk.gotoThread('no_valid_id');
      convoAsk.next();
    }
  }, {}, 'select_issue');

  convo.addMessage({
    text: 'Your selection is "{{vars.issue.id}}"',
    action: 'show_issue'
  }, 'valid_id');

  convo.addMessage({
    text: 'Sorry but this is not a valid ID :(',
    action: 'select_issue'
  }, 'no_valid_id');
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
