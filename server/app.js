const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'public', 'upload')});
const db = require('./models/db')();
const emitter = require('./services/emitter');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.any());

app.use('/api', require('./routes/api'));

const clients = {};

io.on('connection', function(socket){
  let login = socket.handshake.headers['login'];
  let name = socket.handshake.headers['name'];
  let users = db.stores.file.store.users;
  console.log('user connected, socket.id: ', socket.id);
  if (users[login]) {
    clients[login] = users[login];
  } else {
    clients[login] = {id: socket.id, login, name, photo: path.join('/', 'img', 'noimage.png'), messages: []};
    users[login] = clients[login];
  }
  db.set('users', users);

  socket.emit('all users', clients);
  emitter.on('add_photo', (photo, login) => {
    clients[login]['photo'] = photo;
    socket.emit('all users', clients);
  });

  socket.broadcast.emit('new user', clients);

  socket.on('chat message', (message, receiveLogin) => {
    // socket.to(socketId).emit('chat message', message, clients[login].id);
    if (receiveLogin === login) {
      clients[login].messages.push({
        message,
        time: new Date()
      })
      users[login] = clients[login]; // сохраняем клиента в бд
      db.set('users', users);
      socket.emit('chat message', clients);
      socket.broadcast.emit('chat message', clients);
    }
  });

  socket.on('disconnect', () => {
    delete clients[login];
    socket.broadcast.emit('all users', clients);
  });
});

http.listen(3101, function(){
  console.log('listening on *:3101');
});