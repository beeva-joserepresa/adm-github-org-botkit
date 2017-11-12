const debug = require('debug')('botkit:list_issues');
const github = require('../github');
const commentIssue = require('./comment_issue');
const { intents } = require('../constants');

function getUser(id) {
  return new Promise((resolve, reject) => {
    github.users.getById({
      id
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

  return getUser(issue.user.id).then(({ data: user }) => {
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
      console.log(response.topIntent)
      if (response.topIntent && response.topIntent.intent) {
        switch(response.topIntent.intent) {
        case intents.accept:
          console.log('accept')
          break;
        case intents.reject:
          console.log('reject')
          break;
        case intents.ask:
          console.log('ask')
          convoAsk.gotoThread('write_comment');
          break;
        default:
          convoAsk.repeat();
        }
      }
      convoAsk.next();
    }, {}, 'ask_action');

    convo.addQuestion({
      text: 'Now, write what you want to ask to {{vars.user.name}}'
    }, (response, convoAsk) => {
      convo.setVar('question', response.text);
      if (response.text) {
        commentIssue(convo).then(() => {
          convoAsk.gotoThread('comment_issue');
          convoAsk.next();
        }).catch(() => {
          convoAsk.gotoThread('error_cooment_issue');
          convoAsk.next();
        });
      } else {
        convoAsk.repeat();
        convoAsk.next();
      }
    }, {}, 'write_comment');

    convo.addMessage({
      text: 'There was an error sending your message :(',
      action: 'write_comment'
    }, 'error_cooment_issue');
  });
}


module.exports = showIssueConvo;
