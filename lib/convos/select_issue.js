const debug = require('debug')('botkit:select_issue');
const showIssue = require('./show_issue');

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

module.exports = selectIssue;
