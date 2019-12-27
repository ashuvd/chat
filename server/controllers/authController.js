const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');
const db = require('../models/db')();
const emitter = require('../services/emitter');

exports.post = (req, res) => {
  let users = db.stores.file.store.users;
  for (const login of Object.keys(users)) {
    if (login == req.body.login) {
      res.status(200).json({data: users[login]});
      return;
    }
  }
  let user = {
    name: req.body.name,
    login: req.body.login,
    messages: []
  }
  users[user.login] = user;
  db.set('users', users);
  res.status(200).json({data: user});
}

exports.addFile = async (req, res) => {
  try {
    if (req.files.length == 0) {
      res.status(400).json({ message: 'Не переданы файлы', code: 400 });
      return;
    }
    let [file] = req.files;

    const fileName = file.originalname;
    const [extension] = fileName.indexOf('.') !== -1 ? fileName.split('.').reverse() : [''];
    const filePath = path.join('public', 'upload', uuid() + '.' + extension);

    await new Promise(function (resolve, reject) {
      fs.rename(file.path, filePath, function (err) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve();
      })
    })

    fs.access(file.path, fs.constants.F_OK, function (err) {
      if (!err) {
        fs.unlinkSync(file.path);
      } else {
        console.log(err);
      }
    })

    const dir = path.normalize('/' + filePath.substr(filePath.indexOf('upload')));

    let users = db.stores.file.store.users;
    for (const login of Object.keys(users)) {
      if (login == req.body.login) {
        users[login]['photo'] = dir;
      }
    }
    db.set('users', users);
    emitter.emit('add_photo', dir, req.body.login);
    res.status(201).json({ message: "Файл загружен", code: 201, data: dir })
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
  }
}