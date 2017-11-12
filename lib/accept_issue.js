const debug = require('debug')('botkit:accept_issue');
const { promisify } = require('util');
const github = require('./github');
const { repo } = require('./constants');

const createComment = promisify(github.issues.createComment);
const edit = promisify(github.issues.edit);
const addOrgMembership = promisify(github.orgs.addOrgMembership);

module.exports = function acceptIssue(issue, user) {
  return addOrgMembership({
    org: repo.owner,
    username: user.login,
    role: 'member'
  }).then(() => createComment({
    owner: repo.owner,
    repo: repo.name,
    number: issue.number,
    body: 'You have been successfuly added to the organization'
  })).then(() => edit({
    owner: repo.owner,
    repo: repo.name,
    number: issue.number,
    state: 'closed',
    labels: ['accepted']
  }));
};
