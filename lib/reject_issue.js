const debug = require('debug')('botkit:reject_issue');
const { promisify } = require('util');
const github = require('./github');
const { repo } = require('./constants');

const createComment = promisify(github.issues.createComment);
const edit = promisify(github.issues.edit);

module.exports = function rejectIssue(issue) {
  return createComment({
    owner: repo.owner,
    repo: repo.name,
    number: issue.number,
    body: 'You request have been rejected'
  }).then(() => edit({
    owner: repo.owner,
    repo: repo.name,
    number: issue.number,
    state: 'closed',
    labels: ['rejected']
  }));
};
