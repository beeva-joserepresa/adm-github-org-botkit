const debug = require('debug')('botkit:list_issues');
const luis = require('botkit-middleware-luis');
const github = require('../lib/github');
const {
  commands,
  callbacks,
  actions,
  intents
} = require('../lib/constants');

function getIssues() {
  return new Promise((resolve, reject) => {
    github.issues.getForRepo({
      state: 'open',
      sort: 'updated',
      owner: 'BEEVA-bots-poc',
      repo: 'access'
    }, (err, res) => {
      if (err) {
        reject(err);
      }

      resolve(res);
    });
  });
}

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

function selectIssueConvo(convo) {
  const issues = convo.vars.issues;

  convo.addQuestion('Tell me the ID of the issue that do you want to inspect', (res, convoAsk) => {
    const issue = issues.find(({ id }) => String(id) === res.text);

    convo.setVar('issue', issue);
    if (issue) {
      showIssueConvo(convo).then(() => {
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

function listIssuesConvo(convo) {
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
      selectIssueConvo(convo);
      convo.addMessage(response, 'default');
    } else {
      convo.addMessage({
        text: 'Sorry but there are not any issues'
      }, 'default');
    }

    return issues;
  });
}

module.exports = function(controller, bot, message) {
  bot.say('Let me search... :mag:');

  bot.createConversation(message, (err, convo) => {
    Promise.all([
      listIssuesConvo(convo)
    ]).then(([issues]) => {
      // if (issues.length) {
      //   selectIssueConvo(bot,convo, issues);
      // }

      convo.activate();
    });
  });
};
