const GitHubApi = require('github');

const github = new GitHubApi({
  debug: true
});

github.authenticate({
  type: 'token',
  token: process.env.GITHUB
})

module.exports = github;
