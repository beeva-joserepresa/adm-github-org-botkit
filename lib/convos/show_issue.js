const debug = require('debug')('botkit:show_issue');
const { promisify } = require('util');
const github = require('../github');
const commentIssue = require('../comment_issue');
const acceptIssue = require('../accept_issue');
const rejectIssue = require('../reject_issue');
const { intents } = require('../constants');

const getById = promisify(github.users.getById);


module.exports = function showIssue(convo) {
  const issue = convo.vars.issue;

  return getById({
    id: issue.user.id
  }).then(({ data: user }) => {
    convo.setVar('user', user);

    convo.addMessage({
      text: 'Detalles de la issue:',
      attachments: [
        {
          title: `${user.login} (${user.email})`,
          author_name: user.name,
          author_link: user.url,
          author_icon: 'https://cdn1.iconfinder.com/data/icons/freeline/32/account_friend_human_man_member_person_profile_user_users-256.png',
          image_url: user.avatar_url
        },
        {
          title: 'Texto:',
          text: issue.body,
          ts: new Date(issue.created_at).getTime()
        }
      ],
      action: 'ask_action'
    }, 'show_issue');

    convo.addQuestion({
      text: 'What do you want to do? Type your answer below this message...',
      attachments: [
        {
          text: '** There are 3 possible options (type your answer below): accept the issue, reject it or ask for data',
          color: '#3AA3E3'
        }
      ]
    }, (response, convoAsk) => {
      if (response.topIntent && response.topIntent.intent) {
        switch(response.topIntent.intent) {
        case intents.accept:
          acceptIssue(issue, user).then(() => {
            convoAsk.gotoThread('accept_issue');
            convoAsk.next();
          }).catch(() => {
            convoAsk.gotoThread('error_accept_issue');
            convoAsk.next();
          });
          break;
        case intents.reject:
          rejectIssue(issue).then((arg) => {
            convoAsk.gotoThread('reject_issue');
            convoAsk.next();
          }).catch((arg) => {
            convoAsk.gotoThread('error_reject_issue');
            convoAsk.next();
          });
          break;
        case intents.ask:
          convoAsk.gotoThread('write_comment');
          break;
        default:
          convoAsk.repeat();
        }
      }
    }, {}, 'ask_action');

    convo.addQuestion({
      text: 'Now, write what you want to ask to {{vars.user.name}}'
    }, (response, convoAsk) => {
      const body = response.text;

      if (body) {
        commentIssue(issue, body).then(() => {
          convoAsk.gotoThread('comment_issue');
          convoAsk.next();
        }).catch(() => {
          convoAsk.gotoThread('error_comment_issue');
          convoAsk.next();
        });
      } else {
        convoAsk.repeat();
        convoAsk.next();
      }
    }, {}, 'write_comment');

    convo.addMessage({
      text: 'Your message was sent :+1:'
    }, 'comment_issue');

    convo.addMessage({
      text: 'There was an error sending your message :(',
      action: 'write_comment'
    }, 'error_comment_issue');

    convo.addMessage({
      text: 'The issue was accepted :+1:'
    }, 'accept_issue');

    convo.addMessage({
      text: 'There was an error accepting the issue :(',
      action: 'ask_action'
    }, 'error_accept_issue');

    convo.addMessage({
      text: 'The issue was rejected :+1:'
    }, 'reject_issue');

    convo.addMessage({
      text: 'There was an error rejecting the issue :(',
      action: 'ask_action'
    }, 'error_reject_issue');
  });
};
