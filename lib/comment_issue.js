const debug = require('debug')('botkit:comment_issue');
const { promisify } = require('util');
const github = require('./github');
const { repo } = require('./constants');

const createComment = promisify(github.issues.createComment);

module.exports = function commentIssue(issue, body) {
  return createComment({
    owner: repo.owner,
    repo: repo.name,
    number: issue.number,
    body
  });
};
