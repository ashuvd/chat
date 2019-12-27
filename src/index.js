require('./main.scss');
require("./img/noimage.png");
require("./img/logo.png");
const Controller = require('./controller');

Controller.authRoute();
let user = {};
// user - текущий авторизованный user, т.е. я
// users - все подключенные пользователи кроме себя самого
function getMessages(users) {
  let messages =  Object.keys(users).reduce(function(prev, login) {
    const currentUser = users[login];
    if (currentUser.messages.length > 0) {
      return [...prev, ...currentUser.messages.map(function(message) {
        return {
          left: currentUser.login === user.login,
          photo: currentUser.photo,
          message: message.message,
          time: message.time
        }
      })];
    } else {
      return prev;
    }
  }, []);
  return messages.sort((a,b) => new Date(a.time) - new Date(b.time)).map(message => {
    const date = new Date(message.time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return {
      left: message.left,
      photo: message.photo,
      message: message.message,
      time: `${hours}:${minutes}`
    }
  });
}
function getUsers(users) {
  users = Object.keys(users).map(login => {
    return {
      id: users[login].id,
      login: users[login].login,
      name: users[login].name,
      photo: users[login].photo,
      messages: users[login].messages
    }
  });
  let indexCurrentUser = 0;
  users.forEach((element, index) => {
    if (element.login === user.login) {
      indexCurrentUser = index;
    }
  });
  const [currentUser] = users.splice(indexCurrentUser, 1);
  currentUser.current = true;
  users.unshift(currentUser);
  return users;
}

const form = document.querySelector('.form');
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  let name = this.elements.name.value;
  let login = this.elements.login.value;
  let response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ name, login })
  });
  if (response.ok) { // если HTTP-статус в диапазоне 200-299
    // получаем тело ответа (см. про этот метод ниже)
    let json = await response.json();
    user = json.data;

    const socket = io({
      transportOptions: {
        polling: {
          extraHeaders: {
            'login': user.login,
            'name': user.name
          }
        }
      }
    });

    socket.on('chat message', function (users) {
      Controller.chatRoute(user, getUsers(users), getMessages(users), socket);
      const main = document.querySelector('.main');
      main.scrollTop = main.scrollHeight;
    });

    socket.on('new user', function (users) {
      Controller.chatRoute(user, getUsers(users), getMessages(users), socket);
    });

    socket.on('all users', function (users) {
      Controller.chatRoute(user, getUsers(users), getMessages(users), socket);
    });

  } else {
    alert("Ошибка HTTP: " + response.status);
  }
})


