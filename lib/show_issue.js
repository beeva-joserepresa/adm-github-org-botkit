const debug = require('debug')('botkit:list_issues');
const luis = require('botkit-middleware-luis');
const github = require('../lib/github');
const {
  commands,
  callbacks,
  actions,
  intents
} = require('../lib/constants');

function getUser(id) {
  return new Promise((resolve, reject) => {
    github.users.getById({
      id
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      console.log(res)
      resolve(res);
    });
  });
}

function showIssueConvo(convo) {
  const issue = convo.vars.issue;

  console.log('issue', issue);
  return getUser(issue.user.id).then(({ data: user }) => {
    convo.setVar('user', user);

    convo.addQuestion({
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
        },
        {
          title: 'What do you want to do? Type your answer below this message...',
          text: '** There are 3 possible options (type your answer below): accept the issue, reject it or ask for data',
          // callback_id: callbacks.showIssue,
          color: '#3AA3E3',
          // attachment_type: 'default',
          // actions: [
          //   {
          //     name: actions.accept,
          //     text: 'Accept',
          //     type: 'button',
          //     style: 'good',
          //     value: actions.accept
          //   },
          //   {
          //     name: actions.reject,
          //     text: 'Reject',
          //     type: 'button',
          //     style: 'danger',
          //     value: actions.reject
          //   },
          //   {
          //     name: actions.ask,
          //     text: 'Ask more data',
          //     type: 'button',
          //     value: actions.ask
          //   }
          // ]
        }
      ]
    }, (response, convoAsk) => {
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
          break;
        }
      }
      convoAsk.next();
    }, {}, 'show_issue');
  });
}


module.exports = showIssueConvo;
