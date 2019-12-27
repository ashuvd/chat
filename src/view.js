module.exports = {
  render(template, data) {
    const templateName = template + '-template';
    const templateElement = document.getElementById(templateName);
    const templateSource = templateElement.innerHTML;
    const Handlebars = require('handlebars');
    Handlebars.registerHelper('amountUsers', function (users) {
      let amount = Object.keys(users).length;
      switch (amount) {
        case 1:
          amount += ' участник';
          break;
        case 2:
        case 3:
        case 4:
          amount += ' участника';
          break;
        default:
          amount += ' участников';
          break;
      }
      return amount;
    })
    Handlebars.registerHelper('lastMessage', function (messages) {
      let message =  messages.reverse()[0];
      return message ? message.message : "";
    })
    const render = Handlebars.compile(templateSource);
    return render(data);
  }
}