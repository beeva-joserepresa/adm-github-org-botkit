module.exports = function(controller) {
  controller.studio.before('help', (convo, next) => {
    const matches = convo.source_message.text.match(/^help (.*)/i);

    if (matches) {
      if (convo.hasThread(matches[1])) {
        convo.gotoThread(matches[1]);
      }
    }

    next();
  });
};
