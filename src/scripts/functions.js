exports.handleDrop = (e, login) => {
  let dt = e.dataTransfer;
  let files = dt.files;
  this.handleFiles(files, login)
}
exports.handleFiles = (files, login) => {
  const file = files[0];
  this.previewFile(file);
  this.uploadFile(file, login);
}
exports.previewFile = file => {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = function () {
    let img = document.createElement('img');
    img.classList.add('dragarea__img');
    img.src = reader.result;
    let photoElem = document.querySelector('.dragarea__photo')
    photoElem.append(img);
  }
}
exports.uploadFile = (file, login) => {
  const overlay = document.querySelector('.overlay');
  const form = document.querySelector('.dragarea-form');
  const formSubmitHandler = e => {
    e.preventDefault();
    let url = '/api/file/upload';
    let formData = new FormData();
    formData.append('file', file);
    formData.append('login', login);
    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then(() => { 
        form.removeEventListener('submit', formSubmitHandler);
        overlay.classList.remove('show');
      })
      .catch((error) => { 
        form.removeEventListener('submit', formSubmitHandler);
        alert('Ошибка загрузки файла на сервер', error)
      })
  }
  form.addEventListener('submit', formSubmitHandler)
}