const debug = require('debug')('botkit:list_issues');
const github = require('../github');
const { repo } = require('../constants');

function createComment(number, body) {
  return new Promise((resolve, reject) => {
    github.issues.createComment({
      owner: repo.owner,
      repo: repo.name,
      number,
      body
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    });
  });
}

function showIssueConvo(convo) {
  const issue = convo.vars.issue;
  const question = convo.vars.question;

  return createComment(issue.number, question).then(() => {
    convo.addMessage({
      text: 'Your message was successfully sent :+1:'
    }, 'comment_issue');
  });
}


module.exports = showIssueConvo;
