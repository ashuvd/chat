const View = require('./view.js');
const handleDrop = require('./scripts/functions.js')

exports.authRoute = function () {
  const app = document.querySelector('.app');
  app.innerHTML = View.render('auth', {});
}
exports.chatRoute = function (user, users, messages, socket) {
  const app = document.querySelector('.app');

  app.innerHTML = View.render('chat', { user, users, messages });

  const button = document.querySelector('.chat__button');

  button.addEventListener('click', e => {
    e.preventDefault();
    let input = e.target.previousElementSibling;
    socket.emit('chat message', input.value, user.login);
  })

  const overlay = document.querySelector('.overlay');
  const dragArea = document.querySelector('.dragarea');
  const dragPhoto = document.querySelector('.dragarea__photo');

  ['dragover', 'dragleave', 'drop'].forEach(eventName => {
    dragArea.addEventListener(eventName, function(e) {
      e.preventDefault();
      e.stopPropagation();
    }, false)
  });
  ['dragenter', 'dragover'].forEach(eventName => {
    dragArea.addEventListener(eventName, function() {dragPhoto.classList.add('highlight')}, false)
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dragArea.addEventListener(eventName, function() {dragPhoto.classList.remove('highlight')}, false)
  });
  dragArea.addEventListener('drop', function(e) {
    handleDrop.handleDrop(e, user.login);
  }, false);
  const loadImageButton = document.querySelector('.member_current').firstElementChild;
  loadImageButton.addEventListener('click', e => {
    e.preventDefault();
    overlay.classList.add('show');
  })
  const overlayCloseButton = document.querySelector('.overlay__button_close');
  overlayCloseButton.addEventListener('click', e => {
    e.preventDefault();
    overlay.classList.remove('show');
  })
}